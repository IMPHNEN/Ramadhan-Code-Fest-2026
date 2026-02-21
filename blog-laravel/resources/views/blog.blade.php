<x-layout>
    <x-slot:title>{{ $title }}</x-slot:title>
    <h3>Ini Blog Bang</h3>

    <article class="py-8 max-w-screen-md border-b border-gray-300">
        <h2>
            Adalah pokoknya
        </h2>

        <div>
            <a href="#">dev:{{ $name }}</a> | 2 Februari 1998
        </div>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ex vitae laborum quod explicabo? Dicta
            quaerat mollitia iusto est architecto repudiandae nostrum nam ea recusandae. Molestiae delectus eius non
            excepturi?
        </p>
        <a href="#">Lebih Lengkap &raquo;</a>

    </article>
</x-layout>