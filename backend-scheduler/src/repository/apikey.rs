use sqlx::PgPool;
use crate::models::auth::{ApiKey, CreateApiKey, RotateApiKey, UpdateApiKey};
pub struct ApiKeyRepository {
    pool: PgPool,
}

impl ApiKeyRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: i32) -> Result<ApiKey, sqlx::Error> {
        sqlx::query_as::<_,ApiKey> (
            r#"SELECT * FROM user_api_keys WHERE id =$1"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_all_user(&self, user_id: i32) -> Result<Vec<ApiKey>, sqlx::Error> {
        sqlx::query_as::<_,ApiKey> (
            r#"SELECT * FROM user_api_keys WHERE user_id=$1"#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: CreateApiKey) -> Result<ApiKey, sqlx::Error> {
        sqlx::query_as::<_,ApiKey> (
            r#"INSERT INTO user_api_keys (user_id, name, description, key, expires_at)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                "#
        )
        .bind(data.user_id)
        .bind(data.name)
        .bind(data.description)
        .bind(data.key)
        .bind(data.expires_at)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self,id: i32, data: UpdateApiKey) -> Result<ApiKey, sqlx::Error> {
        sqlx::query_as::<_,ApiKey> (
            r#"UPDATE user_api_keys 
                    SET
                    name = COALESCE($1, name),
                    description = COALESCE($2, description), 
                    expires_at = $3
                    WHERE id = $4
                    RETURNING *
                "#
        )
        .bind(data.name)
        .bind(data.description)
        .bind(data.expires_at)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn rotate(&self, id: i32, new_key: String) -> Result<RotateApiKey, sqlx::Error> {
        sqlx::query_as::<_,RotateApiKey> (
            r#"UPDATE user_api_keys SET key = $1 WHERE id = $2 RETURNING key "#
        )
        .bind(new_key)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self, id: i32) -> Result<ApiKey, sqlx::Error> {
        sqlx::query_as::<_, ApiKey>(
            r#"DELETE FROM user_api_keys WHERE id = $1 RETURNING * "#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    } 
}