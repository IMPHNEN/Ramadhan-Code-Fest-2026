use axum::{extract::FromRequestParts, http::{request::Parts, header}};
use chrono::Utc;
use crate::state::AppState;
use crate::utils::{response::*, auth::verify_access_token};
use crate::models::{user::User, auth::CheckApiKey}; 

pub struct AuthUser(pub User);
pub struct AuthAdmin(pub User);

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let user = fetch_user_from_request(parts, state).await?;
        Ok(AuthUser(user))
    }
}

impl FromRequestParts<AppState> for AuthAdmin {
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let uri = parts.uri.clone();
        let user = fetch_user_from_request(parts, state).await.map_err(|e|e.with_path(&uri))?;

        if !user.is_superuser {
            return Err(AppError::Forbidden("Insufficient permissions: Superuser required".to_string()).with_path(&uri));
        }

        Ok(AuthAdmin(user))
    }
}

async fn fetch_user_from_request(parts: &Parts, state: &AppState) -> Result<User, AppError> {
    let api_key_header = parts.headers.get("x-api-key");
    let auth_header = parts.headers.get(header::AUTHORIZATION);

    let user_id = if let Some(api_key_val) = api_key_header {
        // API KEY
        let key_str = api_key_val.to_str()
            .map_err(|_| AppError::AuthError("Invalid API Key format".to_string()))?;

        let record = sqlx::query_as::<_,CheckApiKey>(
            r#"SELECT user_id,expires_at FROM user_api_keys WHERE key = $1"#
        )
        .bind(key_str)
        .fetch_optional(&state.database)
        .await
        .map_err(|e| AppError::InternalError(e.to_string()))?
        .ok_or(AppError::AuthError("Invalid API Key".to_string()))?;

        let today = Utc::now();

        if let Some(expired_time) = record.expires_at {
            if expired_time < today {
                return Err(AppError::AuthError("Expired API Key!".to_string()));
            }
        }

        record.user_id

    } else if let Some(auth_val) = auth_header {
        // BEARER TOKEN (JWT)
        let auth_str = auth_val.to_str()
            .map_err(|_| AppError::AuthError("Invalid header format".to_string()))?;

        if !auth_str.starts_with("Bearer ") {
            return Err(AppError::AuthError("Invalid Bearer token".to_string()));
        }

        let token = &auth_str[7..];

        let claims = verify_access_token(&state.app_config.secret, token)
            .map_err(|_| AppError::AuthError("Invalid or expired token".to_string()))?;

        claims.sub.parse::<i32>()
            .map_err(|_| AppError::AuthError("Invalid ID format in token".to_string()))?

    } else {
        return Err(AppError::AuthError("Missing Authorization or x-api-key header".to_string()));
    };

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(user_id)
        .fetch_optional(&state.database)
        .await
        .map_err(|e| AppError::InternalError(e.to_string()))?
        .ok_or(AppError::AuthError("User not found".to_string()))?;

    Ok(user)
}