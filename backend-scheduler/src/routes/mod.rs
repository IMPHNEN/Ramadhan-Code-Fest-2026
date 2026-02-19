pub mod home;
pub mod user;
pub mod auth;
pub mod fetch;

use axum::Router;
use crate::state::AppState;

pub fn create_routes() -> Router<AppState> {
    Router::new()
        .merge(home::routes())
        .merge(auth::routes())
        .merge(user::routes())
        .merge(fetch::routes())
}
