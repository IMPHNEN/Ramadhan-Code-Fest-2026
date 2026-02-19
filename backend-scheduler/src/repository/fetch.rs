use sqlx::{PgPool};
use crate::{models::fetch::{Api, ApiData, ApiExecute, ApiHeader, ApiMembers, CreateApi, CreateApiData, CreateApiExecute, CreateApiHeader, CreateApiMembers, UpdateApi, UpdateApiData, UpdateApiExecute, UpdateApiHeader, UpdateApiMembers}};
pub struct FetchRepository {
    pool: PgPool,
}
pub struct FetchMemberRepository {
    pool: PgPool
}
pub struct FetchExecuteRepository {
    pool: PgPool
}
pub struct FetchHeaderRepository {
    pool: PgPool
}
pub struct FetchDataRepository {
    pool: PgPool
}

impl FetchRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_job_id(&self ,job_id: &str) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"SELECT * FROM fetch_api WHERE job_id = $1"#
        )
        .bind(job_id)
        .fetch_one(&self.pool)
        .await
    }
    
    pub async fn get_by_id(&self ,id: &i32) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"SELECT * FROM fetch_api WHERE id = $1"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn get_all_fetch(&self) -> Result<Vec<Api>, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"SELECT * FROM fetch_api ORDER BY id ASC"#
        )
        .fetch_all(&self.pool)
        .await
    }

    pub async fn get_all_fetch_user(&self, user_id: i32) -> Result<Vec<Api>, sqlx::Error> {
        sqlx::query_as::<_,Api>(     
        r#"
                SELECT f.* FROM fetch_api f
                INNER JOIN fetch_api_members m ON f.id = m.fetch_id
                WHERE m.user_id = $1
                ORDER BY f.updated_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: CreateApi) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"INSERT INTO fetch_api (name, type, endpoint, method, topic, description, payload, execute_id, header_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#
        )
        .bind(data.name)
        .bind(data.r#type)
        .bind(data.endpoint)
        .bind(data.method)
        .bind(data.topic)
        .bind(data.description)
        .bind(data.payload)
        .bind(data.execute_id)
        .bind(data.header_id)
        .bind(data.is_active)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update_job_id(&self,id: i32, job_id: String) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"UPDATE fetch_api SET job_id=$2 WHERE id =$1 RETURNING *"#
        )
        .bind(id)
        .bind(job_id)
        .fetch_one(&self.pool)
        .await
    } 
    
    pub async fn update(&self,id: &i32, data: UpdateApi) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_,Api>(
            r#"
                    UPDATE fetch_api
                    SET
                        name        = COALESCE($1, name),
                        type        = COALESCE($2, type),
                        endpoint    = COALESCE($3, endpoint),
                        method      = COALESCE($4, method),
                        topic       = COALESCE($5, topic),
                        description = COALESCE($6, description),
                        payload     = COALESCE($7, payload),
                        execute_id  = COALESCE($8, execute_id),
                        header_id   = COALESCE($9, header_id),
                        is_active   = COALESCE($10, is_active)
                    WHERE id = $11
                    RETURNING *
                "#
        )
        .bind(data.name)
        .bind(data.r#type)
        .bind(data.endpoint)
        .bind(data.method)
        .bind(data.topic)
        .bind(data.description)
        .bind(data.payload)
        .bind(data.execute_id)
        .bind(data.header_id)
        .bind(data.is_active)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self, id: i32) -> Result<Api, sqlx::Error> {
        sqlx::query_as::<_, Api>(
            r#"
            DELETE FROM fetch_api
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }   

    pub async fn delete_apalis_job(&self, job_id: &String) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM apalis.jobs
            WHERE id = $1
            "#
        )
        .bind(job_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }    
}

