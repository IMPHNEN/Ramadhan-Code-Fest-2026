<?php

namespace App\Exceptions;

use App\Http\Resources\ApiResource;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Force all responses to JSON (this is an API-only app).
     */
    public function render($request, Throwable $e): JsonResponse
    {
        // Validation errors
        if ($e instanceof ValidationException) {
            return ApiResource::error(
                'Validation failed.',
                $e->errors(),
                422
            );
        }

        // 404 Not Found
        if ($e instanceof NotFoundHttpException) {
            return ApiResource::error('Endpoint not found.', null, 404);
        }

        // Method not allowed
        if ($e instanceof MethodNotAllowedHttpException) {
            return ApiResource::error('Method not allowed.', null, 405);
        }

        // Unauthenticated
        if ($e instanceof AuthenticationException) {
            return ApiResource::error('Unauthenticated.', null, 401);
        }

        // Generic HTTP exceptions
        if ($e instanceof HttpException) {
            return ApiResource::error(
                $e->getMessage() ?: 'HTTP error.',
                null,
                $e->getStatusCode()
            );
        }

        // All other exceptions
        $status  = 500;
        $message = config('app.debug')
            ? $e->getMessage()
            : 'An unexpected server error occurred.';

        return ApiResource::error($message, null, $status);
    }
}
