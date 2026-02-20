use axum::routing::{get, post, delete, patch};
use axum::Router;
use crate::handlers::fetch::*;
use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/fetch", get(get_all))
        .route("/fetch", post(create_fetch_api))
        .route("/fetch/{id}", get(get_fetch_api))
        .route("/fetch/{id}", patch(update_fetch_api))
        .route("/fetch/{id}", delete(delete_fetch_api))

        .route("/fetch/{job_id}/job", get(get_fetch_job))

        .route("/fetch/{fetch_id}/member", get(get_all_member))
        .route("/fetch/{fetch_id}/member", post(create_fetch_member))
        .route("/fetch/{fetch_id}/member/{id}", get(get_fetch_member))
        .route("/fetch/{fetch_id}/member/{id}", patch(update_fetch_member))
        .route("/fetch/{fetch_id}/member/{id}", delete(delete_fetch_member))
        
        .route("/fetch/{fetch_id}/data", post(create_fetch_data))
        .route("/fetch/{fetch_id}/data", get(get_all_data))
        .route("/fetch/{fetch_id}/data/{id}", get(get_fetch_data))
        .route("/fetch/{fetch_id}/data/{id}", patch(update_fetch_data))
        .route("/fetch/{fetch_id}/data/{id}", delete(delete_fetch_data))

        .route("/fetch/execute", get(get_all_execute))
        .route("/fetch/execute", post(create_fetch_execute))
        .route("/fetch/execute/{id}", get(get_fetch_execute))
        .route("/fetch/execute/{id}", patch(update_fetch_execute))
        .route("/fetch/execute/{id}", delete(delete_fetch_execute))

        .route("/fetch/header", get(get_all_header))
        .route("/fetch/header", post(create_fetch_header))
        .route("/fetch/header/{id}", get(get_fetch_header))
        .route("/fetch/header/{id}", patch(update_fetch_header))
        .route("/fetch/header/{id}", delete(delete_fetch_header))

}