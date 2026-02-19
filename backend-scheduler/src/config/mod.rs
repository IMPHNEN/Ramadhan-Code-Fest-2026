use std::env;
use tracing::Level;

#[derive(Clone)]
pub struct Config {
    pub port: u16,
    pub jwt_secret: String,
    pub access_ttl:u32,
    pub refresh_ttl:u32,
    pub db_url: String,
    pub concurrency:u32,
    pub migrate: bool,
    pub log_level: Level,
    pub min_job_interval: u64,
    pub ws_timeout: u64,
    pub root_username: String,
    pub root_email: String,
    pub root_password: String,
}

impl Config {
    pub fn init() -> Config {
        let port_str = env::var("APP_PORT").unwrap_or_else(|_| "8000".to_string());
        let port = port_str
            .trim()
            .parse::<u16>()
            .expect(&format!("Invalid APP_PORT: '{}'", port_str));

        let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET required");
        let access_ttl = env::var("ACCESS_TTL_IN_MINUTES").ok().and_then(|v| v.parse::<u32>().map(|v| v.max(1)).ok()).unwrap_or(15) * 60;
        let refresh_ttl = env::var("REFRESH_TTL_IN_DAYS").ok().and_then(|v| v.parse::<u32>().map(|v| v.max(1)).ok()).unwrap_or(7) * 24 * 60 * 60;
        let db_url = env::var("DATABASE_URL").expect("DATABASE_URL required");
        let concurrency = env::var("CONCURRENCY").ok().and_then(|v| v.parse::<u32>().map(|v| v.max(1)).ok()).unwrap_or(10);
        let migrate = env::var("MIGRATIONS").unwrap_or("false".to_string()).to_lowercase().parse::<bool>().unwrap_or(false);
        let log_level_str = env::var("LOG_LEVEL").unwrap_or_else(|_| "INFO".to_string()).to_uppercase();
        let min_job_interval = env::var("MIN_JOB_INTERVAL").ok().and_then(|v| v.parse::<u64>().ok()).map(|v| v.max(1)).unwrap_or(10);
        let ws_timeout = env::var("WS_TIMEOUT").ok().and_then(|v| v.parse::<u64>().ok()).map(|v| v.max(1)).unwrap_or(10);
        let root_username = env::var("ROOT_USERNAME").expect("ROOT_USERNAME required");
        let root_email = env::var("ROOT_EMAIL").expect("ROOT_EMAIL required");
        let root_password = env::var("ROOT_PASSWORD").expect("ROOT_PASSWORD required");
        
        let log_level = match log_level_str.as_str() {
            "TRACE" => Level::TRACE,
            "DEBUG" => Level::DEBUG,
            "WARN"  => Level::WARN,
            "ERROR" => Level::ERROR,
            _ => Level::INFO,
        };

        Config {
            port,
            jwt_secret,
            access_ttl,
            refresh_ttl,
            db_url,
            concurrency,
            migrate,
            log_level,
            min_job_interval,
            ws_timeout,
            root_username,
            root_email,
            root_password,
        }
    }
}