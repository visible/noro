use argon2::{Algorithm, Argon2, Params, Version};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    XChaCha20Poly1305, XNonce,
};
use rand::Rng;

const ARGON_MEMORY: u32 = 65536;
const ARGON_ITERATIONS: u32 = 3;
const ARGON_PARALLELISM: u32 = 4;
const ARGON_OUTPUT_LEN: usize = 32;
const SECRET_KEY_BYTES: usize = 20;
const NONCE_LEN: usize = 24;
const BASE32_ALPHABET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

fn base32encode(bytes: &[u8]) -> String {
    let mut result = String::new();
    let mut bits = 0u32;
    let mut bitcount = 0;
    for &byte in bytes {
        bits = (bits << 8) | byte as u32;
        bitcount += 8;
        while bitcount >= 5 {
            bitcount -= 5;
            let index = ((bits >> bitcount) & 0x1f) as usize;
            result.push(BASE32_ALPHABET[index] as char);
        }
    }
    if bitcount > 0 {
        let index = ((bits << (5 - bitcount)) & 0x1f) as usize;
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

fn parsesecretkey(secretkey: &str) -> Result<Vec<u8>, super::CryptoError> {
    if !secretkey.starts_with("A3-") {
        return Err(super::CryptoError::InvalidSecretKey);
    }
    let parts: Vec<&str> = secretkey[3..].split('-').collect();
    if parts.len() != 6 {
        return Err(super::CryptoError::InvalidSecretKey);
    }
    let encoded: String = parts.join("");
    base32decode(&encoded).ok_or(super::CryptoError::InvalidSecretKey)
}

pub fn deriveauk(password: &str, secretkey: &str, salt: &[u8]) -> Result<Vec<u8>, super::CryptoError> {
    let keybytes = parsesecretkey(secretkey)?;
    let mut combined = Vec::with_capacity(password.len() + keybytes.len());
    combined.extend_from_slice(password.as_bytes());
    combined.extend_from_slice(&keybytes);
    let params = Params::new(ARGON_MEMORY, ARGON_ITERATIONS, ARGON_PARALLELISM, Some(ARGON_OUTPUT_LEN))
        .map_err(|_| super::CryptoError::Argon2)?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut auk = vec![0u8; 32];
    argon2
        .hash_password_into(&combined, salt, &mut auk)
        .map_err(|_| super::CryptoError::Argon2)?;
    Ok(auk)
}

pub fn wrapvaultkey(vaultkey: &[u8], auk: &[u8]) -> Result<Vec<u8>, super::CryptoError> {
    if vaultkey.len() != 32 || auk.len() != 32 {
        return Err(super::CryptoError::InvalidKeyLength);
    }
    let cipher = XChaCha20Poly1305::new_from_slice(auk).map_err(|_| super::CryptoError::Encryption)?;
    let mut rng = rand::thread_rng();
    let nonce_bytes: [u8; NONCE_LEN] = rng.gen();
    let nonce = XNonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, vaultkey)
        .map_err(|_| super::CryptoError::Encryption)?;
    let mut wrapped = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    wrapped.extend_from_slice(&nonce_bytes);
    wrapped.extend_from_slice(&ciphertext);
    Ok(wrapped)
}

pub fn unwrapvaultkey(wrapped: &[u8], auk: &[u8]) -> Result<Vec<u8>, super::CryptoError> {
    if auk.len() != 32 {
        return Err(super::CryptoError::InvalidKeyLength);
    }
    if wrapped.len() < NONCE_LEN + 32 + 16 {
        return Err(super::CryptoError::Decryption);
    }
    let cipher = XChaCha20Poly1305::new_from_slice(auk).map_err(|_| super::CryptoError::Decryption)?;
    let nonce = XNonce::from_slice(&wrapped[..NONCE_LEN]);
    let ciphertext = &wrapped[NONCE_LEN..];
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| super::CryptoError::Decryption)?;
    Ok(plaintext)
}

pub fn deriveitemkey(vaultkey: &[u8], itemid: &str) -> Result<Vec<u8>, super::CryptoError> {
    if vaultkey.len() != 32 {
        return Err(super::CryptoError::InvalidKeyLength);
    }
    let params = Params::new(4096, 1, 1, Some(ARGON_OUTPUT_LEN)).map_err(|_| super::CryptoError::Argon2)?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut itemkey = vec![0u8; 32];
    argon2
        .hash_password_into(vaultkey, itemid.as_bytes(), &mut itemkey)
        .map_err(|_| super::CryptoError::Argon2)?;
    Ok(itemkey)
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
        let vaultkey = vec![42u8; 32];
        let wrapped = wrapvaultkey(&vaultkey, &auk).unwrap();
        let unwrapped = unwrapvaultkey(&wrapped, &auk).unwrap();
        assert_eq!(vaultkey, unwrapped);
    }
}
