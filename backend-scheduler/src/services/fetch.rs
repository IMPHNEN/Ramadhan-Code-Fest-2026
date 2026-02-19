use apalis::prelude::Storage;
use axum::{extract::{FromRef, FromRequestParts}, http::request::Parts};
use chrono::{Utc, Duration};
use tracing::{warn,info};
use crate::{models::{fetch::{Api, ApiData, ApiDataResponse, ApiExecute, ApiHeader, ApiMembers, CreateApiData, CreateApiExecute, CreateApiHeader, CreateApiMembers, ExecuteType, ReqCreateApi, ReqCreateApiData, ReqCreateApiExecute, ReqCreateApiHeader, Role, UpdateApi, UpdateApiData, UpdateApiExecute, UpdateApiHeader, UpdateApiMembers}, user::User}, repository::fetch::{FetchDataRepository, FetchExecuteRepository, FetchHeaderRepository, FetchMemberRepository, FetchRepository}, state::AppState, utils::response::AppError};

#[allow(dead_code)]
pub struct FetchService {
    fetch_repo: FetchRepository,
    member_repo: FetchMemberRepository,
    execute_repo: FetchExecuteRepository,
    header_repo: FetchHeaderRepository,
    data_repo: FetchDataRepository,
    state: AppState,
}

impl FetchService {
    pub fn new(state: AppState) -> Self {
        let fetch_repo = FetchRepository::new(state.database.clone());
        let member_repo = FetchMemberRepository::new(state.database.clone());
        let execute_repo = FetchExecuteRepository::new(state.database.clone());
        let header_repo = FetchHeaderRepository::new(state.database.clone());
        let data_repo = FetchDataRepository::new(state.database.clone());
        Self {fetch_repo, member_repo, execute_repo, header_repo, data_repo, state}
    }

    // Create apalis job
    pub async fn create_apalis_job(&self, fetch: &Api, execute: ApiExecute) -> Result<String, AppError> {
        let duration = match execute.r#type {
            Some(ExecuteType::Seconds) => Duration::seconds(execute.value),
            Some(ExecuteType::Minutes) => Duration::minutes(execute.value),
            Some(ExecuteType::Hours)   => Duration::hours(execute.value),
            Some(ExecuteType::Days)    => Duration::days(execute.value),
            None                       => Duration::minutes(execute.value),
        };
        let run_at = (Utc::now() + duration).timestamp();

        let apalis = self.state.job_queue.clone()
                .schedule(fetch.clone(), run_at)
                .await
                .map_err(|e| {
                    tracing::error!("Failed to enqueue apalis job: {e}");
                    AppError::InternalError("Failed to create scheduler!".to_string())})?;

