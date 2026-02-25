<script setup lang="ts">

</script>

<template>
    <div class="flex justify-start items-center mb-10">
        <div class="flex gap-3 items-center">
            <div>
                <h2 class="text-4xl font-bold">Nasi Goreng</h2>
                <p class="text-gray-600 text-xs font-semibold">Ramadhan ke-1 - Buka Puasa</p>
            </div>
            <img src="/recipe.svg" width="60" alt="ppp" srcset="">
        </div>
    </div>
    <div class="flex justify-end mb-5">
        <button
            class="cursor-pointer bg-red-500 text-white text-xs font-bold px-4 py-2 border-4 border-black rounded-md shadow-[6px_6px_0px_#183153] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
            Tambah Bahan Baku
        </button>
    </div>
    <div class="card-wrapper w-full mb-10">
        <div class="relative">
            <div
                class="absolute translate-y-1 border-4 bg-[#183153] border-[#183153] rounded-xl w-full h-full shadow-[6px_6px_0px_#183153]">
            </div>
            <div
                class="relative border-2 bg-white border-[#183153] p-5 max-w-full mx-auto rounded-xl product-card shadow-[6px_6px_0px_#183153]">
                <!-- content -->
            </div>
        </div>
    </div>

    <div class="flex justify-end mb-5">
        <button
            class="cursor-pointer bg-red-500 text-white text-xs font-bold px-4 py-2 border-4 border-black rounded-md shadow-[6px_6px_0px_#183153] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
            Tambah Metode Pembuatan
        </button>
    </div>
    <div class="card-wrapper w-full">
        <div class="relative">
            <div
                class="absolute translate-y-1 border-4 bg-[#183153] border-[#183153] rounded-xl w-full h-full shadow-[6px_6px_0px_#183153]">
            </div>
            <div
                class="relative border-2 bg-white border-[#183153] p-5 max-w-full mx-auto rounded-xl product-card shadow-[6px_6px_0px_#183153]">
                <!-- content -->
            </div>
        </div>
    </div>
</template>

<style scoped></style>