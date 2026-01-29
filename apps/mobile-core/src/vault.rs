use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
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

impl VaultItem {
    pub fn new(item_type: String, title: String, data: Vec<u8>, tags: Vec<String>, favorite: bool) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            item_type,
            title,
            data,
            revision: 1,
            favorite,
            deleted: false,
            tags,
            created: now,
            updated: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct VaultData {
    pub items: Vec<VaultItem>,
    pub updated: u64,
}

pub struct Vault {
    data: Mutex<VaultData>,
}

impl Vault {
    pub fn new() -> Self {
        Self {
            data: Mutex::new(VaultData::default()),
        }
    }

    pub fn load(&self, encrypted: Vec<u8>, key: Vec<u8>) -> Result<(), super::VaultError> {
        let decrypted =
            super::crypto::decrypt(&encrypted, &key).map_err(|_| super::VaultError::Crypto)?;
        let data: VaultData =
            serde_json::from_slice(&decrypted).map_err(|_| super::VaultError::Serialization)?;
        let mut guard = self.data.lock().unwrap();
        *guard = data;
        Ok(())
    }

    pub fn save(&self, key: Vec<u8>) -> Result<Vec<u8>, super::VaultError> {
        let guard = self.data.lock().unwrap();
        let json = serde_json::to_vec(&*guard).map_err(|_| super::VaultError::Serialization)?;
        let encrypted =
            super::crypto::encrypt(&json, &key).map_err(|_| super::VaultError::Crypto)?;
        Ok(encrypted)
    }

    pub fn create_item(
        &self,
        item_type: String,
        title: String,
        data: Vec<u8>,
        tags: Vec<String>,
        favorite: bool,
    ) -> Result<VaultItem, super::VaultError> {
        let item = VaultItem::new(item_type, title, data, tags, favorite);
        let mut guard = self.data.lock().unwrap();
        guard.items.push(item.clone());
        guard.updated = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Ok(item)
    }

    pub fn get_item(&self, id: String) -> Result<Option<VaultItem>, super::VaultError> {
        let guard = self.data.lock().unwrap();
        let item = guard.items.iter().find(|i| i.id == id && !i.deleted).cloned();
        Ok(item)
    }

    pub fn update_item(
        &self,
        id: String,
        title: Option<String>,
        data: Option<Vec<u8>>,
        tags: Option<Vec<String>>,
        favorite: Option<bool>,
    ) -> Result<VaultItem, super::VaultError> {
        let mut guard = self.data.lock().unwrap();
        let idx = guard
            .items
            .iter()
            .position(|i| i.id == id && !i.deleted)
            .ok_or(super::VaultError::NotFound)?;
        let item = &mut guard.items[idx];
        if let Some(t) = title {
            item.title = t;
        }
        if let Some(d) = data {
            item.data = d;
        }
        if let Some(t) = tags {
            item.tags = t;
        }
        if let Some(f) = favorite {
            item.favorite = f;
        }
        item.revision += 1;
        item.updated = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        guard.updated = guard.items[idx].updated;
        Ok(guard.items[idx].clone())
    }

    pub fn delete_item(&self, id: String) -> Result<(), super::VaultError> {
        let mut guard = self.data.lock().unwrap();
        let idx = guard
            .items
            .iter()
            .position(|i| i.id == id && !i.deleted)
            .ok_or(super::VaultError::NotFound)?;
        guard.items[idx].deleted = true;
        guard.items[idx].revision += 1;
        guard.items[idx].updated = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        guard.updated = guard.items[idx].updated;
        Ok(())
    }

    pub fn list_items(&self) -> Vec<VaultItem> {
        let guard = self.data.lock().unwrap();
        guard.items.iter().filter(|i| !i.deleted).cloned().collect()
    }

    pub fn search_items(&self, query: String) -> Vec<VaultItem> {
        let guard = self.data.lock().unwrap();
        let q = query.to_lowercase();
        guard
            .items
            .iter()
            .filter(|i| !i.deleted && i.title.to_lowercase().contains(&q))
            .cloned()
            .collect()
    }
}

impl Default for Vault {
    fn default() -> Self {
        Self::new()
    }
}