impl FetchMemberRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {pool}
    }

    pub async fn find_member_id(&self, fetch_id: i32,user_id: i32) -> Result<ApiMembers, sqlx::Error> {
        sqlx::query_as::<_, ApiMembers> (
            r#"SELECT * FROM fetch_api_members WHERE fetch_id = $1 AND user_id = $2"#
        )
        .bind(fetch_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_members(&self, fetch_id: i32) -> Result<Vec<ApiMembers>, sqlx::Error> {
        sqlx::query_as::<_, ApiMembers> (
            r#"SELECT * FROM fetch_api_members WHERE fetch_id = $1"#
        )
        .bind(fetch_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, fetch_id: i32, data: CreateApiMembers) -> Result<ApiMembers, sqlx::Error> {
        sqlx::query_as::<_,ApiMembers>(
            r#"INSERT INTO fetch_api_members (fetch_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING *
            "#
        )
        .bind(fetch_id)
        .bind(data.user_id)
        .bind(data.role)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self,fetch_id: i32, id: i32, data: UpdateApiMembers) -> Result<ApiMembers, sqlx::Error> {
        sqlx::query_as::<_,ApiMembers>(
        r#"
                UPDATE fetch_api_members
                SET
                    role    = COALESCE($3, role)
                WHERE fetch_id =$1 AND user_id = $2
                RETURNING *
            "#
        )
        .bind(fetch_id)
        .bind(id)
        .bind(data.role)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self,fetch_id: i32, id: i32) -> Result<ApiMembers, sqlx::Error> {
        sqlx::query_as::<_, ApiMembers>(
            r#"DELETE FROM fetch_api_members WHERE fetch_id=$1 AND user_id = $2 RETURNING *"#
        )
        .bind(fetch_id)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
}

impl FetchExecuteRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {pool}
    }

    pub async fn find_by_id(&self, id: i32) -> Result<ApiExecute, sqlx::Error> {
        sqlx::query_as::<_, ApiExecute> (
            r#"SELECT * FROM fetch_api_execute WHERE id = $1"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
    
    pub async fn find_all(&self, user_id: i32) -> Result<Vec<ApiExecute>, sqlx::Error> {
        sqlx::query_as::<_, ApiExecute> (
            r#"SELECT * FROM fetch_api_execute WHERE user_id = $1"#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: CreateApiExecute) -> Result<ApiExecute, sqlx::Error> {
        sqlx::query_as::<_,ApiExecute> (
            r#"INSERT INTO fetch_api_execute (user_id, name, is_repeat, type, value)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#
        )
        .bind(data.user_id)
        .bind(data.name)
        .bind(data.is_repeat)
        .bind(data.r#type)
        .bind(data.value)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, id: i32, data: UpdateApiExecute) -> Result<ApiExecute, sqlx::Error> {
        sqlx::query_as::<_,ApiExecute>(
            r#" UPDATE fetch_api_execute
            SET name=$1, is_repeat=$2, type=$3, value=$4
            WHERE id = $5
            RETURNING *
            "#
        )
        .bind(data.name)
        .bind(data.is_repeat)
        .bind(data.r#type)
        .bind(data.value)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self, id: i32) -> Result<ApiExecute, sqlx::Error> {
        sqlx::query_as::<_,ApiExecute>(
            r#" DELETE FROM fetch_api_execute WHERE id=$1 RETURNING *"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
}

impl FetchHeaderRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {pool}
    }

    pub async fn find_by_id(&self, id: i32) -> Result<ApiHeader, sqlx::Error> {
        sqlx::query_as::<_, ApiHeader> (
            r#"SELECT * FROM fetch_api_header WHERE id = $1"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_all(&self, user_id: i32) -> Result<Vec<ApiHeader>, sqlx::Error> {
        sqlx::query_as::<_,ApiHeader> (
            r#"SELECT * FROM fetch_api_header WHERE user_id = $1"#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: CreateApiHeader) -> Result<ApiHeader, sqlx::Error>{
        sqlx::query_as::<_,ApiHeader>(
            r#" INSERT INTO fetch_api_header (user_id, name, headers)
            VALUES ($1, $2, $3)
            RETURNING *
            "#
        )
        .bind(data.user_id)
        .bind(data.name)
        .bind(data.headers)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self,id: i32, data: UpdateApiHeader) -> Result<ApiHeader, sqlx::Error>{
        sqlx::query_as::<_,ApiHeader>(
            r#"UPDATE fetch_api_header 
            SET name=$1, headers=$2 WHERE id=$3
            RETURNING *
            "#
        )
        .bind(data.name)
        .bind(data.headers)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
    
    pub async fn delete(&self, id:i32) -> Result<ApiHeader, sqlx::Error> {
        sqlx::query_as::<_,ApiHeader> (
            r#"DELETE FROM fetch_api_header WHERE id=$1 RETURNING *"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
}

impl FetchDataRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {pool}
    }

    pub async fn find_by_id(&self, id: i32) -> Result<ApiData, sqlx::Error> {
        sqlx::query_as::<_, ApiData> (
            r#"SELECT * FROM fetch_api_data WHERE id = $1"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_all(&self, fetch_id: i32) -> Result<Vec<ApiData>, sqlx::Error> {
        sqlx::query_as::<_,ApiData> (
            r#"SELECT * FROM fetch_api_data WHERE fetch_id = $1 ORDER BY updated_at DESC"#
        )
        .bind(fetch_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn create(&self, data: CreateApiData) -> Result<ApiData, sqlx::Error>{
        sqlx::query_as::<_,ApiData> (
            r#"INSERT INTO fetch_api_data (fetch_id, name, status_code, response, response_headers)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#
        )
        .bind(data.fetch_id)
        .bind(data.name)
        .bind(data.status_code)
        .bind(data.response)
        .bind(data.response_headers)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update(&self, id: i32, data: UpdateApiData) -> Result<ApiData, sqlx::Error>{
        sqlx::query_as::<_,ApiData> (
            r#"UPDATE fetch_api_data
            SET name=$1, status_code=$2, response=$3, response_headers=$4
            WHERE id=$6 RETURNING *
            "#
        )
        .bind(data.name)
        .bind(data.status_code)
        .bind(data.response)
        .bind(data.response_headers)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn delete(&self, id:i32) -> Result<ApiData, sqlx::Error> {
        sqlx::query_as::<_,ApiData> (
            r#"DELETE FROM fetch_api_data WHERE id=$1 RETURNING *"#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }
}
