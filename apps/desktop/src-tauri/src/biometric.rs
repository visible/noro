use keyring::Entry;
use serde::Serialize;
use thiserror::Error;

const SERVICE: &str = "sh.noro.app";
const BIOMETRIC_KEY: &str = "biometric_vault_key";
const BIOMETRIC_ENABLED: &str = "biometric_enabled";

#[derive(Error, Debug)]
pub enum BiometricError {
    #[error("biometrics unavailable")]
    Unavailable,
    #[error("authentication failed: {0}")]
    AuthFailed(String),
    #[error("authentication cancelled")]
    Cancelled,
    #[error("keyring error: {0}")]
    Keyring(String),
    #[error("platform not supported")]
    NotSupported,
}

impl Serialize for BiometricError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[cfg(target_os = "macos")]
mod macos {
    use super::*;
    use objc::runtime::{Class, Object, BOOL, YES};
    use objc::{msg_send, sel, sel_impl};
    use std::ffi::CStr;
    use std::ptr;
    use std::sync::mpsc;

    const LA_POLICY_BIOMETRICS: i64 = 1;
    const LA_ERROR_USER_CANCEL: i64 = -2;
    const LA_ERROR_USER_FALLBACK: i64 = -3;
    const LA_ERROR_BIOMETRY_NOT_AVAILABLE: i64 = -6;
    const LA_ERROR_BIOMETRY_NOT_ENROLLED: i64 = -7;

    pub fn check_available() -> bool {
        unsafe {
            let la_context_class = match Class::get("LAContext") {
                Some(c) => c,
                None => return false,
            };
            let context: *mut Object = msg_send![la_context_class, new];
            if context.is_null() {
                return false;
            }
            let error: *mut Object = ptr::null_mut();
            let can_evaluate: BOOL = msg_send![
                context,
                canEvaluatePolicy: LA_POLICY_BIOMETRICS
                error: &error
            ];
            let _: () = msg_send![context, release];
            can_evaluate == YES
        }
    }

    pub fn authenticate(reason: &str) -> Result<bool, BiometricError> {
        if !check_available() {
            return Err(BiometricError::Unavailable);
        }

        let (tx, rx) = mpsc::channel();

        unsafe {
            let la_context_class = Class::get("LAContext").ok_or(BiometricError::Unavailable)?;
            let context: *mut Object = msg_send![la_context_class, new];
            if context.is_null() {
                return Err(BiometricError::Unavailable);
            }

            let ns_string_class = Class::get("NSString").ok_or(BiometricError::Unavailable)?;
            let reason_cstring = std::ffi::CString::new(reason).unwrap();
            let reason_ns: *mut Object = msg_send![
                ns_string_class,
                stringWithUTF8String: reason_cstring.as_ptr()
            ];

            let tx_clone = tx.clone();

            let block = block::ConcreteBlock::new(move |success: BOOL, error: *mut Object| {
                if success == YES {
                    let _ = tx_clone.send(Ok(true));
                } else if !error.is_null() {
                    let code: i64 = msg_send![error, code];
                    let result = match code {
                        LA_ERROR_USER_CANCEL | LA_ERROR_USER_FALLBACK => {
                            Err(BiometricError::Cancelled)
                        }
                        LA_ERROR_BIOMETRY_NOT_AVAILABLE | LA_ERROR_BIOMETRY_NOT_ENROLLED => {
                            Err(BiometricError::Unavailable)
                        }
                        _ => {
                            let desc: *mut Object = msg_send![error, localizedDescription];
                            let desc_utf8: *const i8 = msg_send![desc, UTF8String];
                            let msg = if !desc_utf8.is_null() {
                                CStr::from_ptr(desc_utf8).to_string_lossy().to_string()
                            } else {
                                format!("error code {}", code)
                            };
                            Err(BiometricError::AuthFailed(msg))
                        }
                    };
                    let _ = tx_clone.send(result);
                } else {
                    let _ = tx_clone.send(Err(BiometricError::AuthFailed("unknown error".into())));
                }
            });
            let block = block.copy();

            let _: () = msg_send![
                context,
                evaluatePolicy: LA_POLICY_BIOMETRICS
                localizedReason: reason_ns
                reply: &*block
            ];

            rx.recv()
                .unwrap_or(Err(BiometricError::AuthFailed("timeout".into())))
        }
    }
}

