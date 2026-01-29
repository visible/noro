use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::vault::VaultItem;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RemoteTag {
    id: String,
    name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RemoteItem {
    id: String,
    #[serde(rename = "type")]
    item_type: String,
    title: String,
    data: String,
    revision: i32,
    favorite: bool,
    deleted: bool,
    tags: Vec<RemoteTag>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ItemsResponse {
    items: Vec<RemoteItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ItemResponse {
    item: RemoteItem,
}

fn remotetolocal(remote: &RemoteItem) -> VaultItem {
    use base64::Engine;
    let data = base64::engine::general_purpose::STANDARD
        .decode(&remote.data)
        .unwrap_or_default();
    VaultItem {
        id: remote.id.clone(),
        item_type: remote.item_type.clone(),
        title: remote.title.clone(),
        data,
        revision: remote.revision,
        favorite: remote.favorite,
        deleted: remote.deleted,
        tags: remote.tags.iter().map(|t| t.name.clone()).collect(),
        created: 0,
        updated: 0,
    }
}

pub struct SyncClient {
    base_url: String,
    token: Mutex<Option<String>>,
}

impl SyncClient {
    pub fn new(base_url: String) -> Self {
        Self {
            base_url,
            token: Mutex::new(None),
        }
    }

    pub fn set_token(&self, token: String) {
        let mut guard = self.token.lock().unwrap();
        *guard = Some(token);
    }

    fn auth_header(&self) -> Option<String> {
        let guard = self.token.lock().unwrap();
        guard
            .as_ref()
            .map(|t| format!("better-auth.session_token={}", t))
    }

    pub fn login(&self, email: String, password: String) -> Result<String, super::SyncError> {
        #[derive(Serialize)]
        struct LoginBody {
            email: String,
            password: String,
        }
        let url = format!("{}/api/auth/sign-in/email", self.base_url);
        let body = LoginBody { email, password };
        let resp = ureq::post(&url)
            .send_json(&body)
            .map_err(|_| super::SyncError::Http)?;
        let cookie = resp
            .header("set-cookie")
            .and_then(|c| {
                c.split(';')
                    .next()
                    .and_then(|s| s.strip_prefix("better-auth.session_token="))
                    .map(|s| s.to_string())
            })
            .ok_or(super::SyncError::Auth)?;
        self.set_token(cookie.clone());
        Ok(cookie)
    }

    pub fn fetch_items(&self) -> Result<Vec<VaultItem>, super::SyncError> {
        let url = format!("{}/api/v1/vault/items", self.base_url);
        let auth = self.auth_header().ok_or(super::SyncError::Auth)?;
        let resp = ureq::get(&url)
            .set("cookie", &auth)
            .call()
            .map_err(|e| match e {
                ureq::Error::Status(401, _) => super::SyncError::Auth,
                _ => super::SyncError::Http,
            })?;
        let data: ItemsResponse = resp.into_json().map_err(|_| super::SyncError::Parse)?;
        Ok(data.items.iter().map(remotetolocal).collect())
    }

    pub fn create_item(
        &self,
        item_type: String,
        title: String,
        data: Vec<u8>,
        tags: Vec<String>,
        favorite: bool,
    ) -> Result<VaultItem, super::SyncError> {
        use base64::Engine;
        #[derive(Serialize)]
        struct CreateBody {
            #[serde(rename = "type")]
            item_type: String,
            title: String,
            data: String,
            tags: Vec<String>,
            favorite: bool,
        }
        let url = format!("{}/api/v1/vault/items", self.base_url);
        let auth = self.auth_header().ok_or(super::SyncError::Auth)?;
        let body = CreateBody {
            item_type,
            title,
            data: base64::engine::general_purpose::STANDARD.encode(&data),
            tags,
            favorite,
        };
        let resp = ureq::post(&url)
            .set("cookie", &auth)
            .send_json(&body)
            .map_err(|e| match e {
                ureq::Error::Status(401, _) => super::SyncError::Auth,
                _ => super::SyncError::Http,
            })?;
        let data: ItemResponse = resp.into_json().map_err(|_| super::SyncError::Parse)?;
        Ok(remotetolocal(&data.item))
    }

    pub fn update_item(
        &self,
        id: String,
        title: Option<String>,
        data: Option<Vec<u8>>,
        tags: Option<Vec<String>>,
        favorite: Option<bool>,
    ) -> Result<VaultItem, super::SyncError> {
        use base64::Engine;
        #[derive(Serialize)]
        struct UpdateBody {
            #[serde(skip_serializing_if = "Option::is_none")]
            title: Option<String>,
            #[serde(skip_serializing_if = "Option::is_none")]
            data: Option<String>,
            #[serde(skip_serializing_if = "Option::is_none")]
            tags: Option<Vec<String>>,
            #[serde(skip_serializing_if = "Option::is_none")]
            favorite: Option<bool>,
        }
        let url = format!("{}/api/v1/vault/items/{}", self.base_url, id);
        let auth = self.auth_header().ok_or(super::SyncError::Auth)?;
        let body = UpdateBody {
            title,
            data: data.map(|d| base64::engine::general_purpose::STANDARD.encode(&d)),
            tags,
            favorite,
        };
        let resp = ureq::put(&url)
            .set("cookie", &auth)
            .send_json(&body)
            .map_err(|e| match e {
                ureq::Error::Status(401, _) => super::SyncError::Auth,
                _ => super::SyncError::Http,
            })?;
        let data: ItemResponse = resp.into_json().map_err(|_| super::SyncError::Parse)?;
        Ok(remotetolocal(&data.item))
    }

    pub fn delete_item(&self, id: String) -> Result<(), super::SyncError> {
        let url = format!("{}/api/v1/vault/items/{}", self.base_url, id);
        let auth = self.auth_header().ok_or(super::SyncError::Auth)?;
        ureq::delete(&url)
            .set("cookie", &auth)
            .call()
            .map_err(|e| match e {
                ureq::Error::Status(401, _) => super::SyncError::Auth,
                _ => super::SyncError::Http,
            })?;
        Ok(())
    }
}
