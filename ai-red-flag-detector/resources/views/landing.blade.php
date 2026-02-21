@extends('layouts.app')

@section('content')
<div class="space-y-8" x-data="{loading:false}">
    <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight">AI Red Flag Detector</h1>
        <p class="text-zinc-400">
            Paste relationship chat text and get structured behavioral analysis (non-medical).
        </p>
    </header>

    <div class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div class="text-sm text-zinc-300">
            <span class="font-semibold text-zinc-100">Privacy:</span>
            We do not store your chat content. Avoid pasting names, phone numbers, addresses, or sensitive identifiers.
        </div>
        <div class="text-sm text-zinc-400">
            Disclaimer: This is not medical or professional advice. No diagnosis is provided.
        </div>
    </div>

    <form method="POST" action="{{ route('analyze') }}" class="space-y-4" @submit="loading=true">
        @csrf

        <div class="space-y-2">
            <label class="text-sm text-zinc-300">Chat text (max 3000 characters)</label>

            <textarea
                name="chat"
                maxlength="3000"
                rows="10"
                class="w-full rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-red-600/40"
                placeholder="Paste chat here..."
                required>{{ old('chat') }}</textarea>

            @error('chat')
            <div class="text-sm text-red-400">{{ $message }}</div>
            @enderror
        </div>

        <button
            type="submit"
            class="w-full rounded-2xl bg-red-600 hover:bg-red-500 transition px-4 py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="loading">
            <span x-show="!loading">Analyze</span>
            <span x-show="loading" class="animate-pulse">Analyzing emotional patterns...</span>
        </button>
    </form>

    <footer class="text-xs text-zinc-500">
        Tip: The more context you include, the more reliable the pattern detection becomes.
    </footer>
</div>
@endsection