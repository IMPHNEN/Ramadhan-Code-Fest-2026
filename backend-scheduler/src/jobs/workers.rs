use apalis::prelude::*;
use apalis_sql::context::SqlContext;
use crate::jobs::rest;
use crate::models::fetch::{ApiType, FetchResult};
use crate::{models::fetch::{Api, CreateApiData}, repository::fetch::{FetchDataRepository, FetchExecuteRepository, FetchHeaderRepository, FetchRepository}, services::fetch::FetchService, state::AppState};

pub async fn setup_background_workers(state: AppState,) {
    let concurrency = state.app_config.concurrency.clone();
    tokio::spawn(async move {
        Monitor::new()
            .register(
                WorkerBuilder::new("teknohole-scheduler")
                    .concurrency(concurrency as usize)
                    .data(state.clone())
                    .backend(state.job_queue.clone())
                    .build_fn(worker_jobs),
            )
            .run()
            .await
            .expect("Scheduler worker crashed");
    });
}

async fn worker_jobs(job: Api, mut ctx: SqlContext, state: Data<AppState>) -> Result<(), anyhow::Error> {
    ctx.set_max_attempts(10);

    // Service data
    let execute_repo = FetchExecuteRepository::new(state.database.clone());
    let fetch_repo = FetchRepository::new(state.database.clone());
    let header_repo = FetchHeaderRepository::new(state.database.clone());
    let data_repo = FetchDataRepository::new(state.database.clone());
    let fetch_service = FetchService::new((*state).clone());
    let fetch_api = fetch_repo.get_by_id(&job.id).await?;
    let headers_json = if let Some(h_id) = fetch_api.header_id {
        match header_repo.find_by_id(h_id).await {
            Ok(data) => Some(data.headers),
            Err(e) => {
                tracing::warn!("Header ID {} not found: {:?}. Default.", h_id, e);
                None
            }
        }
    } else {
        None
    };

    let response = match fetch_api.r#type {
        ApiType::Rest => rest::request_response(state.http_client.clone(), &fetch_api.endpoint, &fetch_api.method, &fetch_api.payload, headers_json).await,
        ApiType::Websocket => state.ws_client.request_response(&fetch_api.endpoint, &fetch_api.payload, headers_json).await,
        
    };

    // Save data
    let result = match response {
        Ok(result) => FetchResult { status_code: result.status_code, headers: result.headers, response: result.response },
        Err(msg) => return Err(anyhow::anyhow!(msg)),
    };

    let fetch_id = fetch_api.id.clone();
    let fetch_job_id = fetch_api.job_id.clone().unwrap_or_else(|| "unknown".to_string());
    let name_data = format!("{} [{}-{}]", fetch_api.name,fetch_id, fetch_job_id);

    match fetch_api.r#type {
        ApiType::Rest => tracing::info!("[HTTP] Done request to {}. [{}]", &fetch_api.endpoint, result.status_code,),
        ApiType::Websocket => tracing::info!("[WS] Done request to {}. [{}]", &fetch_api.endpoint, result.status_code,),
    }
    
    let response_data = CreateApiData {
        fetch_id: fetch_api.id,
        name: name_data,
        status_code: Some(result.status_code),
        response: Some(result.response),
        response_headers: Some(result.headers),
    };

    data_repo.create(response_data).await?;

    // Create repeatable jobs
    let execute = execute_repo.find_by_id(fetch_api.execute_id).await?;
    if execute.is_repeat {
        let job_id = fetch_service.create_apalis_job(&fetch_api, execute)
            .await.map_err(|e| anyhow::anyhow!("Failed to create repeatable jobs: {:?}", e))?;
        let _ = fetch_repo.update_job_id(fetch_api.id, job_id)
            .await.map_err(|e| anyhow::anyhow!("Failed to update job id: {:?}", e))?;
    }

    Ok(())
}