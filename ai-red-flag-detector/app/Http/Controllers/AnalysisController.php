<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalysisController extends Controller
{
    public function index()
    {
        return view('landing');
    }

    public function analyze(Request $request)
    {
        // VALIDATION: max 3000 chars
        $validated = $request->validate([
            'chat' => ['required', 'string', 'max:3000'],
        ]);

        // SECURITY: do not log chat content
        $chat = trim($validated['chat']);

        $apiKey = env('GEMINI_API_KEY');
        $model  = env('GEMINI_MODEL', 'gemini-2.0-flash');

        if (!$apiKey) {
            return back()->withInput()->withErrors([
                'chat' => 'Server misconfigured: GEMINI_API_KEY is missing in .env',
            ]);
        }

        // JSON schema (defensive) for strict output
        $schema = [
            'type' => 'OBJECT',
            'properties' => [
                'toxic_score' => ['type' => 'NUMBER', 'minimum' => 0, 'maximum' => 100],
                'risk_level' => ['type' => 'STRING', 'enum' => ['low', 'medium', 'high']],
                'patterns_detected' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING'],
                    'maxItems' => 12,
                ],
                'attachment_style' => ['type' => 'STRING'],
                'summary' => ['type' => 'STRING'],
                'recommendation' => ['type' => 'STRING'],
            ],
            'required' => [
                'toxic_score',
                'risk_level',
                'patterns_detected',
                'attachment_style',
                'summary',
                'recommendation',
            ],
        ];

        $systemInstruction = <<<SYS
You analyze relationship chat conversations for emotional manipulation patterns.
Avoid medical/psychiatric diagnosis. Do not label anyone with disorders.
Return ONLY valid JSON that matches the provided schema. No extra keys. No markdown. No code fences.
SYS;

        $userPrompt = <<<USR
Analyze the following relationship chat text. Detect emotional manipulation patterns and provide a structured assessment.

CHAT:
{$chat}
USR;

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

        try {
            $resp = Http::timeout(25)
                ->retry(2, 250)
                ->acceptJson()
                ->asJson()
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $userPrompt],
                            ],
                        ],
                    ],
                    'systemInstruction' => [
                        'role' => 'system',
                        'parts' => [
                            ['text' => $systemInstruction],
                        ],
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                        'response_schema' => $schema,
                        'temperature' => 0.2,
                        'maxOutputTokens' => 700,
                    ],
                ]);
        } catch (\Throwable $e) {
            // NO chat logging here
            return back()->withInput()->withErrors([
                'chat' => 'Gemini request failed (network/timeout). Try again.',
            ]);
        }

        if (!$resp->successful()) {
            return back()->withInput()->withErrors([
                'chat' => 'Gemini API error. Try again in a moment.',
            ]);
        }

        $body = $resp->json();

        // Extract text JSON from candidates
        $text = data_get($body, 'candidates.0.content.parts.0.text');
        if (!is_string($text) || trim($text) === '') {
            return back()->withInput()->withErrors([
                'chat' => 'Gemini returned an empty response.',
            ]);
        }

        $result = $this->safeJsonDecode($text);
        if (!is_array($result)) {
            return back()->withInput()->withErrors([
                'chat' => 'Gemini returned invalid JSON. Please retry.',
            ]);
        }

        // Sanity checks
        $score = $result['toxic_score'] ?? null;
        $risk  = $result['risk_level'] ?? null;

        if (!is_numeric($score) || $score < 0 || $score > 100) {
            return back()->withInput()->withErrors([
                'chat' => 'Invalid toxic_score returned by model.',
            ]);
        }

        if (!in_array($risk, ['low', 'medium', 'high'], true)) {
            return back()->withInput()->withErrors([
                'chat' => 'Invalid risk_level returned by model.',
            ]);
        }

        // No-store to reduce caching of sensitive content
        return response()
            ->view('result', ['result' => $result])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache');
    }

    private function safeJsonDecode(string $text): ?array
    {
        $text = trim($text);

        // First try: direct decode
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Fallback: if model wraps with extra text, extract first {...}
        if (preg_match('/\{.*\}/s', $text, $m)) {
            $decoded = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }
}
