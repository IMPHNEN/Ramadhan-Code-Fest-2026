use axum::{extract::{FromRef, FromRequestParts}, http::request::Parts};
use crate::{models::auth::{ApiKey, CreateApiKey, ReqCreateApiKey, ReqUpdateApiKey, RotateApiKey, UpdateApiKey}, repository::apikey::ApiKeyRepository};
use crate::models::user::User; 
use crate::repository::user::*;
use crate::repository::token::*;
use crate::utils::auth::*; 
use crate::models::auth::{LoginReq, LoginRes};
use crate::state::AppState;
use crate::utils::response::AppError;
use chrono::{Duration, Utc};

#[allow(dead_code)]
pub struct AuthService {
    user_repo: UserRepository,
    token_repo: TokenRepository,
    apikey_repo: ApiKeyRepository,
    state: AppState,
}

impl AuthService {
    pub fn new(state: AppState) -> Self {
        let user_repo = UserRepository::new(state.database.clone());
        let token_repo = TokenRepository::new(state.database.clone());
        let apikey_repo = ApiKeyRepository::new(state.database.clone());
        Self { user_repo, token_repo, apikey_repo ,state }
    }
    
    pub async fn login(&self, req: LoginReq) -> Result<LoginRes, AppError> {
        let user = self.authenticate(&req.identifier, &req.password).await?;
        let expiration_time = Utc::now() + Duration::seconds(self.state.app_config.refresh_ttl); 
        let access_token = gen_access_token(&user, &self.state).await?;
        let refresh_token = gen_refresh_token(&user, &self.state).await?;
        self.token_repo.save_token(&refresh_token, user.id, expiration_time).await?;

        Ok(LoginRes { access_token, refresh_token })
    }

    pub async fn logout(&self, refresh_token_str: String) -> Result<(), AppError> {
        let _ = verify_refresh_token(&self.state.app_config.secret, &refresh_token_str)
             .map_err(|_| AppError::AuthError("Invalid token".to_string()))?;

        self.token_repo.revoke(&refresh_token_str).await?;
        
        Ok(())
    }

    pub async fn refresh(&self, token_str: String) -> Result<LoginRes, AppError> {
        let claims = verify_refresh_token(&self.state.app_config.secret, &token_str)?;
        let exists = self.token_repo.exists(&token_str)
        .await
        .map_err(|e| AppError::InternalError(e.to_string()))?;

        if !exists {
            return Err(AppError::AuthError("Refresh token has been revoked".to_string()));
        }

        let user_id = claims.sub.parse::<i32>()
            .map_err(|_| AppError::AuthError("Invalid ID format".to_string()))?;

        let user = self.user_repo.find_by_id(&user_id).await?;
        let expiration_time = Utc::now() + Duration::seconds(self.state.app_config.refresh_ttl); 
        let access_token = gen_access_token(&user, &self.state).await?;
        let refresh_token = gen_refresh_token(&user, &self.state).await?;
        self.token_repo.revoke(&token_str).await?;
        self.token_repo.save_token(&refresh_token, user_id, expiration_time).await?;

        Ok(LoginRes { access_token, refresh_token })
    }

    async fn authenticate(&self, identifier: &str, password: &str) -> Result<User, AppError> {
        let user_opt = self.user_repo.find_by_username_or_email(identifier).await?;
        let user = match user_opt {
            Some(u) => u,
            None => return Err(AppError::AuthError("Invalid identifier or password".to_string())),
        };

        let plain_password = password.to_string();
        let hash_from_db = user.password.clone();

        let is_valid = tokio::task::spawn_blocking(move || {
            crate::utils::hash::verify(&plain_password, &hash_from_db)
        })
        .await
        .map_err(|e| AppError::InternalError(format!("Hash verify failed: {}", e)))??;
 
        if !is_valid {
            return Err(AppError::AuthError("Invalid identifier or password".to_string()));
        }

        Ok(user)
    }

    pub async fn get_api_key_by_id(&self, user: User, id: i32) -> Result<ApiKey, AppError> {
        let q = self.apikey_repo.find_by_id(id)
            .await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

        if q.user_id != user.id {
            return Err(AppError::Forbidden(format!("You don't have permission to access this data")))?;
        }
        
        Ok(q)
    }

    pub async fn get_all_api_keys(&self, user: User) -> Result<Vec<ApiKey>, AppError> {
        let q = self.apikey_repo.find_all_user(user.id).await?;

        Ok(q)
    }

    pub async fn create_api_key(&self, user: User, data: ReqCreateApiKey) -> Result<ApiKey, AppError> {
        let key = generate_api_key();
        let expires_at_dt = match data.expires_at {
            Some(0) => None,
            Some(days) => Some(Utc::now() + Duration::days(days as i64)),
            None => None,
        };
        let model: CreateApiKey = data.into_model(user.id, key, expires_at_dt);

        let create = self.apikey_repo.create(model).await?;

        Ok(create)
    }

    pub async fn update_api_key(&self, user: User, id: i32, data: ReqUpdateApiKey) -> Result<ApiKey, AppError> {
        let apikey = self.apikey_repo.find_by_id(id).await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;
        if !user.is_superuser && apikey.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to update this data".to_string()));
        }

        let expires_at_dt = match data.expires_at {
            Some(0) => None,
            Some(days) => Some(Utc::now() + Duration::days(days as i64)),
            None => apikey.expires_at
        };
        let model: UpdateApiKey = data.into_model(expires_at_dt);

        let q = self.apikey_repo.update(id, model).await?;

        Ok(q)
    }

    pub async fn rotate_api_key(&self, user: User, id: i32) -> Result<RotateApiKey, AppError> {
        let apikey = self.apikey_repo.find_by_id(id).await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;
        if !user.is_superuser && apikey.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to update this data".to_string()));
        }

        let new_key = generate_api_key();
        let q = self.apikey_repo.rotate(id, new_key).await?;

        Ok(q)
    }

    pub async fn delete_api_key(&self, user: User, id: i32) -> Result<ApiKey, AppError> {
        let apikey = self.apikey_repo.find_by_id(id).await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;
        if !user.is_superuser && apikey.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to delete this data".to_string()));
        }

        let q = self.apikey_repo.delete(id).await?;

        Ok(q)
    }
}



impl<S> FromRequestParts<S> for AuthService
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        
        Ok(AuthService::new(state))
    }
}