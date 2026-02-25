@extends('layouts.app')

@section('content')
@php
$score = (int) ($result['toxic_score'] ?? 0);
$risk = $result['risk_level'] ?? 'low';

$riskStyles = [
'low' => 'bg-emerald-600/15 text-emerald-300 border-emerald-700/40',
'medium' => 'bg-amber-600/15 text-amber-300 border-amber-700/40',
'high' => 'bg-red-600/15 text-red-300 border-red-700/40',
];

$accent = $risk === 'high' ? 'bg-red-600' : ($risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500');

$patterns = $result['patterns_detected'] ?? [];
if (!is_array($patterns)) $patterns = [];
@endphp

<div class="space-y-8" x-data="{w: 0}" x-init="setTimeout(() => w={{ $score }}, 120)">
    <div class="flex items-start justify-between gap-4">
        <div>
            <h1 class="text-2xl font-semibold">Your analysis</h1>
            <p class="text-zinc-400">Non-medical behavioral indicators based on the provided text sample.</p>
        </div>

        <div class="shrink-0 rounded-full border px-3 py-1 text-sm {{ $riskStyles[$risk] ?? $riskStyles['low'] }}">
            {{ strtoupper($risk) }} RISK
        </div>
    </div>

    <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div class="flex items-end justify-between">
            <div class="text-zinc-400 text-sm">Toxic Score</div>
            <div class="text-4xl font-semibold">{{ $score }}<span class="text-zinc-500 text-xl">/100</span></div>
        </div>

        <div class="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div class="h-full {{ $accent }} transition-all duration-700" :style="`width:${w}%`"></div>
        </div>

        <div class="text-xs text-zinc-500">
            Higher score suggests more frequent/intense manipulation signals in the pasted sample (not a definitive judgment).
        </div>
    </div>

    <div class="grid gap-4">
        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
            <h2 class="text-lg font-semibold">Patterns detected</h2>

            @if(count($patterns) === 0)
            <p class="text-zinc-400">No specific patterns were returned.</p>
            @else
            <ul class="list-disc pl-5 text-zinc-200 space-y-1">
                @foreach($patterns as $p)
                <li>{{ $p }}</li>
                @endforeach
            </ul>
            @endif
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
            <h2 class="text-lg font-semibold">Attachment style (inferred)</h2>
            <p class="text-zinc-200">{{ $result['attachment_style'] ?? '-' }}</p>
            <p class="text-xs text-zinc-500">This is a lightweight inference, not a diagnosis.</p>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
            <h2 class="text-lg font-semibold">Summary</h2>
            <p class="text-zinc-200 whitespace-pre-line">{{ $result['summary'] ?? '-' }}</p>
        </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
            <h2 class="text-lg font-semibold">Recommendation</h2>
            <p class="text-zinc-200 whitespace-pre-line">{{ $result['recommendation'] ?? '-' }}</p>
        </div>
    </div>

    <div class="flex gap-3">
        <a href="{{ route('landing') }}"
            class="rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition px-4 py-2">
            Analyze another chat
        </a>
    </div>
</div>
@endsection