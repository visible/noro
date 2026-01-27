use crate::storage::{self, VaultData, VaultEntry};

#[tauri::command]
pub fn store_session(token: String) -> Result<(), String> {
    storage::store_session(&token).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_session() -> Result<String, String> {
    storage::get_session().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_session() -> Result<(), String> {
    storage::delete_session().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn store_master_key(password: String) -> Result<(), String> {
    storage::store_master_key(&password).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn verify_password(password: String) -> Result<bool, String> {
    storage::verify_password(&password).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_master_key() -> Result<(), String> {
    storage::delete_master_key().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn has_master_key() -> bool {
    storage::get_master_key().is_ok()
}

#[tauri::command]
pub fn store_vault(data: VaultData) -> Result<(), String> {
    storage::store_vault(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_vault() -> Result<VaultData, String> {
    storage::get_vault().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_vault() -> Result<(), String> {
    storage::delete_vault().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_vault_entry(entry: VaultEntry) -> Result<(), String> {
    let mut vault = storage::get_vault().unwrap_or(VaultData {
        entries: vec![],
        updated: now(),
    });
    vault.entries.push(entry);
    vault.updated = now();
    storage::store_vault(&vault).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_vault_entry(entry: VaultEntry) -> Result<(), String> {
    let mut vault = storage::get_vault().map_err(|e| e.to_string())?;
    if let Some(existing) = vault.entries.iter_mut().find(|e| e.id == entry.id) {
        *existing = entry;
        vault.updated = now();
        storage::store_vault(&vault).map_err(|e| e.to_string())
    } else {
        Err("entry not found".into())
    }
}

#[tauri::command]
pub fn delete_vault_entry(id: String) -> Result<(), String> {
    let mut vault = storage::get_vault().map_err(|e| e.to_string())?;
    vault.entries.retain(|e| e.id != id);
    vault.updated = now();
    storage::store_vault(&vault).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_all() -> Result<(), String> {
    storage::clear_all().map_err(|e| e.to_string())
}

fn now() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
