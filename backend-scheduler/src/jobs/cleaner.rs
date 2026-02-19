use sqlx::PgPool;
use std::time::Duration;

/// Clean apalis.jobs
pub async fn start_job_cleaner(pool: PgPool) {
    let mut interval = tokio::time::interval(Duration::from_hours(12));

    loop {
        interval.tick().await;
        
        tracing::info!("Cleaning up old jobs...");

        let result = sqlx::query(r#"
            DELETE FROM apalis.jobs 
            WHERE status = 'Done' 
            AND done_at < NOW() - INTERVAL '1 day'
        "#)
        .execute(&pool)
        .await;

        match result {
            Ok(res) => tracing::info!("Deleted {} old jobs.", res.rows_affected()),
            Err(e) => tracing::error!("Failed to clean jobs: {:?}", e),
        }
    }
}