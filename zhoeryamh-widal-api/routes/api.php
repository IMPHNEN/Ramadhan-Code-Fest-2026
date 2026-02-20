<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WidalController;

/*
|--------------------------------------------------------------------------
| Widal API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api (set in RouteServiceProvider).
| Version prefix /v1 is applied here for future-proofing.
|
*/

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status'  => 'ok',
            'service' => config('app.name'),
            'version' => '1.0.0',
        ]);
    });

    // Widal encode/decode
    Route::post('/widal/encode', [WidalController::class, 'encode']);
    Route::post('/widal/decode', [WidalController::class, 'decode']);

    // Legacy: keep backward compat with the original GET /widal endpoint
    Route::match(['get', 'post'], '/widal', [WidalController::class, 'transform']);
});
