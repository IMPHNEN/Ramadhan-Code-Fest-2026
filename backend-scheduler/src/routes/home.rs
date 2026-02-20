use axum::{Router, routing::get};
use crate::state::AppState;

async fn home() -> &'static str {
    "Scheduler API Running"
}

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(home))
}