#[cfg(target_os = "windows")]
mod windows {
    use super::*;

    pub fn check_available() -> bool {
        false
    }

    pub fn authenticate(_reason: &str) -> Result<bool, BiometricError> {
        Err(BiometricError::NotSupported)
    }
}

#[cfg(target_os = "linux")]
mod linux {
    use super::*;

    pub fn check_available() -> bool {
        false
    }

    pub fn authenticate(_reason: &str) -> Result<bool, BiometricError> {
        Err(BiometricError::NotSupported)
    }
}

#[cfg(target_os = "macos")]
use macos as platform;

#[cfg(target_os = "windows")]
use windows as platform;

#[cfg(target_os = "linux")]
use linux as platform;

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
mod platform {
    use super::*;

    pub fn check_available() -> bool {
        false
    }

    pub fn authenticate(_reason: &str) -> Result<bool, BiometricError> {
        Err(BiometricError::NotSupported)
    }
}

fn get_entry(key: &str) -> Result<Entry, BiometricError> {
    Entry::new(SERVICE, key).map_err(|e| BiometricError::Keyring(e.to_string()))
}

#[tauri::command]
pub fn biometric_available() -> bool {
    platform::check_available()
}

#[tauri::command]
pub fn biometric_authenticate(reason: String) -> Result<bool, BiometricError> {
    platform::authenticate(&reason)
}

#[tauri::command]
pub fn biometric_enabled() -> bool {
    get_entry(BIOMETRIC_ENABLED)
        .and_then(|e| {
            e.get_password()
                .map_err(|err| BiometricError::Keyring(err.to_string()))
        })
        .map(|v| v == "true")
        .unwrap_or(false)
}

#[tauri::command]
pub fn biometric_enable() -> Result<(), BiometricError> {
    if !platform::check_available() {
        return Err(BiometricError::Unavailable);
    }

    platform::authenticate("enable biometric unlock")?;

    let master_key =
        crate::storage::get_master_key().map_err(|e| BiometricError::Keyring(e.to_string()))?;
    let encoded = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &master_key);

    let key_entry = get_entry(BIOMETRIC_KEY)?;
    key_entry
        .set_password(&encoded)
        .map_err(|e| BiometricError::Keyring(e.to_string()))?;

    let enabled_entry = get_entry(BIOMETRIC_ENABLED)?;
    enabled_entry
        .set_password("true")
        .map_err(|e| BiometricError::Keyring(e.to_string()))?;

    Ok(())
}

#[tauri::command]
pub fn biometric_disable() -> Result<(), BiometricError> {
    let key_entry = get_entry(BIOMETRIC_KEY)?;
    let _ = key_entry.delete_credential();

    let enabled_entry = get_entry(BIOMETRIC_ENABLED)?;
    let _ = enabled_entry.delete_credential();

    Ok(())
}

#[tauri::command]
pub fn biometric_unlock() -> Result<bool, BiometricError> {
    if !biometric_enabled() {
        return Err(BiometricError::Unavailable);
    }

    platform::authenticate("unlock vault")?;

    let key_entry = get_entry(BIOMETRIC_KEY)?;
    let encoded = key_entry
        .get_password()
        .map_err(|e| BiometricError::Keyring(e.to_string()))?;

    let key_bytes = base64::Engine::decode(&base64::engine::general_purpose::STANDARD, &encoded)
        .map_err(|e| BiometricError::Keyring(e.to_string()))?;

    let master_entry =
        Entry::new(SERVICE, "master_key").map_err(|e| BiometricError::Keyring(e.to_string()))?;

    let existing = master_entry.get_password().ok();
    if let Some(combined) = existing {
        let parts: Vec<&str> = combined.split(':').collect();
        if parts.len() == 2 {
            let new_combined = format!(
                "{}:{}",
                parts[0],
                base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &key_bytes)
            );
            master_entry
                .set_password(&new_combined)
                .map_err(|e| BiometricError::Keyring(e.to_string()))?;
        }
    }

    Ok(true)
}
