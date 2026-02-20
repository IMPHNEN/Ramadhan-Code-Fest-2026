use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::FromRow;
use chrono::{DateTime,Utc};

// Struct for table fetch_api
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "fetch_api_type", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum ApiType {
    Rest,
    Websocket,
    // Mqtt,
    // Graphql,
}
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "fetch_api_method", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum ApiMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Api {
    pub id: i32,
    pub name: String,
    pub r#type: ApiType,
    pub endpoint: String,
    pub method: Option<ApiMethod>,
    pub topic: Option<Value>,
    pub job_id: Option<String>,
    pub description: String,
    pub payload: Option<String>,
    pub execute_id: i32,
    pub header_id: Option<i32>,
    pub is_active: bool,
    pub updated_at: DateTime<Utc>,
}
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CreateApi {
    pub name: String,
    pub r#type: Option<ApiType>,
    pub endpoint: String,
    pub method: Option<ApiMethod>,
    pub topic: Option<Value>,
    pub description: String,
    pub payload: Option<String>,
    pub execute_id: i32,
    pub header_id: Option<i32>,
    pub is_active: Option<bool>,
}
#[derive(Deserialize)]
pub struct ReqCreateApi {
    pub name: String,
    pub r#type: Option<ApiType>,
    pub endpoint: String,
    pub method: Option<ApiMethod>,
    pub topic: Option<Value>,
    pub description: String,
    pub payload: Option<Value>,
    pub execute_id: i32,
    pub header_id: Option<i32>,
    pub is_active: Option<bool>,
}
impl ReqCreateApi {
    pub fn into_model(self) -> CreateApi {
        // Value -> String
        let payload_string = match self.payload {
            Some(val) => {
                if let Some(s) = val.as_str() {
                    Some(s.to_string())
                } 
                else {
                    Some(val.to_string())
                }
            },
            None => None,
        };

        CreateApi {
            name: self.name,
            r#type: self.r#type,
            endpoint: self.endpoint,
            method: self.method,
            topic: self.topic,
            description: self.description,
            payload: payload_string, 
            execute_id: self.execute_id,
            header_id: self.header_id,
            is_active: self.is_active
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UpdateApi {
    pub name: Option<String>,
    pub r#type: Option<ApiType>,
    pub endpoint: Option<String>,
    pub method: Option<ApiMethod>,
    pub topic: Option<Value>,
    pub description: Option<String>,
    pub payload: Option<String>,
    pub execute_id: Option<i32>,
    pub header_id: Option<i32>,
    pub is_active: Option<bool>,
}

// Struct for table fetch_api_members
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "fetch_member_role", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Owner,
    Editor,
    Viewer,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiMembers {
    pub fetch_id: i32,
    pub user_id: i32,
    pub role: Option<Role>,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct CreateApiMembers {
    pub user_id: i32,
    pub role: Role,
}

#[derive(Debug, Deserialize, FromRow)]
pub struct UpdateApiMembers {
    pub role: Role, 
}

// Struct for table fetch_api_execute
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "execute_type", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum ExecuteType {
    Seconds,
    Minutes,
    Hours,
    Days,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiExecute {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub is_repeat: bool,
    pub r#type: Option<ExecuteType>,
    pub value: i64,
    pub updated_at: DateTime<Utc>,
}
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CreateApiExecute {
    pub user_id: i32,
    pub name: String,
    pub is_repeat: bool,
    pub r#type: Option<ExecuteType>,
    pub value: i64,
}

// DTO execute
#[derive(Deserialize)]
pub struct ReqCreateApiExecute {
    pub name: String,
    pub is_repeat: bool,
    pub r#type: Option<ExecuteType>,
    pub value: i64,
}
impl ReqCreateApiExecute {
    pub fn into_model(self, user_id:i32) -> CreateApiExecute {
        CreateApiExecute {
            user_id,
            name: self.name,
            is_repeat: self.is_repeat,
            r#type: self.r#type,
            value: self.value,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UpdateApiExecute {
    pub name: Option<String>,
    pub is_repeat: Option<bool>,
    pub r#type: Option<ExecuteType>,
    pub value: Option<i64>,
}

// Struct for table fetch_api_header
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiHeader {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub headers: Value,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CreateApiHeader {
    pub user_id: i32,
    pub name: String,
    pub headers: Value,
}

// DTO header
#[derive(Deserialize)]
pub struct ReqCreateApiHeader {
    pub name: String,
    pub headers: Value,
}

impl ReqCreateApiHeader {
    pub fn into_model(self, user_id: i32) -> CreateApiHeader {
        CreateApiHeader {
            user_id,
            name: self.name,
            headers: self.headers,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UpdateApiHeader {
    pub name: Option<String>,
    pub headers: Option<Value>,
}

// Struct for table fetch_api_data
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiData {
    pub id: i32,
    pub fetch_id: i32,
    pub name: String,
    pub status_code: i16,
    pub response: String,
    pub response_headers: Value,
    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ApiDataResponse {
    pub id: i32,
    pub fetch_id: i32,
    pub name: String,
    pub status_code: i16,
    pub response: Value, 
    pub response_headers: Value,
    pub updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}
// Helper Text DB Model to json response 
impl From<ApiData> for ApiDataResponse {
    fn from(data: ApiData) -> Self {
        let parsed_response: Value = serde_json::from_str(&data.response)
            .unwrap_or_else(|_| {
                Value::String(data.response) 
            });

        ApiDataResponse {
            id: data.id,
            fetch_id: data.fetch_id,
            name: data.name,
            status_code: data.status_code,
            response: parsed_response,
            response_headers: data.response_headers,
            updated_at: data.updated_at,
            created_at: data.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CreateApiData {
    pub fetch_id: i32,
    pub name: String,
    pub status_code: Option<i16>,
    pub response: Option<String>,
    pub response_headers: Option<Value>,
}
// DTO payload data
#[derive(Deserialize)]
pub struct ReqCreateApiData {
    pub name: String,
    pub payload: Option<String>,
    pub status_code: Option<i16>,
    pub response: Option<String>,
    pub response_headers: Option<Value>,
}
impl ReqCreateApiData {
    pub fn into_model(self, fetch_id: i32) -> CreateApiData {
        CreateApiData {
            fetch_id,
            name: self.name,
            status_code: self.status_code,
            response: self.response,
            response_headers: self.response_headers,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UpdateApiData {
    pub name: Option<String>,
    pub status_code: Option<i16>,
    pub response: Option<String>,
    pub response_headers: Value,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FetchResult {
    pub status_code: i16,
    pub headers: Value,
    pub response: String,
}