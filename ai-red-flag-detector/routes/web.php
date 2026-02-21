<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;

Route::get('/', [AnalysisController::class, 'index'])->name('landing');
Route::post('/analyze', [AnalysisController::class, 'analyze'])->name('analyze');
