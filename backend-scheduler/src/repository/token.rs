use sqlx::PgPool;
use chrono::{DateTime, Utc};

pub struct TokenRepository {
    pool: PgPool,
}

impl TokenRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn save_token(
        &self,
        token: &str,
        user_id: i32,
        expires_at: DateTime<Utc>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO refresh_tokens (token, user_id, expires_at)
            VALUES ($1, $2, $3)
            "#
        )
        .bind(token)
        .bind(user_id)
        .bind(expires_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn exists(&self, token: &str) -> Result<bool, sqlx::Error> {
        let exists: Option<i32> = sqlx::query_scalar(
            r#"
            SELECT 1
            FROM refresh_tokens
            WHERE token = $1
            LIMIT 1
            "#
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await?;

        Ok(exists.is_some())
    }

    pub async fn revoke(&self, token: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM refresh_tokens WHERE token = $1"
        )
        .bind(token)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
