use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{Algorithm, Argon2, Params, Version};
use rand::Rng;
use thiserror::Error;

const ARGON_MEMORY: u32 = 65536;
const ARGON_ITERATIONS: u32 = 3;
const ARGON_PARALLELISM: u32 = 4;
const ARGON_OUTPUT_LEN: usize = 32;
const SECRET_KEY_BYTES: usize = 20;
const NONCE_LEN: usize = 12;
const BASE32_ALPHABET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

#[derive(Error, Debug)]
pub enum TwoskdError {
    #[error("argon2 error")]
    Argon2,
    #[error("encryption error")]
    Encryption,
    #[error("decryption error")]
    Decryption,
    #[error("invalid secret key format")]
    InvalidSecretKey,
}

impl From<argon2::Error> for TwoskdError {
    fn from(_: argon2::Error) -> Self {
        TwoskdError::Argon2
    }
}

pub type Result<T> = std::result::Result<T, TwoskdError>;

fn base32encode(bytes: &[u8]) -> String {
    let mut result = String::new();
    let mut bits = 0u32;
    let mut bitcount = 0;
    for &byte in bytes {
        bits = (bits << 8) | byte as u32;
        bitcount += 8;
        while bitcount >= 5 {
            bitcount -= 5;
            let index = ((bits >> bitcount) & 0x1F) as usize;
            result.push(BASE32_ALPHABET[index] as char);
        }
    }
    if bitcount > 0 {
        let index = ((bits << (5 - bitcount)) & 0x1F) as usize;
        result.push(BASE32_ALPHABET[index] as char);
    }
    result
}

fn base32decode(encoded: &str) -> Option<Vec<u8>> {
    let mut result = Vec::new();
    let mut bits = 0u32;
    let mut bitcount = 0;
    for c in encoded.chars() {
        let index = BASE32_ALPHABET.iter().position(|&x| x as char == c)?;
        bits = (bits << 5) | index as u32;
        bitcount += 5;
        if bitcount >= 8 {
            bitcount -= 8;
            result.push((bits >> bitcount) as u8);
        }
    }
    Some(result)
}

pub fn generatesecretkey() -> String {
    let mut rng = rand::thread_rng();
    let bytes: Vec<u8> = (0..SECRET_KEY_BYTES).map(|_| rng.gen()).collect();
    let encoded = base32encode(&bytes);
    format!(
        "A3-{}-{}-{}-{}-{}-{}",
        &encoded[0..6],
        &encoded[6..12],
        &encoded[12..17],
        &encoded[17..22],
        &encoded[22..27],
        &encoded[27..]
    )
}

fn parsesecretkey(secretkey: &str) -> Result<Vec<u8>> {
    if !secretkey.starts_with("A3-") {
        return Err(TwoskdError::InvalidSecretKey);
    }
    let parts: Vec<&str> = secretkey[3..].split('-').collect();
    if parts.len() != 6 {
        return Err(TwoskdError::InvalidSecretKey);
    }
    let encoded: String = parts.join("");
    base32decode(&encoded).ok_or(TwoskdError::InvalidSecretKey)
}

pub fn deriveauk(password: &str, secretkey: &str, salt: &[u8]) -> Result<[u8; 32]> {
    let keybytes = parsesecretkey(secretkey)?;
    let mut combined = Vec::with_capacity(password.len() + keybytes.len());
    combined.extend_from_slice(password.as_bytes());
    combined.extend_from_slice(&keybytes);

    let params = Params::new(ARGON_MEMORY, ARGON_ITERATIONS, ARGON_PARALLELISM, Some(ARGON_OUTPUT_LEN))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

    let mut auk = [0u8; 32];
    argon2.hash_password_into(&combined, salt, &mut auk)?;
    Ok(auk)
}

