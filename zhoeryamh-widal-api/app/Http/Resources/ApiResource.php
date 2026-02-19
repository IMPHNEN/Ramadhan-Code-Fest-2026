<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;

/**
 * Unified API response envelope.
 *
 * All responses follow the shape:
 * {
 *   "success": true|false,
 *   "message": "...",
 *   "data":    { ... } | null
 * }
 */
class ApiResource
{
    public static function success(string $message, mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    public static function error(string $message, mixed $errors = null, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}
