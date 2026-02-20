use futures_util::{SinkExt, StreamExt};
use serde_json::{Value, json};
use std::{collections::HashMap, time::Duration};
use tokio::time::sleep;
use tokio_tungstenite::{connect_async, tungstenite::{client::IntoClientRequest, protocol::Message}};
use crate::utils::reqwest::json_to_headermap;
use crate::models::fetch::FetchResult;
use tracing::debug;


#[derive(Clone)]
pub struct WsJobs {
    timeout_duration: Duration,
}

impl WsJobs {
    pub fn new(timeout: u64) -> Self {
        Self {
            timeout_duration: Duration::from_secs(timeout),
        }
    }

    pub async fn request_response(&self, target_url: &str, payload: &Option<String>, headers: Option<Value>) -> Result<FetchResult, String> {
        let mut request = target_url
            .into_client_request()
            .map_err(|e| format!("Invalid URL or Request: {}", e))?;

        let header_map = json_to_headermap(headers).await;
        request.headers_mut().extend(header_map);

        // Connect
        let (ws_stream, response) = connect_async(request)
            .await
            .map_err(|e| format!("Failed connect to websocket: {}", e))?;

        let status_obj = response.status();
        let status_code = status_obj.as_u16() as i16;
        let mut server_headers = HashMap::new();

        for (key, value) in response.headers() {
            let val_str = value.to_str().unwrap_or("").to_string();
            server_headers.insert(key.to_string(), val_str);
        }

        let (mut write, mut read) = ws_stream.split();

        // Send Payload
        if let Some(msg_content) = payload {
            debug!("[WS] Sending payload websocket...");
            write
                .send(Message::Text(msg_content.into()))
                .await
                .map_err(|e| format!("Failed send message: {}", e))?;
        } else {
            debug!("[WS] No payload provided, directly listening...");
        }

        // Collect response (Logic Timeout)
        let mut collected_messages: Vec<String> = Vec::new();
        let sleep_timer = sleep(self.timeout_duration);
        tokio::pin!(sleep_timer);

        loop {
            tokio::select! {
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(text))) => {
                            debug!("[WS] Collecting websocket response...");
                            collected_messages.push(text.to_string());
                        }
                        Some(Ok(Message::Binary(_))) => {
                            collected_messages.push("[Binary Data]".to_string());
                        }
                        Some(Err(e)) => return Err(format!("[WS] Error: {}", e)),
                        None => break,
                        _ => {}
                    }
                }
                _ = &mut sleep_timer => {
                    debug!("[WS] Timeout reached, stopping listener.");
                    break;
                }
            }
        }

        if collected_messages.is_empty() {
            debug!("[WS] No messages received during the timeout period");
        }
        let response = collected_messages.join("\n---\n");

        let result = FetchResult{
            status_code: status_code,
            headers: json!(server_headers),
            response: response,
        };

        Ok(result)
    }
}