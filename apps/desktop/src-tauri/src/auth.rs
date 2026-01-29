use keyring::Entry;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("http error: {0}")]
    Http(String),
    #[error("keyring error: {0}")]
    Keyring(String),
    #[error("auth failed: {0}")]
    Failed(String),
}

impl Serialize for AuthError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub token: String,
    pub email: String,
}

const SERVICE: &str = "sh.noro.app";
const TOKEN_KEY: &str = "session_token";
const EMAIL_KEY: &str = "session_email";

fn get_entry(key: &str) -> Result<Entry, AuthError> {
    Entry::new(SERVICE, key).map_err(|e| AuthError::Keyring(e.to_string()))
}

#[tauri::command]
pub async fn login(
    base_url: String,
    email: String,
    password: String,
) -> Result<Session, AuthError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/auth/sign-in/email", base_url);

    #[derive(Serialize)]
    struct LoginRequest {
        email: String,
        password: String,
    }

    let body = LoginRequest {
        email: email.clone(),
        password,
    };

    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| AuthError::Http(e.to_string()))?;

    if !res.status().is_success() {
        #[derive(Deserialize)]
        struct ErrorResponse {
            message: Option<String>,
        }
        let err: ErrorResponse = res.json().await.unwrap_or(ErrorResponse {
            message: Some("login failed".into()),
        });
        return Err(AuthError::Failed(
            err.message.unwrap_or("login failed".into()),
        ));
    }

    let token = res
        .cookies()
        .find(|c| c.name() == "better-auth.session_token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| AuthError::Failed("no session token".into()))?;

    let token_entry = get_entry(TOKEN_KEY)?;
    token_entry
        .set_password(&token)
        .map_err(|e| AuthError::Keyring(e.to_string()))?;

    let email_entry = get_entry(EMAIL_KEY)?;
    email_entry
        .set_password(&email)
        .map_err(|e| AuthError::Keyring(e.to_string()))?;

    Ok(Session { token, email })
}

#[tauri::command]
pub async fn register(
    base_url: String,
    email: String,
    password: String,
    name: Option<String>,
) -> Result<Session, AuthError> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/auth/sign-up/email", base_url);

    #[derive(Serialize)]
    struct RegisterRequest {
        email: String,
        password: String,
        name: String,
    }

    let display_name =
        name.unwrap_or_else(|| email.split('@').next().unwrap_or("user").to_string());

    let body = RegisterRequest {
        email: email.clone(),
        password,
        name: display_name,
    };

    let res = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| AuthError::Http(e.to_string()))?;

    if !res.status().is_success() {
        #[derive(Deserialize)]
        struct ErrorResponse {
            message: Option<String>,
        }
        let err: ErrorResponse = res.json().await.unwrap_or(ErrorResponse {
            message: Some("registration failed".into()),
        });
        return Err(AuthError::Failed(
            err.message.unwrap_or("registration failed".into()),
        ));
    }

    let token = res
        .cookies()
        .find(|c| c.name() == "better-auth.session_token")
        .map(|c| c.value().to_string())
        .ok_or_else(|| AuthError::Failed("no session token".into()))?;

    let token_entry = get_entry(TOKEN_KEY)?;
    token_entry
        .set_password(&token)
        .map_err(|e| AuthError::Keyring(e.to_string()))?;

    let email_entry = get_entry(EMAIL_KEY)?;
    email_entry
        .set_password(&email)
        .map_err(|e| AuthError::Keyring(e.to_string()))?;

    Ok(Session { token, email })
}

#[tauri::command]
pub fn auth_get_session() -> Result<Option<Session>, AuthError> {
    let token_entry = get_entry(TOKEN_KEY)?;
    let email_entry = get_entry(EMAIL_KEY)?;

    let token = match token_entry.get_password() {
        Ok(t) => t,
        Err(_) => return Ok(None),
    };

    let email = match email_entry.get_password() {
        Ok(e) => e,
        Err(_) => return Ok(None),
    };

    Ok(Some(Session { token, email }))
}

#[tauri::command]
pub fn auth_logout() -> Result<bool, AuthError> {
    let token_entry = get_entry(TOKEN_KEY)?;
    let email_entry = get_entry(EMAIL_KEY)?;

    let _ = token_entry.delete_credential();
    let _ = email_entry.delete_credential();

    Ok(true)
}