        Ok(apalis.task_id.to_string())
    }

    /// #API AREA

    /// get all fetch user
    pub async fn get_all_fetch_user(&self, user: User) -> Result<Vec<Api>, AppError> {
        let query = self.fetch_repo.get_all_fetch_user(user.id).await?;

        Ok(query)
    }

    pub async fn get_fetch_by_id(&self,user: User, id: i32) -> Result<Api, AppError> {
        if !user.is_superuser {
            let is_allowed = self.member_repo
                .find_member_id(id, user.id)
                .await
                .is_ok();

            if !is_allowed {
                return Err(AppError::Forbidden("You are not a member of this project!".to_string()));
            }
        }
        let query = self.fetch_repo.get_by_id(&id)
            .await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

        Ok(query)
    }

    pub async fn get_fetch_by_job(&self,user: User, job_id: &str) -> Result<Api, AppError> {
        if !user.is_superuser {
            let fetch = self.fetch_repo.find_by_job_id(job_id)
                .await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

            let is_allowed = self.member_repo
                .find_member_id(fetch.id, user.id)
                .await
                .is_ok();

            if !is_allowed {
                return Err(AppError::Forbidden("You are not a member of this project!".to_string()));
            }
        }

        let query = self.fetch_repo.find_by_job_id(job_id)
            .await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

        Ok(query)
    }

    pub async fn get(&self, id: i32) -> Result<Api, AppError> {
        let query = self.fetch_repo.get_by_id(&id).await.map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

        Ok(query)
    }
    
    pub async fn create_fetch(&self, data: ReqCreateApi, user: User) -> Result<Api, AppError> {
        let model = data.into_model();
        let fetch = self.fetch_repo.create(model)
            .await
            .map_err(|e|{
                if let Some(db_error) = e.as_database_error() {
                    if db_error.is_foreign_key_violation() {
                        match db_error.constraint() {
                            Some("fk_fetch_execute") => {
                                return AppError::BadRequest("Execute ID not found. Please create execute first.".to_string());
                            },
                            Some("fk_fetch_header") => {
                                return AppError::BadRequest("Header ID not found. Please create header first.".to_string());
                            },
                            _ => {
                                return AppError::BadRequest("Reference not found.".to_string());
                            }
                        }
                    }
                }
                AppError::BadRequest(format!("Database error: {}", e))
            })?;

        let add_member= CreateApiMembers { user_id: (user.id), role: Role::Owner };
        let _ = self.member_repo.create(fetch.id,add_member)
            .await?;

        let execute = self.execute_repo.find_by_id(fetch.execute_id).await?;
        if execute.user_id != user.id && !user.is_superuser {
            return Err(AppError::Forbidden("You do not have permission to use this execute.".to_string()));
        }
        let job_id = self.create_apalis_job(&fetch, execute).await?;
        let updated_fetch = self.fetch_repo.update_job_id(fetch.id, job_id).await?;

        Ok(updated_fetch)
    }

    /// Update fetch viewer not allowed
    pub async fn update_fetch(&self, id: &i32, data: UpdateApi, user: User) -> Result<Api, AppError> {
        if !user.is_superuser {
            let member = self.member_repo.find_member_id(*id, user.id)
                .await
                .map_err(|_| AppError::Forbidden("You are not allowed to update this data!".to_string()))?;

            if member.role == Some(Role::Viewer) {
                return Err(AppError::Forbidden("Viewer not allowed to update fetch api.".to_string()));
            }
        }

        if let Some(exe_id) = data.execute_id {
            let execute = self.execute_repo.find_by_id(exe_id).await?;
            if execute.user_id != user.id && !user.is_superuser {
                return Err(AppError::Forbidden("You do not have permission to use this execute.".to_string()));
            }
            
            let fetch = self.fetch_repo.get_by_id(id).await?;
            if let Some(j_id) = &fetch.job_id {
                if let Err(e) = self.fetch_repo.delete_apalis_job(j_id).await {
                    warn!("Failed delete apalis job {}, continue to next step\n error: {}", j_id, e);
                }
            }
            let job_id = self.create_apalis_job(&fetch, execute).await?;
            self.fetch_repo.update_job_id(*id, job_id).await?;
        }

        let query = self.fetch_repo.update(id, data)
            .await
            .map_err(|e| {
                if let Some(db_error) = e.as_database_error() {
                    if db_error.is_foreign_key_violation() {
                        match db_error.constraint() {
                            Some("fk_fetch_execute") => {
                                return AppError::BadRequest("Execute ID not found. Please create execute first.".to_string());
                            },
                            Some("fk_fetch_header") => {
                                return AppError::BadRequest("Header ID not found. Please create header first.".to_string());
                            },
                            _ => {
                                return AppError::BadRequest("Reference not found.".to_string());
                            }
                        }
                    }
                }
                AppError::BadRequest(format!("Database: {}", e))
            })?;

        Ok(query)
    }
    
    /// delete fetch api
    pub async fn delete_fetch(&self, id: i32, user: User) -> Result<Api, AppError> {
        let fetch = self.fetch_repo.get_by_id(&id).await?;

        if !user.is_superuser {
            let member = self.member_repo.find_member_id(id, user.id)
                .await
                .map_err(|_| AppError::Forbidden("Access denied".to_string()))?;

            if member.role != Some(Role::Owner) {
                return Err(AppError::Forbidden("Only owner allowed to delete fetch api.".to_string()));
            }
        }

        if let Some(j_id) = &fetch.job_id {
            if let Err(e) = self.fetch_repo.delete_apalis_job(j_id).await {
                warn!("Failed delete apalis job {}, continue to next step\n error: {}", j_id, e);
            } else {
                info!("Successfully deleted apalis job {}", j_id);
            }
        }

        let query = self.fetch_repo.delete(id).await?;
        
        Ok(query)
    }
    /// # MEMBER AREA
    
    /// Find member by id
    pub async fn find_member(&self, user: User, fetch_id: i32, id: i32) -> Result<ApiMembers, AppError>{
        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(_) => true,
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to view members!".to_string()));
            }
        }
        let q = self.member_repo.find_member_id(fetch_id,id)
            .await
            .map_err(|e| {AppError::NotFound(format!("Database : {}", e))})?;
        
        Ok(q)
    }

    /// Find all related fetch members
    pub async fn find_members(&self, user:User, fetch_id: i32) -> Result<Vec<ApiMembers>, AppError> {
        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(_) => true,
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to view members!".to_string()));
            }
        }
        let q = self.member_repo.find_members(fetch_id)
            .await
            .map_err(|e| {AppError::NotFound(format!("Database : {}", e))})?;
        Ok(q)
    }

    // Add member of fetch id (Role:Owner required)
    pub async fn add_member(&self, user: User, fetch_id: i32, data: CreateApiMembers) -> Result<ApiMembers, AppError> {
        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(member) => member.role == Some(Role::Owner),
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to add members!".to_string()));
            }
        }

        let create = self.member_repo.create(fetch_id, data)
            .await.map_err(|e| {AppError::NotFound(format!("Database : {}", e))})?;

        Ok(create)
    }

    // Edit member Role:Owner
    pub async fn update_member(&self, user: User,id: i32, fetch_id: i32, data:UpdateApiMembers) -> Result<ApiMembers, AppError> {
        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(member) => member.role == Some(Role::Owner),
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to update members!".to_string()));
            }
        }

        let q = self.member_repo.update(fetch_id ,id, data)
            .await?;

        Ok(q)
    }

    // Delete member Role:Owner
    pub async fn delete_member(&self, user: User, id: i32, fetch_id: i32) -> Result<ApiMembers, AppError> {
        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(member) => member.role == Some(Role::Owner),
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to delete members!".to_string()));
            }
        }

        let target_member = self.member_repo.find_member_id(fetch_id,id).await
            .map_err(|_| AppError::NotFound("Member target not found".to_string()))?;

        if target_member.fetch_id != fetch_id {
            // Ini tanda-tanda request curang (ID project dan ID member tidak klop)
            return Err(AppError::BadRequest("Member target not a member on this fetch".to_string()));
        }
        
        let q = self.member_repo.delete(fetch_id, id)
            .await
            .map_err(|e| {AppError::NotFound(format!("Database: {}", e))})?;

        Ok(q)
    }

    /// get execute data (id)
    pub async fn get_execute(&self, user:User, id:i32) -> Result<ApiExecute, AppError> {
        let execute = self.execute_repo.find_by_id(id)
            .await.map_err(|e|{AppError::NotFound(format!("Database: {}",e))})?;

        if user.is_superuser || execute.user_id == user.id {
            return Ok(execute);
        }

        Err(AppError::Forbidden("You don't have permission to access this data".to_string()))
    }

    /// get all execute data user
    pub async fn get_all_execute(&self, user: User) -> Result<Vec<ApiExecute>, AppError> {
        let q = self.execute_repo.find_all(user.id)
            .await.map_err(|e|{AppError::NotFound(format!("Database: {}",e))})?;

        Ok(q)
    }

    /// create execute data
    pub async fn create_execute(&self, user: User, req: ReqCreateApiExecute) -> Result<ApiExecute, AppError> {
        let model: CreateApiExecute = req.into_model(user.id);
        let create = self.execute_repo.create(model)
            .await?;

        Ok(create)
    }

    /// update execute data
    pub async fn update_execute(&self, user: User, id: i32, req: UpdateApiExecute) -> Result<ApiExecute, AppError> {
        let execute = self.execute_repo.find_by_id(id).await?;
        if !user.is_superuser && execute.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to access this data".to_string()));
        }
        
        Ok(self.execute_repo.update(id, req).await?)
    }

    /// delete execute data
    pub async fn delete_execute(&self, user: User, id: i32) -> Result<ApiExecute, AppError> {
        let execute = self.execute_repo.find_by_id(id).await?;
        if !user.is_superuser && execute.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to access this data".to_string()));
        }

        Ok(self.execute_repo.delete(id).await?)
    }

    /// #Fetch Header Area
    
    /// get one
    pub async fn get_header(&self, user: User, id: i32) -> Result<ApiHeader, AppError> {
        let q = self.header_repo.find_by_id(id).await?;
        if !user.is_superuser && q.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to access this data".to_string()));
        }

        Ok(q)
    }

    /// get all headers related with user
    pub async fn get_all_header(&self, user: User) -> Result<Vec<ApiHeader>, AppError> {
        let q = self.header_repo.find_all(user.id).await?;

        Ok(q)
    }

    /// Create headers user
    pub async fn create_header(&self, user: User, data: ReqCreateApiHeader) -> Result<ApiHeader, AppError> {
        let model: CreateApiHeader = data.into_model(user.id);
        let q = self.header_repo.create(model).await?;

        Ok(q)
    }

    /// Update header user
    pub async fn update_header(&self, user: User, id: i32, data: UpdateApiHeader) -> Result<ApiHeader, AppError> {
        let header = self.header_repo.find_by_id(id).await?;

        if !user.is_superuser && header.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to update this data".to_string()));
        }

        let q = self.header_repo.update(id,data).await?;

        Ok(q)
    }

    /// Delete header user
    pub async fn delete_header(&self, user: User, id: i32) -> Result<ApiHeader, AppError> {
        let header = self.header_repo.find_by_id(id).await?;

        if !user.is_superuser && header.user_id != user.id {
            return Err(AppError::Forbidden("You don't have permission to delete this data".to_string()));
        }

        let q = self.header_repo.delete(id).await?;

        Ok(q)
    }

    /// #Fetch Data Area
    
    /// get one
    pub async fn get_data(&self, user: User, fetch_id: i32, id: i32) -> Result<ApiDataResponse, AppError> {
        if !user.is_superuser {
            self.member_repo.find_member_id(fetch_id, user.id)
            .await.map_err(|_|{AppError::Forbidden(format!("You don't have permission to access this data"))})?;
        }

        let data = self.data_repo.find_by_id(id).await?;

        Ok(ApiDataResponse::from(data))
    }

    /// get all fetch data related with fetch
    pub async fn get_all_data(&self, user: User, fetch_id: i32) -> Result<Vec<ApiDataResponse>, AppError> {
        if !user.is_superuser {
             self.member_repo.find_member_id(fetch_id, user.id)
            .await.map_err(|_|{AppError::Forbidden(format!("You don't have permission to access this data"))})?;
        }

        let data_list = self.data_repo.find_all(fetch_id).await?;
        let response_list: Vec<ApiDataResponse> = data_list.into_iter()
            .map(ApiDataResponse::from)
            .collect();

        Ok(response_list)
    }

    /// Create fetch data user
    pub async fn create_data(&self, user: User,fetch_id: i32, data: ReqCreateApiData) -> Result<ApiData, AppError> {
        if !user.is_superuser {
            let member = self.member_repo.find_member_id(fetch_id, user.id)
                .await
                .map_err(|_| AppError::Forbidden("You are not allowed to create this data!".to_string()))?;

            if member.role == Some(Role::Viewer) {
                return Err(AppError::Forbidden("Viewer not allowed to create fetch api data.".to_string()));
            }
        }
        let model: CreateApiData = data.into_model(fetch_id);
        let q = self.data_repo.create(model).await?;

        Ok(q)
    }

    /// Update fetch data user
    pub async fn update_data(&self, user: User,fetch_id: i32, id: i32, data: UpdateApiData) -> Result<ApiData, AppError> {
        let existing_data = self.data_repo.find_by_id(id).await?;
        if existing_data.fetch_id != fetch_id { 
            return Err(AppError::BadRequest("Data ID does not belong to this Fetch Project".to_string()));
        }

        if !user.is_superuser {
            let member = self.member_repo.find_member_id(fetch_id, user.id)
                .await
                .map_err(|_| AppError::Forbidden("You are not allowed to update this data!".to_string()))?;

            if member.role == Some(Role::Viewer) {
                return Err(AppError::Forbidden("Viewer not allowed to update fetch api data.".to_string()));
            }
        }

        let q = self.data_repo.update(id,data).await?;

        Ok(q)
    }

    /// Delete fetch data user
    pub async fn delete_data(&self, user: User, fetch_id: i32, id: i32) -> Result<ApiData, AppError> {
        let existing_data = self.data_repo.find_by_id(id).await?;
        if existing_data.fetch_id != fetch_id { 
            return Err(AppError::BadRequest("Data ID does not belong to this Fetch Project".to_string()));
        }

        if !user.is_superuser {
            let is_allowed = match self.member_repo.find_member_id(fetch_id, user.id).await {
                Ok(member) => member.role == Some(Role::Owner),
                Err(_) => false, 
            };

            if !is_allowed {
                return Err(AppError::Forbidden("You don't have permission to add members!".to_string()));
            }
        }

        let q = self.data_repo.delete(id).await?;

        Ok(q)
    }
}


impl<S> FromRequestParts<S> for FetchService
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = AppState::from_ref(state);
        
        Ok(FetchService::new(state))
    }
}