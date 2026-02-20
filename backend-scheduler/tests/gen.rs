use argon2::{Argon2, PasswordHasher};
use password_hash::{SaltString, rand_core::OsRng};

#[test]
fn generate_hash() {
    let password = "admin123";

    let salt = SaltString::generate(&mut OsRng);
    let argon = Argon2::default();

    let hash = argon.hash_password(password.as_bytes(), &salt).unwrap();

    println!("Generated: {}", hash);
}
// cargo test gen -- --nocapture