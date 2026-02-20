<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApiResource;
use App\Models\DecryptLog;
use App\Models\EncryptLog;
use App\Services\WidalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WidalController extends Controller
{
    public function __construct(protected WidalService $widal)
    {
    }

    /**
     * POST /api/v1/widal/encode
     * Encode plain text (Sundanese / Indonesian) → Widal code.
     */
    public function encode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text'     => ['required', 'string', 'max:10000'],
            'reversal' => ['sometimes', 'boolean'],
        ]);

        $result = $this->widal->encode($data['text'], $data['reversal'] ?? false);

        $this->logEncrypt($data['text'], $result, 'to_widal');

        return ApiResource::success('Text encoded successfully.', [
            'input'    => $data['text'],
            'result'   => $result,
            'reversal' => $data['reversal'] ?? false,
        ]);
    }

    /**
     * POST /api/v1/widal/decode
     * Decode Widal code → plain text.
     */
    public function decode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text' => ['required', 'string', 'max:10000'],
        ]);

        $result = $this->widal->decode($data['text']);

        $this->logDecrypt($data['text'], $result, 'from_widal');

        return ApiResource::success('Text decoded successfully.', [
            'input'  => $data['text'],
            'result' => $result,
        ]);
    }

    /**
     * GET|POST /api/v1/widal  (legacy, backward-compatible endpoint)
     */
    public function transform(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text'     => ['required', 'string', 'max:10000'],
            'mode'     => ['required', Rule::in(['to_widal', 'from_widal'])],
            'reversal' => ['sometimes', 'boolean'],
        ]);

        if ($data['mode'] === 'to_widal') {
            $result = $this->widal->encode($data['text'], $data['reversal'] ?? false);
            $this->logEncrypt($data['text'], $result, $data['mode']);
        } else {
            $result = $this->widal->decode($data['text']);
            $this->logDecrypt($data['text'], $result, $data['mode']);
        }

        return ApiResource::success('Transformation complete.', [
            'input'  => $data['text'],
            'result' => $result,
            'mode'   => $data['mode'],
        ]);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private function logEncrypt(string $text, string $result, string $mode): void
    {
        if (config('widal.enable_db_log', false)) {
            EncryptLog::create([
                'text'   => $text,
                'result' => $result,
                'mode'   => $mode,
            ]);
        }
    }

    private function logDecrypt(string $text, string $result, string $mode): void
    {
        if (config('widal.enable_db_log', false)) {
            DecryptLog::create([
                'text'   => $text,
                'result' => $result,
                'mode'   => $mode,
            ]);
        }
    }
}
