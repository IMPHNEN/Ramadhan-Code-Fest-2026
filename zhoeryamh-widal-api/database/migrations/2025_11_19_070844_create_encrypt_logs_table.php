<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encrypt_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->longText('text');
            $table->longText('result');
            $table->string('mode', 20);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('encrypt_logs');
    }
};
