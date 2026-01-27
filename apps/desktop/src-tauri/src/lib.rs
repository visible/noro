mod auth;
mod commands;
mod storage;
mod sync;

use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GeneratorOptions {
    length: usize,
    uppercase: bool,
    lowercase: bool,
    numbers: bool,
    symbols: bool,
}

#[derive(Debug, Serialize)]
pub struct GeneratorResult {
    password: String,
    strength: String,
}

const UPPERCASE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const NUMBERS: &[u8] = b"0123456789";
const SYMBOLS: &[u8] = b"!@#$%^&*()_+-=[]{}|;:,.<>?";

fn calculate_strength(length: usize, charset_size: usize) -> String {
    let entropy = (length as f64) * (charset_size as f64).log2();
    if entropy >= 128.0 {
        "excellent".to_string()
    } else if entropy >= 80.0 {
        "strong".to_string()
    } else if entropy >= 60.0 {
        "good".to_string()
    } else if entropy >= 40.0 {
        "fair".to_string()
    } else {
        "weak".to_string()
    }
}

#[tauri::command]
fn generate_password(options: GeneratorOptions) -> Result<GeneratorResult, String> {
    let mut charset = Vec::new();

    if options.uppercase {
        charset.extend_from_slice(UPPERCASE);
    }
    if options.lowercase {
        charset.extend_from_slice(LOWERCASE);
    }
    if options.numbers {
        charset.extend_from_slice(NUMBERS);
    }
    if options.symbols {
        charset.extend_from_slice(SYMBOLS);
    }

    if charset.is_empty() {
        return Err("at least one character type required".to_string());
    }

    let length = options.length.clamp(4, 128);
    let mut rng = rand::thread_rng();

    let password: String = (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..charset.len());
            charset[idx] as char
        })
        .collect();

    let strength = calculate_strength(length, charset.len());

    Ok(GeneratorResult { password, strength })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_password,
            auth::login,
            auth::register,
            auth::auth_get_session,
            auth::auth_logout,
            commands::store_session,
            commands::get_session,
            commands::delete_session,
            commands::store_master_key,
            commands::verify_password,
            commands::delete_master_key,
            commands::has_master_key,
            commands::store_vault,
            commands::get_vault,
            commands::delete_vault,
            commands::add_vault_entry,
            commands::update_vault_entry,
            commands::delete_vault_entry,
            commands::clear_all,
            sync::sync_fetch,
            sync::sync_create,
            sync::sync_update,
            sync::sync_delete,
            sync::sync_login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
