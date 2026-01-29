mod crypto;
mod sync;
mod twoskd;
mod vault;

use std::sync::Arc;

uniffi::setup_scaffolding!();

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum CryptoError {
    #[error("argon2 error")]
    Argon2,
    #[error("encryption error")]
    Encryption,
    #[error("decryption error")]
    Decryption,
    #[error("invalid secret key format")]
    InvalidSecretKey,
    #[error("invalid key length")]
    InvalidKeyLength,
}

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum VaultError {
    #[error("not found")]
    NotFound,
    #[error("serialization error")]
    Serialization,
    #[error("crypto error")]
    Crypto,
}

#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum SyncError {
    #[error("http error")]
    Http,
    #[error("auth error")]
    Auth,
    #[error("conflict")]
    Conflict,
    #[error("parse error")]
    Parse,
}

#[uniffi::export]
pub fn generate_secret_key() -> String {
    twoskd::generatesecretkey()
}

#[uniffi::export]
pub fn derive_auk(password: String, secret_key: String, salt: Vec<u8>) -> Result<Vec<u8>, CryptoError> {
    twoskd::deriveauk(&password, &secret_key, &salt)
}

#[uniffi::export]
pub fn encrypt(plaintext: Vec<u8>, key: Vec<u8>) -> Result<Vec<u8>, CryptoError> {
    crypto::encrypt(&plaintext, &key)
}

#[uniffi::export]
pub fn decrypt(ciphertext: Vec<u8>, key: Vec<u8>) -> Result<Vec<u8>, CryptoError> {
    crypto::decrypt(&ciphertext, &key)
}

#[uniffi::export]
pub fn wrap_vault_key(vault_key: Vec<u8>, auk: Vec<u8>) -> Result<Vec<u8>, CryptoError> {
    twoskd::wrapvaultkey(&vault_key, &auk)
}

#[uniffi::export]
pub fn unwrap_vault_key(wrapped: Vec<u8>, auk: Vec<u8>) -> Result<Vec<u8>, CryptoError> {
    twoskd::unwrapvaultkey(&wrapped, &auk)
}

#[uniffi::export]
pub fn derive_item_key(vault_key: Vec<u8>, item_id: String) -> Result<Vec<u8>, CryptoError> {
    twoskd::deriveitemkey(&vault_key, &item_id)
}

#[uniffi::export]
pub fn generate_vault_key() -> Vec<u8> {
    crypto::generate_key()
}

#[uniffi::export]
pub fn generate_salt() -> Vec<u8> {
    crypto::generate_salt()
}

#[uniffi::export]
pub fn generate_item_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[derive(uniffi::Record)]
pub struct VaultItem {
    pub id: String,
    pub item_type: String,
    pub title: String,
    pub data: Vec<u8>,
    pub revision: i32,
    pub favorite: bool,
    pub deleted: bool,
    pub tags: Vec<String>,
    pub created: u64,
    pub updated: u64,
}

impl From<vault::VaultItem> for VaultItem {
    fn from(item: vault::VaultItem) -> Self {
        Self {
            id: item.id,
            item_type: item.item_type,
            title: item.title,
            data: item.data,
            revision: item.revision,
            favorite: item.favorite,
            deleted: item.deleted,
            tags: item.tags,
            created: item.created,
            updated: item.updated,
        }
    }
}

#[derive(uniffi::Record)]
pub struct VaultData {
    pub items: Vec<VaultItem>,
    pub updated: u64,
}

#[derive(uniffi::Object)]
pub struct Vault {
    inner: vault::Vault,
}

#[uniffi::export]
impl Vault {
    #[uniffi::constructor]
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            inner: vault::Vault::new(),
        })
    }

    pub fn load(&self, encrypted: Vec<u8>, key: Vec<u8>) -> Result<(), VaultError> {
        self.inner.load(encrypted, key)
    }

    pub fn save(&self, key: Vec<u8>) -> Result<Vec<u8>, VaultError> {
        self.inner.save(key)
    }

    pub fn create_item(
        &self,
        item_type: String,
        title: String,
        data: Vec<u8>,
        tags: Vec<String>,
        favorite: bool,
    ) -> Result<VaultItem, VaultError> {
        self.inner
            .create_item(item_type, title, data, tags, favorite)
            .map(VaultItem::from)
    }

    pub fn get_item(&self, id: String) -> Result<Option<VaultItem>, VaultError> {
        self.inner.get_item(id).map(|o| o.map(VaultItem::from))
    }

    pub fn update_item(
        &self,
        id: String,
        title: Option<String>,
        data: Option<Vec<u8>>,
        tags: Option<Vec<String>>,
        favorite: Option<bool>,
    ) -> Result<VaultItem, VaultError> {
        self.inner
            .update_item(id, title, data, tags, favorite)
            .map(VaultItem::from)
    }

    pub fn delete_item(&self, id: String) -> Result<(), VaultError> {
        self.inner.delete_item(id)
    }

    pub fn list_items(&self) -> Vec<VaultItem> {
        self.inner.list_items().into_iter().map(VaultItem::from).collect()
    }

    pub fn search_items(&self, query: String) -> Vec<VaultItem> {
        self.inner.search_items(query).into_iter().map(VaultItem::from).collect()
    }
}

#[derive(uniffi::Object)]
pub struct SyncClient {
    inner: sync::SyncClient,
}

#[uniffi::export]
impl SyncClient {
    #[uniffi::constructor]
    pub fn new(base_url: String) -> Arc<Self> {
        Arc::new(Self {
            inner: sync::SyncClient::new(base_url),
        })
    }

    pub fn set_token(&self, token: String) {
        self.inner.set_token(token)
    }

    pub fn login(&self, email: String, password: String) -> Result<String, SyncError> {
        self.inner.login(email, password)
    }

    pub fn fetch_items(&self) -> Result<Vec<VaultItem>, SyncError> {
        self.inner.fetch_items().map(|v| v.into_iter().map(VaultItem::from).collect())
    }

    pub fn create_item(
        &self,
        item_type: String,
        title: String,
        data: Vec<u8>,
        tags: Vec<String>,
        favorite: bool,
    ) -> Result<VaultItem, SyncError> {
        self.inner
            .create_item(item_type, title, data, tags, favorite)
            .map(VaultItem::from)
    }

    pub fn update_item(
        &self,
        id: String,
        title: Option<String>,
        data: Option<Vec<u8>>,
        tags: Option<Vec<String>>,
        favorite: Option<bool>,
    ) -> Result<VaultItem, SyncError> {
        self.inner
            .update_item(id, title, data, tags, favorite)
            .map(VaultItem::from)
    }

    pub fn delete_item(&self, id: String) -> Result<(), SyncError> {
        self.inner.delete_item(id)
    }
}
