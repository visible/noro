use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::crypto;

#[derive(Error, Debug)]
pub enum SyncError {
    #[error("http error: {0}")]
    Http(String),
    #[error("auth error: {0}")]
    Auth(String),
    #[error("conflict: server revision {0}")]
    Conflict(i32),
    #[error("crypto error: {0}")]
    Crypto(String),
}

impl Serialize for SyncError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteItem {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub title: String,
    pub data: String,
    pub revision: i32,
    pub favorite: bool,
    pub deleted: bool,
    pub tags: Vec<RemoteTag>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteTag {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemsResponse {
    pub items: Vec<RemoteItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemResponse {
    pub item: RemoteItem,
}

fn auth_header(token: &str) -> String {
    format!("better-auth.session_token={}", token)
}

fn encryptitem(id: &str, title: &str, data: &str) -> Result<(String, String), SyncError> {
    let enctitle = crypto::encryptfield(id, title).map_err(|e| SyncError::Crypto(e.to_string()))?;
    let encdata = crypto::encryptfield(id, data).map_err(|e| SyncError::Crypto(e.to_string()))?;
    Ok((enctitle, encdata))
}

fn decryptitem(item: &mut RemoteItem) -> Result<(), SyncError> {
    item.title = crypto::decryptfield(&item.id, &item.title)
        .map_err(|e| SyncError::Crypto(e.to_string()))?;
    item.data =
        crypto::decryptfield(&item.id, &item.data).map_err(|e| SyncError::Crypto(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn sync_fetch(base_url: String, token: String) -> Result<Vec<RemoteItem>, SyncError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/vault/items", base_url);

    let res = client
        .get(&url)
        .header("cookie", auth_header(&token))
        .send()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    if res.status() == 401 {
        return Err(SyncError::Auth("session expired".into()));
    }

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(SyncError::Http(format!("{}: {}", status, body)));
    }

    let data: ItemsResponse = res
        .json()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    let mut items = data.items;
    for item in &mut items {
        decryptitem(item)?;
    }

    Ok(items)
}

#[tauri::command]
pub async fn sync_create(
    base_url: String,
    token: String,
    id: String,
    item_type: String,
    title: String,
    data: String,
    tags: Vec<String>,
    favorite: bool,
) -> Result<RemoteItem, SyncError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/vault/items", base_url);

    let (enctitle, encdata) = encryptitem(&id, &title, &data)?;

    #[derive(Serialize)]
    struct Body {
        id: String,
        #[serde(rename = "type")]
        item_type: String,
        title: String,
        data: String,
        tags: Vec<String>,
        favorite: bool,
    }

    let body = Body {
        id,
        item_type,
        title: enctitle,
        data: encdata,
        tags,
        favorite,
    };

    let res = client
        .post(&url)
        .header("cookie", auth_header(&token))
        .json(&body)
        .send()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    if res.status() == 401 {
        return Err(SyncError::Auth("session expired".into()));
    }

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(SyncError::Http(format!("{}: {}", status, body)));
    }

    let resp: ItemResponse = res
        .json()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    let mut item = resp.item;
    decryptitem(&mut item)?;

    Ok(item)
}

#[tauri::command]
pub async fn sync_update(
    base_url: String,
    token: String,
    id: String,
    title: Option<String>,
    data: Option<String>,
    tags: Option<Vec<String>>,
    favorite: Option<bool>,
) -> Result<RemoteItem, SyncError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/vault/items/{}", base_url, id);

    let enctitle = match &title {
        Some(t) => {
            Some(crypto::encryptfield(&id, t).map_err(|e| SyncError::Crypto(e.to_string()))?)
        }
        None => None,
    };

    let encdata = match &data {
        Some(d) => {
            Some(crypto::encryptfield(&id, d).map_err(|e| SyncError::Crypto(e.to_string()))?)
        }
        None => None,
    };

    #[derive(Serialize)]
    struct Body {
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        data: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tags: Option<Vec<String>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        favorite: Option<bool>,
    }

    let body = Body {
        title: enctitle,
        data: encdata,
        tags,
        favorite,
    };

    let res = client
        .put(&url)
        .header("cookie", auth_header(&token))
        .json(&body)
        .send()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    if res.status() == 401 {
        return Err(SyncError::Auth("session expired".into()));
    }

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(SyncError::Http(format!("{}: {}", status, body)));
    }

    let resp: ItemResponse = res
        .json()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    let mut item = resp.item;
    decryptitem(&mut item)?;

    Ok(item)
}

#[tauri::command]
pub async fn sync_delete(base_url: String, token: String, id: String) -> Result<bool, SyncError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/vault/items/{}", base_url, id);

    let res = client
        .delete(&url)
        .header("cookie", auth_header(&token))
        .send()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    if res.status() == 401 {
        return Err(SyncError::Auth("session expired".into()));
    }

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(SyncError::Http(format!("{}: {}", status, body)));
    }

    Ok(true)
}

#[tauri::command]
pub async fn sync_login(
    base_url: String,
    email: String,
    password: String,
) -> Result<String, SyncError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/auth/sign-in/email", base_url);

    #[derive(Serialize)]
    struct Body {
        email: String,
        password: String,
    }

    let body = Body { email, password };

    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| SyncError::Http(e.to_string()))?;

    if !res.status().is_success() {
        return Err(SyncError::Auth("invalid credentials".into()));
    }

    let token = res
        .cookies()
        .find(|c| c.name() == "better-auth.session_token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| SyncError::Auth("no session token".into()))?;

    Ok(token)
}
