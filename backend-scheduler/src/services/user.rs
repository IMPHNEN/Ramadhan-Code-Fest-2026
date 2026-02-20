use axum::{extract::{FromRef, FromRequestParts},http::request::Parts};
use crate::utils::response::*;
use crate::{repository::user::UserRepository, state::AppState};
use crate::models::user::*;

#[allow(dead_code)]
pub struct UserService {
    user_repo: UserRepository,
    state: AppState,
}

impl UserService {
    pub fn new(state: AppState)-> Self {
        let user_repo = UserRepository::new(state.database.clone());
        Self { user_repo, state }
    }

    pub async fn get_profile(&self, user: &User) -> Result<UserProfile, AppError> {

        Ok(UserProfile { id: user.id, username: user.username.clone(), email: user.email.clone(), is_superuser: user.is_superuser, created_at: user.created_at, updated_at: user.updated_at })
    }

    pub async fn update_profile(&self, current_user: &User, req: &UpdateProfileReq) -> Result<UserProfile, AppError> {    
        let new_username = req.username
            .as_ref()
            .unwrap_or(&current_user.username)
            .clone();

        let new_email = req.email
            .as_ref()
            .unwrap_or(&current_user.email)
            .clone();

        let user_to_save = User {
            id: current_user.id,
            username: new_username,
            email: new_email,
            is_superuser: current_user.is_superuser,
            password: current_user.password.clone(),
            created_at: current_user.created_at,
            updated_at: current_user.updated_at,
        };

        let updated_user_db = self.user_repo.update_profile(user_to_save).await?;

        Ok(UserProfile::from(updated_user_db))
    }

    pub async fn get_all_user(&self) -> Result<Vec<User>, AppError> {
        let users = self.user_repo.get_all().await?;

        Ok(users)
    }

    pub async fn add_user(&self, data: UserReq) -> Result<User, AppError> {
        let password_to_hash = data.password.clone().ok_or(AppError::BadRequest("Password is required for new user".to_string()))?;
        let password_hash = tokio::task::spawn_blocking(move || {
            crate::utils::hash::generate(&password_to_hash) 
        })
        .await
        .map_err(|e| AppError::InternalError(format!("Thread error: {}", e)))??;

        let user_to_save = User {
            id: 0,
            username: data.username.ok_or(AppError::BadRequest("Username is required for new user".to_string()))?,
            email: data.email.ok_or(AppError::BadRequest("Email is required for new user".to_string()))?,
            password: password_hash,
            is_superuser: data.is_superuser.ok_or(AppError::BadRequest("is_superuser is required for new user".to_string()))?,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        let created_user = self.user_repo.create(user_to_save).await?;

        Ok(created_user)
    }

    pub async fn update_user(&self, user_id: &i32, data: UserReq) -> Result<User, AppError> {
        let current_user = self.user_repo.find_by_id(&user_id).await?;

        let new_password_hash = if let Some(raw_pass) = data.password {
            let pass_to_hash = raw_pass.clone(); 
            let hash = tokio::task::spawn_blocking(move || {
                crate::utils::hash::generate(&pass_to_hash)
            })
            .await
            .map_err(|e| AppError::InternalError(e.to_string()))??;

            Some(hash)
        } else {
            None
        };

        let user_to_save = User {
            id: current_user.id,
            username: data.username.unwrap_or(current_user.username),
            email: data.email.unwrap_or(current_user.email),
            password: new_password_hash.unwrap_or(current_user.password),
            is_superuser: data.is_superuser.unwrap_or(current_user.is_superuser),
            created_at: current_user.created_at,
            updated_at: chrono::Utc::now(),
        };

        let updated_user = self.user_repo.update(user_to_save).await?;

        Ok(updated_user)
    }

    pub async fn delete_user(&self, user_id: &i32) -> Result<UserProfile, AppError> {
        let delete_user = self.user_repo.delete(user_id).await?;
        Ok(UserProfile::from(delete_user))
    }
}


impl<S> FromRequestParts<S> for UserService
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        
        Ok(UserService::new(state))
    }
}