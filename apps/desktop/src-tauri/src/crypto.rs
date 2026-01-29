use base64::{engine::general_purpose::STANDARD, Engine};
use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::sync::RwLock;
use thiserror::Error;

use crate::twoskd;

const SERVICE: &str = "sh.noro.app";
const VAULT_KEY_ENTRY: &str = "vault_key";
const SECRET_KEY_ENTRY: &str = "secret_key";
const SALT_ENTRY: &str = "vault_salt";

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("vault locked")]
    Locked,
    #[error("invalid password")]
    InvalidPassword,
    #[error("keyring error: {0}")]
    Keyring(String),
    #[error("encryption error")]
    Encryption,
    #[error("not setup")]
    NotSetup,
}

impl Serialize for CryptoError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetupResult {
    pub secretkey: String,
}

static VAULT_KEY: RwLock<Option<[u8; 32]>> = RwLock::new(None);

fn entry(key: &str) -> Result<Entry, CryptoError> {
    Entry::new(SERVICE, key).map_err(|e| CryptoError::Keyring(e.to_string()))
}

pub fn islocked() -> bool {
    VAULT_KEY.read().unwrap().is_none()
}

pub fn issetup() -> Result<bool, CryptoError> {
    let e = entry(VAULT_KEY_ENTRY)?;
    Ok(e.get_password().is_ok())
}

#[tauri::command]
pub fn crypto_is_locked() -> bool {
    islocked()
}

#[tauri::command]
pub fn crypto_is_setup() -> Result<bool, CryptoError> {
    issetup()
}

#[tauri::command]
pub fn crypto_setup(password: String) -> Result<SetupResult, CryptoError> {
    let secretkey = twoskd::generatesecretkey();
    let salt = twoskd::generatesalt();
    let vaultkey = twoskd::generatevaultkey();

    let auk = twoskd::deriveauk(&password, &secretkey, &salt)
        .map_err(|_| CryptoError::Encryption)?;
    let wrapped = twoskd::wrapvaultkey(&vaultkey, &auk)
        .map_err(|_| CryptoError::Encryption)?;

    entry(VAULT_KEY_ENTRY)?
        .set_password(&STANDARD.encode(&wrapped))
        .map_err(|e| CryptoError::Keyring(e.to_string()))?;

    entry(SECRET_KEY_ENTRY)?
        .set_password(&secretkey)
        .map_err(|e| CryptoError::Keyring(e.to_string()))?;

    entry(SALT_ENTRY)?
        .set_password(&STANDARD.encode(&salt))
        .map_err(|e| CryptoError::Keyring(e.to_string()))?;

    *VAULT_KEY.write().unwrap() = Some(vaultkey);

    Ok(SetupResult { secretkey })
}

#[tauri::command]
pub fn crypto_unlock(password: String, secretkey: String) -> Result<bool, CryptoError> {
    let wrapped_b64 = entry(VAULT_KEY_ENTRY)?
        .get_password()
        .map_err(|_| CryptoError::NotSetup)?;
    let wrapped = STANDARD.decode(&wrapped_b64)
        .map_err(|_| CryptoError::Encryption)?;

    let salt_b64 = entry(SALT_ENTRY)?
        .get_password()
        .map_err(|_| CryptoError::NotSetup)?;
    let salt = STANDARD.decode(&salt_b64)
        .map_err(|_| CryptoError::Encryption)?;

    let auk = twoskd::deriveauk(&password, &secretkey, &salt)
        .map_err(|_| CryptoError::InvalidPassword)?;

    let vaultkey = twoskd::unwrapvaultkey(&wrapped, &auk)
        .map_err(|_| CryptoError::InvalidPassword)?;

    *VAULT_KEY.write().unwrap() = Some(vaultkey);
    Ok(true)
}

#[tauri::command]
pub fn crypto_lock() {
    *VAULT_KEY.write().unwrap() = None;
}

#[tauri::command]
pub fn crypto_get_secret_key() -> Result<Option<String>, CryptoError> {
    match entry(SECRET_KEY_ENTRY)?.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(_) => Ok(None),
    }
}

pub fn encryptfield(itemid: &str, plaintext: &str) -> Result<String, CryptoError> {
    let vaultkey = VAULT_KEY.read().unwrap();
    let vaultkey = vaultkey.as_ref().ok_or(CryptoError::Locked)?;
    let itemkey = twoskd::deriveitemkey(vaultkey, itemid)
        .map_err(|_| CryptoError::Encryption)?;
    let encrypted = twoskd::encryptitem(plaintext.as_bytes(), &itemkey)
        .map_err(|_| CryptoError::Encryption)?;
    Ok(STANDARD.encode(&encrypted))
}

pub fn decryptfield(itemid: &str, ciphertext: &str) -> Result<String, CryptoError> {
    let vaultkey = VAULT_KEY.read().unwrap();
    let vaultkey = vaultkey.as_ref().ok_or(CryptoError::Locked)?;
    let itemkey = twoskd::deriveitemkey(vaultkey, itemid)
        .map_err(|_| CryptoError::Encryption)?;
    let encrypted = STANDARD.decode(ciphertext)
        .map_err(|_| CryptoError::Encryption)?;
    let decrypted = twoskd::decryptitem(&encrypted, &itemkey)
        .map_err(|_| CryptoError::Encryption)?;
    String::from_utf8(decrypted).map_err(|_| CryptoError::Encryption)
}

#[tauri::command]
pub fn crypto_clear() -> Result<(), CryptoError> {
    crypto_lock();
    let _ = entry(VAULT_KEY_ENTRY)?.delete_credential();
    let _ = entry(SECRET_KEY_ENTRY)?.delete_credential();
    let _ = entry(SALT_ENTRY)?.delete_credential();
    Ok(())
}
