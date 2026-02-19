pub mod routes;
pub mod handlers;
pub mod models;
pub mod services;
pub mod middleware;
pub mod config;
pub mod utils;
pub mod db;
pub mod repository;
pub mod jobs;
pub mod state;

use axum::Router;
use tower_http::{trace, cors, compression};
use crate::state::AppState;

pub fn create_app(state: AppState) -> Router {

    routes::create_routes()
        .with_state(state)
        .layer(trace::TraceLayer::new_for_http())
        .layer(cors::CorsLayer::permissive())
        .layer(compression::CompressionLayer::new())
}