use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use crate::utils::response::AppError;

pub fn generate(text: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let hash = argon2
        .hash_password(text.as_bytes(), &salt)
        .map_err(|e| AppError::InternalError(format!("Hashing error: {}", e)))?;

    Ok(hash.to_string())
}

pub fn verify(text: &str, hash_from_db: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(hash_from_db)
        .map_err(|e| AppError::InternalError(format!("Invalid hash format: {}", e)))?;

    let argon2 = Argon2::default();

    match argon2.verify_password(text.as_bytes(), &parsed_hash) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}