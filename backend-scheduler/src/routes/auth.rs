use axum::{Router, routing::post};
use crate::handlers::auth::*;
use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/login", post(login_hand))
        .route("/logout", post(logout_hand))
        .route("/refresh/token", post(refresh_hand))
}