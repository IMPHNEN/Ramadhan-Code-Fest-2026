<script setup lang="ts">

</script>

<template>
    <div class="flex justify-between items-center mb-10">
        <div class="flex gap-3 items-center">
            <div>
                <h2 class="text-4xl font-bold">Ramadhan ke-1</h2>
                <p class="text-gray-600 text-xs font-semibold">Ayo buat menu resep berbuka puasa dan sahur kamu</p>
            </div>
            <img src="/noodle.svg" width="60" alt="ppp" srcset="">
        </div>
        <RouterLink to="/">
            <button
                class="cursor-pointer bg-red-500 text-white text-xs font-bold px-4 py-2 border-4 border-black rounded-md shadow-[6px_6px_0px_#183153] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
                Tambah Menu
            </button>
        </RouterLink>
    </div>
    <div class="flex gap-x-[52px] w-full">
        <div class="cursor-pointer card-wrapper w-full">
            <div class="group relative transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[3px]">
                <div
                    class="absolute translate-y-1 border-4 bg-[#183153] border-[#183153] rounded-xl w-full h-full shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                </div>
                <div
                    class="relative border-2 bg-white hover:bg-[#FAB007] border-[#183153] p-5 max-w-full mx-auto rounded-xl product-card shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                    <div class="flex justify-center">
                        <img src="https://www.svgrepo.com/show/275980/moon.svg" width="50" alt="" srcset="">
                    </div>
                    <p class="text-xl font-bold text-center">Semur Jengkol</p>
                    <p class="text-[#183153] font-semibold mt-1 text-center">
                        Buka Puasa
                    </p>
                </div>
            </div>
        </div>

        <div class="cursor-pointer card-wrapper w-full">
            <div class="group relative transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[3px]">
                <div
                    class="absolute translate-y-1 border-4 bg-[#183153] border-[#183153] rounded-xl w-full h-full shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                </div>
                <div
                    class="relative border-2 bg-white hover:bg-[#FAB007] border-[#183153] p-5 max-w-full mx-auto rounded-xl product-card shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                    <div class="flex justify-center">
                        <img src="https://www.svgrepo.com/show/168346/moon.svg" width="50" alt="" srcset="">
                    </div>
                    <p class="text-xl font-bold text-center">Kolak pisang</p>
                    <p class="text-[#183153] font-semibold mt-1 text-center">
                        Sahur
                    </p>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped></style>