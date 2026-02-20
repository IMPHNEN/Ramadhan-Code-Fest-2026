use axum::{http::Uri, response::IntoResponse};
use crate::middleware::auth::{AuthUser}; 
use crate::services::fetch::FetchService;
use crate::utils::{requests::{ValidatedJson, ValidatedPath}, response::{ApiError, WebResponse}};
use crate::models::fetch::{CreateApiMembers, ReqCreateApi, ReqCreateApiData, ReqCreateApiExecute, ReqCreateApiHeader, UpdateApi, UpdateApiData, UpdateApiExecute, UpdateApiHeader, UpdateApiMembers};

pub async fn get_all(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_all_fetch_user(user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success", response))
}

pub async fn get_fetch_job(
    ValidatedPath(job_id): ValidatedPath<String>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_fetch_by_job(user, &job_id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success", response))
}

pub async fn get_fetch_api(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_fetch_by_id(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success", response))
}

pub async fn create_fetch_api(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<ReqCreateApi>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.create_fetch(data, user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Fetch Api Created!", response))
}

pub async fn update_fetch_api(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<UpdateApi>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.update_fetch(&id, data, user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Fetch Api Updated!", response))
}

pub async fn delete_fetch_api(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_fetch(id, user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Fetch Api Deleted!", response))
}

pub async fn get_fetch_member(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError>{
    let response = service.find_member(user,fetch_id, id)
        .await
        .map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List fetch members", response))
}

pub async fn get_all_member(
    ValidatedPath(fetch_id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError>{
    let response = service.find_members(user, fetch_id)
        .await
        .map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List fetch members", response))
}

pub async fn create_fetch_member(
    ValidatedPath(fetch_id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<CreateApiMembers>
) -> Result<impl IntoResponse, ApiError>{
    let response = service.add_member(user, fetch_id, data)
        .await
        .map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Success add a member", response))
}

pub async fn update_fetch_member(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<UpdateApiMembers>
) -> Result<impl IntoResponse, ApiError>{
    let response = service.update_member(user, id, fetch_id, data)
        .await
        .map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success update a member", response))
}

pub async fn delete_fetch_member(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_member(user, id, fetch_id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Member Deleted", response))
}

pub async fn get_fetch_execute(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_execute(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success get api execute", response))
}
pub async fn get_all_execute(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_all_execute(user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List get api execute", response))
}

pub async fn create_fetch_execute(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<ReqCreateApiExecute>,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.create_execute(user, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Api execute created!", response))
}

pub async fn update_fetch_execute(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<UpdateApiExecute>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.update_execute(user, id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Api execute updated!", response))
}

pub async fn delete_fetch_execute(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_execute(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Api execute deleted!", response))
}

pub async fn get_all_header(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_all_header(user).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List headers", response))
}

pub async fn create_fetch_header(
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<ReqCreateApiHeader>,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.create_header(user, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Header created!", response))
}

pub async fn get_fetch_header(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_header(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success!", response))
}

pub async fn update_fetch_header(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<UpdateApiHeader>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.update_header(user, id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Header updated!", response))
}

pub async fn delete_fetch_header(
    ValidatedPath(id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_header(user, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Header deleted!", response))
}

pub async fn get_all_data(
    ValidatedPath(fetch_id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_all_data(user, fetch_id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "List fetch data", response))
}

pub async fn create_fetch_data(
    ValidatedPath(fetch_id): ValidatedPath<i32>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<ReqCreateApiData>,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.create_data(user, fetch_id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::created(&uri, "Fetch data created!", response))
}

pub async fn get_fetch_data(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.get_data(user, fetch_id, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Success!", response))
}

pub async fn update_fetch_data(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
    ValidatedJson(data): ValidatedJson<UpdateApiData>
) -> Result<impl IntoResponse, ApiError> {
    let response = service.update_data(user, fetch_id, id, data).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Fetch data updated!", response))
}

pub async fn delete_fetch_data(
    ValidatedPath((fetch_id, id)): ValidatedPath<(i32, i32)>,
    uri: Uri,
    AuthUser(user): AuthUser,
    service: FetchService,
) -> Result<impl IntoResponse, ApiError> {
    let response = service.delete_data(user,fetch_id, id).await.map_err(|e|e.with_path(&uri))?;

    Ok(WebResponse::ok(&uri, "Fetch data deleted!", response))
}
