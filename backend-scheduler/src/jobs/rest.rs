use reqwest::{Client, Method};
use serde_json::{Map, Value};
use crate::{models::fetch::{ApiMethod, FetchResult}, utils::reqwest::json_to_headermap};

pub async fn request_response(http_client: Client, target_url: &str, method: &Option<ApiMethod>, payload: &Option<String>, headers: Option<Value>) -> Result<FetchResult, String> {
    let headers_map = json_to_headermap(headers).await; 

    let req_method = match method {
        Some(ApiMethod::Get) => Method::GET,
        Some(ApiMethod::Post) => Method::POST,
        Some(ApiMethod::Put) => Method::PUT,
        Some(ApiMethod::Delete) => Method::DELETE,
        Some(ApiMethod::Patch) => Method::PATCH,
        None => Method::GET, 
        // _ => Method::GET,
    };

    let mut request_builder = http_client
        .request(req_method, target_url)
        .headers(headers_map);

    if let Some(payload) = payload {
        if !payload.is_empty() {
             request_builder = request_builder.body(payload.clone());
        }
    }

    let response = request_builder.send()
        .await.map_err(|e| format!("Failed send message: {}", e))?;

    let status_obj = response.status();
    let status_code = status_obj.as_u16() as i16;

    let mut response_headers_map = Map::new();
    for (k, v) in response.headers() {
        let key_str = k.to_string();
        let val_str = v.to_str().unwrap_or("").to_string();
        response_headers_map.insert(key_str, Value::String(val_str));
    }
    let response_headers_json = Value::Object(response_headers_map);

    let res_text = response.text()
        .await.map_err(|e| format!("Failed response message: {}", e))?;

    let result = FetchResult { 
        status_code: status_code,
        headers: response_headers_json,
        response: res_text
    };

    Ok(result)
}