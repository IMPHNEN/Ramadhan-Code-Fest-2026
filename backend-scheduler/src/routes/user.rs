use axum::{Router, routing::{get, post, patch, delete}};

use crate::handlers::user::*;
use crate::state::AppState;


pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/user/me", get(get_profile))
        .route("/user/me", patch(update_profile))
        .route("/user", get(get_all_users))
        .route("/user", post(create_user))
        .route("/user/{id}", delete(delete_user))

        .route("/user/apikey", get(get_all_api_key))
        .route("/user/apikey", post(create_api_key))
        .route("/user/apikey/{id}", get(get_api_key))
        .route("/user/apikey/{id}", patch(update_api_key))
        .route("/user/apikey/{id}", delete(delete_api_key))
        .route("/user/apikey/{id}", post(rotate_api_key))
}