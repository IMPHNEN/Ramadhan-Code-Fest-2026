use sqlx::PgPool;
use crate::models::user::User;

pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: &i32) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_username(
        &self,
        username: &str,
    ) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username = $1"
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn find_by_email(
        &self,
        email: &str,
    ) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn find_by_username_or_email(
        &self,
        identifier: &str,
    ) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username = $1 OR email = $1"
        )
        .bind(identifier)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn update_profile(&self, user: User) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET username = $1,
                email = $2,
                is_superuser = $3
            WHERE id = $4
            RETURNING *
            "#
        )
        .bind(user.username)
        .bind(user.email)
        .bind(user.is_superuser)
        .bind(user.id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn get_all(&self) -> Result<Vec<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT * FROM users
            ORDER BY id ASC
            "#
        )
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: User) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (username, password, email, is_superuser)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#
        )
        .bind(data.username)
        .bind(data.password)
        .bind(data.email)
        .bind(data.is_superuser)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, data: User) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET username = $1,
                password = $2,
                email = $3,
                is_superuser = $4
            WHERE id = $5
            RETURNING *
            "#
        )
        .bind(data.username)
        .bind(data.password)
        .bind(data.email)
        .bind(data.is_superuser)
        .bind(data.id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self, user_id: &i32) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            DELETE FROM users
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
    }
}
