<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Database Logging
    |--------------------------------------------------------------------------
    |
    | When enabled, every encode/decode request is persisted to the
    | encrypt_logs / decrypt_logs tables. Requires running migrations first:
    |   php artisan migrate
    |
    | Set WIDAL_ENABLE_DB_LOG=true in your .env to activate.
    |
    */

    'enable_db_log' => env('WIDAL_ENABLE_DB_LOG', false),

];
