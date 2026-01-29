use chacha20poly1305::{
    aead::{Aead, KeyInit},
    XChaCha20Poly1305, XNonce,
};
use rand::Rng;

const NONCE_LEN: usize = 24;
const KEY_LEN: usize = 32;

pub fn encrypt(plaintext: &[u8], key: &[u8]) -> Result<Vec<u8>, super::CryptoError> {
    if key.len() != KEY_LEN {
        return Err(super::CryptoError::InvalidKeyLength);
    }
    let cipher =
        XChaCha20Poly1305::new_from_slice(key).map_err(|_| super::CryptoError::Encryption)?;
    let mut rng = rand::thread_rng();
    let nonce_bytes: [u8; NONCE_LEN] = rng.gen();
    let nonce = XNonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|_| super::CryptoError::Encryption)?;
    let mut result = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    Ok(result)
}

pub fn decrypt(ciphertext: &[u8], key: &[u8]) -> Result<Vec<u8>, super::CryptoError> {
    if key.len() != KEY_LEN {
        return Err(super::CryptoError::InvalidKeyLength);
    }
    if ciphertext.len() < NONCE_LEN + 16 {
        return Err(super::CryptoError::Decryption);
    }
    let cipher =
        XChaCha20Poly1305::new_from_slice(key).map_err(|_| super::CryptoError::Decryption)?;
    let nonce = XNonce::from_slice(&ciphertext[..NONCE_LEN]);
    let plaintext = cipher
        .decrypt(nonce, &ciphertext[NONCE_LEN..])
        .map_err(|_| super::CryptoError::Decryption)?;
    Ok(plaintext)
}

pub fn generate_key() -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let key: [u8; KEY_LEN] = rng.gen();
    key.to_vec()
}

pub fn generate_salt() -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let salt: [u8; 16] = rng.gen();
    salt.to_vec()
}
