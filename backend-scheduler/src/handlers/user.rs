use axum::{http::Uri,response::IntoResponse};
use crate::middleware::auth::*;
use crate::models::auth::{ReqCreateApiKey, ReqUpdateApiKey};
use crate::utils::{response::*, requests::*};
use crate::models::user::*;
use crate::services::{user::UserService, auth::AuthService};

pub async fn get_profile(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: UserService,
)-> Result<impl IntoResponse, AppError>{
    let response_data = service.get_profile(&user).await?;
    let username = &response_data.username;

    Ok(WebResponse::ok(&uri, format!("Welcome {}", username).as_str(), response_data))
}

pub async fn update_profile(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: UserService,
    ValidatedJson(data): ValidatedJson<UpdateProfileReq>
) -> Result<impl IntoResponse, ApiError> {
    
    let response_data = service.update_profile(&user, &data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Profile updated successfully!", response_data))
}

pub async fn get_all_users(
    uri: Uri,
    AuthAdmin(_): AuthAdmin,
    service: UserService,
) -> Result<impl IntoResponse, ApiError> {
    let users = service.get_all_user().await.map_err(|e| e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List of all users", users))
}

pub async fn create_user(
    uri: Uri,
    AuthAdmin(_): AuthAdmin,
    service: UserService,
    ValidatedJson(data): ValidatedJson<UserReq>
) -> Result<impl IntoResponse, ApiError> {
    let user = service.add_user(data).await.map_err(|e| e.with_path(&uri))?;
    let username = &user.username;

    Ok(WebResponse::created(&uri, format!("User {username} has been created successfully!").as_str(), user))
}

pub async fn update_user(
    ValidatedPath(user_id): ValidatedPath<i32>,
    uri: Uri,
    AuthAdmin(_): AuthAdmin,
    service: UserService,
    ValidatedJson(data): ValidatedJson<UserReq>
) -> Result<impl IntoResponse, ApiError>{
    let response = service.update_user(&user_id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, format!("User with id {user_id} has been updated successfully!").as_str(), response))
}

pub async fn delete_user(
    ValidatedPath(user_id): ValidatedPath<i32>,
    uri: Uri,
    AuthAdmin(_): AuthAdmin,
    service: UserService,
) -> Result<impl IntoResponse, ApiError> {
    service.delete_user(&user_id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok_empty(&uri, format!("User with id {user_id} has been daleted successfully!").as_str()))
}

pub async fn get_all_api_key(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_all_api_keys(user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List api keys", response))
}

pub async fn create_api_key(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService,
    ValidatedJson(data): ValidatedJson<ReqCreateApiKey>,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.create_api_key(user, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Api key created!", response))
}

pub async fn get_api_key(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_api_key_by_id(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success!", response))
}

pub async fn update_api_key(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService,
    ValidatedJson(data): ValidatedJson<ReqUpdateApiKey>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.update_api_key(user, id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Api key updated!", response))
}

pub async fn delete_api_key(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_api_key(user, id).await.map_err(|e|e.with_path(&uri))?;
    
    Ok(WebResponse::ok(&uri, "Api key deleted!", response))
}

pub async fn rotate_api_key(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: AuthService
) -> Result<impl IntoResponse, ApiError> {
    let response = service.rotate_api_key(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Api key rotated!", response))
}