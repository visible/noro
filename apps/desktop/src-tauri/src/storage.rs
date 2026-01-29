use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use base64::{engine::general_purpose::STANDARD, Engine};
use keyring::Entry;
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use thiserror::Error;

const SERVICE: &str = "sh.noro.app";
const NONCE_SIZE: usize = 12;
const KEY_SIZE: usize = 32;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("keyring error: {0}")]
    Keyring(String),
    #[error("encryption error: {0}")]
    Encryption(String),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("base64 error: {0}")]
    Base64(#[from] base64::DecodeError),
    #[error("not found")]
    NotFound,
}

impl From<StorageError> for String {
    fn from(e: StorageError) -> Self {
        e.to_string()
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct VaultData {
    pub entries: Vec<VaultEntry>,
    pub updated: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct VaultEntry {
    pub id: String,
    pub title: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub url: Option<String>,
    pub notes: Option<String>,
    pub created: u64,
    pub updated: u64,
}

fn get_data_dir() -> Result<PathBuf, StorageError> {
    let dir = directories::ProjectDirs::from("sh", "noro", "app")
        .ok_or_else(|| StorageError::Io(std::io::Error::other("no data dir")))?;
    let path = dir.data_dir().to_path_buf();
    fs::create_dir_all(&path)?;
    Ok(path)
}

fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; KEY_SIZE], StorageError> {
    let salt_str =
        SaltString::encode_b64(salt).map_err(|e| StorageError::Encryption(e.to_string()))?;
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt_str)
        .map_err(|e| StorageError::Encryption(e.to_string()))?;
    let hash_bytes = hash
        .hash
        .ok_or_else(|| StorageError::Encryption("no hash".into()))?;
    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&hash_bytes.as_bytes()[..KEY_SIZE]);
    Ok(key)
}

fn encrypt(data: &[u8], key: &[u8; KEY_SIZE]) -> Result<Vec<u8>, StorageError> {
    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| StorageError::Encryption(e.to_string()))?;
    let mut nonce_bytes = [0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| StorageError::Encryption(e.to_string()))?;
    let mut result = nonce_bytes.to_vec();
    result.extend(ciphertext);
    Ok(result)
}

fn decrypt(data: &[u8], key: &[u8; KEY_SIZE]) -> Result<Vec<u8>, StorageError> {
    if data.len() < NONCE_SIZE {
        return Err(StorageError::Encryption("data too short".into()));
    }
    let cipher =
        Aes256Gcm::new_from_slice(key).map_err(|e| StorageError::Encryption(e.to_string()))?;
    let nonce = Nonce::from_slice(&data[..NONCE_SIZE]);
    let plaintext = cipher
        .decrypt(nonce, &data[NONCE_SIZE..])
        .map_err(|e| StorageError::Encryption(e.to_string()))?;
    Ok(plaintext)
}

pub fn store_session(token: &str) -> Result<(), StorageError> {
    let entry = Entry::new(SERVICE, "session").map_err(|e| StorageError::Keyring(e.to_string()))?;
    entry
        .set_password(token)
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    Ok(())
}

pub fn get_session() -> Result<String, StorageError> {
    let entry = Entry::new(SERVICE, "session").map_err(|e| StorageError::Keyring(e.to_string()))?;
    entry
        .get_password()
        .map_err(|e| StorageError::Keyring(e.to_string()))
}

pub fn delete_session() -> Result<(), StorageError> {
    let entry = Entry::new(SERVICE, "session").map_err(|e| StorageError::Keyring(e.to_string()))?;
    entry
        .delete_credential()
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    Ok(())
}

pub fn store_master_key(password: &str) -> Result<(), StorageError> {
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);
    let key = derive_key(password, &salt)?;
    let entry =
        Entry::new(SERVICE, "master_key").map_err(|e| StorageError::Keyring(e.to_string()))?;
    let combined = format!("{}:{}", STANDARD.encode(salt), STANDARD.encode(key));
    entry
        .set_password(&combined)
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    Ok(())
}

pub fn get_master_key() -> Result<Vec<u8>, StorageError> {
    let entry =
        Entry::new(SERVICE, "master_key").map_err(|e| StorageError::Keyring(e.to_string()))?;
    let combined = entry
        .get_password()
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    let parts: Vec<&str> = combined.split(':').collect();
    if parts.len() != 2 {
        return Err(StorageError::Encryption("invalid key format".into()));
    }
    Ok(STANDARD.decode(parts[1])?)
}

pub fn verify_password(password: &str) -> Result<bool, StorageError> {
    let entry =
        Entry::new(SERVICE, "master_key").map_err(|e| StorageError::Keyring(e.to_string()))?;
    let combined = entry
        .get_password()
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    let parts: Vec<&str> = combined.split(':').collect();
    if parts.len() != 2 {
        return Err(StorageError::Encryption("invalid key format".into()));
    }
    let salt = STANDARD.decode(parts[0])?;
    let stored_key = STANDARD.decode(parts[1])?;
    let derived_key = derive_key(password, &salt)?;
    Ok(derived_key.as_slice() == stored_key.as_slice())
}

pub fn delete_master_key() -> Result<(), StorageError> {
    let entry =
        Entry::new(SERVICE, "master_key").map_err(|e| StorageError::Keyring(e.to_string()))?;
    entry
        .delete_credential()
        .map_err(|e| StorageError::Keyring(e.to_string()))?;
    Ok(())
}

pub fn store_vault(data: &VaultData) -> Result<(), StorageError> {
    let key_bytes = get_master_key()?;
    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&key_bytes[..KEY_SIZE]);
    let json = serde_json::to_vec(data)?;
    let encrypted = encrypt(&json, &key)?;
    let path = get_data_dir()?.join("vault.enc");
    fs::write(path, encrypted)?;
    Ok(())
}

pub fn get_vault() -> Result<VaultData, StorageError> {
    let key_bytes = get_master_key()?;
    let mut key = [0u8; KEY_SIZE];
    key.copy_from_slice(&key_bytes[..KEY_SIZE]);
    let path = get_data_dir()?.join("vault.enc");
    if !path.exists() {
        return Err(StorageError::NotFound);
    }
    let encrypted = fs::read(path)?;
    let decrypted = decrypt(&encrypted, &key)?;
    Ok(serde_json::from_slice(&decrypted)?)
}

pub fn delete_vault() -> Result<(), StorageError> {
    let path = get_data_dir()?.join("vault.enc");
    if path.exists() {
        fs::remove_file(path)?;
    }
    Ok(())
}

pub fn clear_all() -> Result<(), StorageError> {
    let _ = delete_session();
    let _ = delete_master_key();
    let _ = delete_vault();
    Ok(())
}
