use std::time::Duration;
use std::collections::HashSet;
use sqlx::postgres::{PgPool, PgPoolOptions};
use tracing::info;
use sqlx::migrate::Migrator;

pub async fn create_pool(database_url :String, con: u32) -> PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(con)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await
        .expect("Failed connect to Posgtresql");
    
    info!("Posgtresql connected");

    pool
}
static APP_MIGRATOR: Migrator = sqlx::migrate!("./migrations");
pub async fn migrate_app(pool: &PgPool) {
    info!("Checking database migrations...");

    let applied: Vec<(i64, String)> = sqlx::query_as(
        r#"
        SELECT version, description
        FROM _sqlx_migrations
        WHERE success = true
        ORDER BY version
        "#
    )
    .fetch_all(pool)
    .await
    .unwrap_or_default();

    let applied_versions: HashSet<i64> =
        applied.iter().map(|(v, _)| *v).collect();

    // Log
    for migration in APP_MIGRATOR.migrations.iter() {
        if applied_versions.contains(&migration.version) {
            info!(
                "Migration applied : {} - {}",
                migration.version,
                migration.description
            );
        } else {
            info!(
                "Migration pending : {} - {}",
                migration.version,
                migration.description
            );
        }
    }

    APP_MIGRATOR
        .run(pool)
        .await
        .expect("App migration failed");

    info!("Database migrations completed");
}

pub async fn create_root_user(pool: &PgPool, username: String, email: String, password: String) -> Result<(), sqlx::Error> {
    let is_superuser = true;
    let password_hash = crate::utils::hash::generate(&password)
        .expect("Fatal: Failed hashing root password");
    let result = sqlx::query(
        r#"
        INSERT INTO users (username, email, password, is_superuser)
        VALUES ($1, $2, $3, $4)
        "#
    )
    .bind(&username)
    .bind(email)
    .bind(password_hash)
    .bind(is_superuser)
    .execute(pool)
    .await?;

    if result.rows_affected() > 0 {
        info!("Root user created: {}", username);
    } else {
        info!("Root user already exixts. Skipping creation.");
    }
    Ok(())
}