use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde_json::Value;
use std::str::FromStr;

pub async fn json_to_headermap(json_input: Option<Value>) -> HeaderMap {
    let mut headers = HeaderMap::new();

    if let Some(Value::Object(map)) = json_input {
        for (k, v) in map {
            let header_name = match HeaderName::from_str(&k) {
                Ok(name) => name,
                Err(_) => continue,
            };

            let value_str = match v.as_str() {
                Some(s) => s.to_string(),
                None => v.to_string(),
            };

            if let Ok(header_value) = HeaderValue::from_str(&value_str) {
                headers.insert(header_name, header_value);
            }
        }
    }
    
    headers
}