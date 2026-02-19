use axum::response::IntoResponse;
use reqwest::StatusCode;
use scheduler::utils::response::AppError;


#[tokio::test]
async fn test_api_error_response() {
    let test_cases = vec![
        (AppError::NotFound("x".into()), StatusCode::NOT_FOUND),
        (AppError::InternalError("x".into()), StatusCode::INTERNAL_SERVER_ERROR),
        (AppError::BadRequest("x".into()), StatusCode::BAD_REQUEST),
        (AppError::Forbidden("x".into()), StatusCode::FORBIDDEN),
        (AppError::AuthError("x".into()), StatusCode::UNAUTHORIZED)
    ];

    for (error, expected_status) in test_cases {
        let response = error.into_response();
        assert_eq!(response.status(), expected_status);
    }
}