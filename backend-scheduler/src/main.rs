use axum::serve;
use dotenvy::dotenv;
use scheduler::{
    config::*, create_app, db::postgres::{self, create_root_user, migrate_app}, jobs::{cleaner::start_job_cleaner, websocket::{WsJobs}, workers::setup_background_workers}, models::fetch::Api, state::{AppConfig, AppState}
};
use std::sync::Arc;
use apalis_sql::postgres::PostgresStorage;

use tracing::{info, error};
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Config
    dotenv().ok();
    let config = Config::init(); 
    tracing_subscriber::fmt()
        .with_target(false)
        .with_max_level(config.log_level)
        .compact()
        .init();
    
    // Database config
    let port = config.port; 
    let pool = postgres::create_pool(config.db_url, config.concurrency).await;
    if config.migrate {
        migrate_app(&pool).await;
        let _ = create_root_user(&pool, config.root_username, config.root_email, config.root_password).await;
    }

    let app_config = AppConfig {
        secret: config.jwt_secret,
        access_ttl: config.access_ttl as i64,
        refresh_ttl: config.refresh_ttl as i64,
        concurrency: config.concurrency,

    };

    // Apalis config
    let apalis_config = apalis_sql::Config::default()
        .set_poll_interval(std::time::Duration::from_secs(config.min_job_interval));

    let scheduler_storage =
        PostgresStorage::<Api>::new_with_config(pool.clone(), apalis_config);
    
    // Http request
    let http_client = reqwest::Client::builder()
        .user_agent("Teknohole/1.0")
        .timeout(std::time::Duration::from_secs(10)) 
        .pool_idle_timeout(std::time::Duration::from_secs(90))
        .pool_max_idle_per_host(10)
        .build()
        .unwrap();

    // Websocket request
    let ws_client = WsJobs::new(config.ws_timeout);
    
    //  State
    let state = AppState {
        app_config: Arc::new(app_config),
        database: pool,
        http_client: http_client,
        ws_client: ws_client,
        job_queue: scheduler_storage,
    };

    // Worker apalis
    setup_background_workers(state.clone()).await;
    let pool_for_cleaner = state.database.clone();
    tokio::spawn(async move {
        start_job_cleaner(pool_for_cleaner).await;
    });
    
    // Axum
    let addr = format!("0.0.0.0:{}", port);
    let app = create_app(state);
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(l) => l,
        Err(e) => {
            error!("Failed bind to [{}]: {:?}", port, e);
            return;
        }
    };
    
    info!("Log level [{}]", &config.log_level);
    info!("Server started at port [{}]", port);
    
    if let Err(e) = serve(listener, app).await {
        error!("Server Error: {:?}", e);
    }
}
