use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, 
    pub username: String,
    pub exp: usize,
    pub iat: usize,   
    pub token_type: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RefreshToken {
    pub token: String,
    pub user_id: i32,
    pub expires_at: DateTime<Utc>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
pub struct LoginReq {
    pub identifier: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginRes {
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Deserialize)]
pub struct RefreshTokenReq {
    pub refresh_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiKey {
    pub id: i32, 
    pub user_id: i32, 
    pub name: String,
    pub description: Option<String>,
    pub key: String,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(FromRow)]
pub struct CheckApiKey {
    pub user_id: i32, 
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CreateApiKey {
    pub user_id: i32, 
    pub name: String,
    pub description: Option<String>,
    pub key: String,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Deserialize)]
pub struct ReqCreateApiKey {
    pub name: String,
    pub description: Option<String>,
    pub expires_at: Option<i32>
}
impl ReqCreateApiKey {
    pub fn into_model(self, user_id: i32, key: String, expires_at: Option<DateTime<Utc>>) -> CreateApiKey {
        CreateApiKey {
            user_id,
            name: self.name,
            description: self.description,
            key,
            expires_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UpdateApiKey {
    pub name: Option<String>,
    pub description: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
}
#[derive(Deserialize)]
pub struct ReqUpdateApiKey {
    pub name: Option<String>,
    pub description: Option<String>,
    pub expires_at: Option<i32>
}
impl ReqUpdateApiKey {
    pub fn into_model(self, expires_at: Option<DateTime<Utc>>) -> UpdateApiKey {
        UpdateApiKey {
            name: self.name,
            description: self.description,
            expires_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RotateApiKey {
    pub key: String
}