<x-layout>
    <x-slot:title>{{ $title }}</x-slot:title>
    @foreach ($posts as $post)
        <article class="py-8 max-w-screen-md border-b border-gray-320">
            <a href="/posts/{{ $post['id'] }}" class="hover:underline">
                <h2>
                    {{ $post['title'] }}
                </h2>
            </a>
            <div class="text-base text-gray-500">
                <a href="#">{{ $post['author'] }} | 2 Februari 1998 </a></a>
            </div>

            <p class="text-base text-gray-500">
                {{Str::limit($post['body'], 100) }}
            </p>
            <a href="/posts/{{ $post['id'] }}" class="font-small text-blue-500 hover:underline">Lebih Lengkap &raquo;</a>

        </article>
    @endforeach
</x-layout>