<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class EncryptLog extends Model
{
    use HasUlids;

    protected $table      = 'encrypt_logs';
    protected $primaryKey = 'id';

    public $timestamps = true;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null; // no updated_at

    protected $fillable = [
        'text',
        'result',
        'mode',
    ];
}