pub fn wrapvaultkey(vaultkey: &[u8; 32], auk: &[u8; 32]) -> Result<Vec<u8>> {
    let cipher = Aes256Gcm::new_from_slice(auk).map_err(|_| TwoskdError::Encryption)?;
    let mut rng = rand::thread_rng();
    let noncebytes: [u8; NONCE_LEN] = rng.gen();
    let nonce = Nonce::from_slice(&noncebytes);
    let ciphertext = cipher.encrypt(nonce, vaultkey.as_ref()).map_err(|_| TwoskdError::Encryption)?;
    let mut wrapped = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    wrapped.extend_from_slice(&noncebytes);
    wrapped.extend_from_slice(&ciphertext);
    Ok(wrapped)
}

pub fn unwrapvaultkey(wrapped: &[u8], auk: &[u8; 32]) -> Result<[u8; 32]> {
    if wrapped.len() < NONCE_LEN + 32 + 16 {
        return Err(TwoskdError::Decryption);
    }
    let cipher = Aes256Gcm::new_from_slice(auk).map_err(|_| TwoskdError::Decryption)?;
    let nonce = Nonce::from_slice(&wrapped[..NONCE_LEN]);
    let ciphertext = &wrapped[NONCE_LEN..];
    let plaintext = cipher.decrypt(nonce, ciphertext).map_err(|_| TwoskdError::Decryption)?;
    let mut vaultkey = [0u8; 32];
    vaultkey.copy_from_slice(&plaintext);
    Ok(vaultkey)
}

pub fn deriveitemkey(vaultkey: &[u8; 32], itemid: &str) -> Result<[u8; 32]> {
    let params = Params::new(4096, 1, 1, Some(ARGON_OUTPUT_LEN))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut itemkey = [0u8; 32];
    argon2.hash_password_into(vaultkey, itemid.as_bytes(), &mut itemkey)?;
    Ok(itemkey)
}

pub fn encryptitem(data: &[u8], itemkey: &[u8; 32]) -> Result<Vec<u8>> {
    let cipher = Aes256Gcm::new_from_slice(itemkey).map_err(|_| TwoskdError::Encryption)?;
    let mut rng = rand::thread_rng();
    let noncebytes: [u8; NONCE_LEN] = rng.gen();
    let nonce = Nonce::from_slice(&noncebytes);
    let ciphertext = cipher.encrypt(nonce, data).map_err(|_| TwoskdError::Encryption)?;
    let mut result = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    result.extend_from_slice(&noncebytes);
    result.extend_from_slice(&ciphertext);
    Ok(result)
}

pub fn decryptitem(encrypted: &[u8], itemkey: &[u8; 32]) -> Result<Vec<u8>> {
    if encrypted.len() < NONCE_LEN + 16 {
        return Err(TwoskdError::Decryption);
    }
    let cipher = Aes256Gcm::new_from_slice(itemkey).map_err(|_| TwoskdError::Decryption)?;
    let nonce = Nonce::from_slice(&encrypted[..NONCE_LEN]);
    let ciphertext = &encrypted[NONCE_LEN..];
    cipher.decrypt(nonce, ciphertext).map_err(|_| TwoskdError::Decryption)
}

pub fn generatevaultkey() -> [u8; 32] {
    let mut rng = rand::thread_rng();
    rng.gen()
}

pub fn generatesalt() -> [u8; 16] {
    let mut rng = rand::thread_rng();
    rng.gen()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_secretkey_format() {
        let key = generatesecretkey();
        assert!(key.starts_with("A3-"));
        let parts: Vec<&str> = key[3..].split('-').collect();
        assert_eq!(parts.len(), 6);
    }

    #[test]
    fn test_roundtrip() {
        let password = "testpassword123";
        let secretkey = generatesecretkey();
        let salt = [0u8; 16];
        let auk = deriveauk(password, &secretkey, &salt).unwrap();
        let vaultkey = [42u8; 32];
        let wrapped = wrapvaultkey(&vaultkey, &auk).unwrap();
        let unwrapped = unwrapvaultkey(&wrapped, &auk).unwrap();
        assert_eq!(vaultkey, unwrapped);
    }
}
