use axum::{extract::State, http::Uri, response::IntoResponse};
use crate::utils::{response::WebResponse, response::AppError, requests::ValidatedJson};
use crate::middleware::auth::AuthUser;
use crate::models::auth::{LoginReq, RefreshTokenReq};
use crate::services::auth::AuthService;
use crate::state::AppState;

pub async fn login_hand(
    State(state): State<AppState>,
    uri: Uri,
    ValidatedJson(data): ValidatedJson<LoginReq>
) -> Result<impl IntoResponse, AppError> {  
    let auth_service = AuthService::new(state);
    let response_data = auth_service.login(data).await?;

    Ok(WebResponse::ok(&uri, "Login successfuly!", response_data))
}

pub async fn refresh_hand(
    State(state): State<AppState>,
    uri: Uri,
    ValidatedJson(data): ValidatedJson<RefreshTokenReq>
) -> Result<impl IntoResponse, AppError> {
    let auth_service = AuthService::new(state);
    let response_data = auth_service.refresh(data.refresh_token).await?;

    Ok(WebResponse::ok(&uri, "Refresh successfuly!", response_data))
}

pub async fn logout_hand(
    State(state): State<AppState>,
    uri: Uri,
    AuthUser(_): AuthUser,
    ValidatedJson(data):  ValidatedJson<RefreshTokenReq>
) -> Result<impl IntoResponse, AppError> {
    let auth_service = AuthService::new(state);
    auth_service.logout(data.refresh_token).await?;

    Ok(WebResponse::ok_empty(&uri, "Logout successfuly!"))
}