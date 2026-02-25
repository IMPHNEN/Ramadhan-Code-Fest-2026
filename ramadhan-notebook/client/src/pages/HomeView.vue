<script setup lang="ts">
import { DateTime } from 'luxon';
import { onMounted, ref } from 'vue';

const date: string = DateTime.now().setLocale('id').toLocaleString(DateTime.DATE_HUGE);

const time = ref('');

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    time.value = `${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
    updateTime();
    setInterval(updateTime, 1000);
});
</script>

<template>
    <div class="flex justify-between items-center mb-10">
        <div class="flex items-center gap-3">
            <div>
                <h2 class="text-2xl font-bold">Assalamualaikum, Budi</h2>
                <p class="text-gray-600 text-xs font-semibold">{{ date }}, {{ time }}</p>
            </div>
            <img src="/lantern.svg" width="60" alt="ppp" srcset="">
        </div>
        <button
            class="cursor-pointer bg-red-500 text-white text-xs font-bold px-4 py-2 border-4 border-black rounded-md shadow-[6px_6px_0px_#183153] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none">
            Tambah Hari
        </button>
    </div>
    <div class="grid grid-cols-5 justify-items-start gap-x-4 gap-y-8">
        <div v-for="n in 30" class="cursor-pointer card-wrapper">
            <RouterLink to="/menu">
            <div class="group relative transition-all duration-300 hover:translate-x-[3px] hover:translate-y-[3px]">
                <div
                    class="absolute translate-y-1 border-4 bg-[#183153] border-[#183153] rounded-xl w-52 h-full shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                </div>
                <div
                    class="relative border-2 bg-white hover:bg-[#FAB007] border-[#183153] p-5 w-52 rounded-xl product-card shadow-[6px_6px_0px_#183153] group-hover:shadow-none transition-all duration-300">
                    <div class="flex justify-center">
                        <p class="text-4xl font-bold">{{ n }}</p>
                    </div>
                    <p class="text-[#183153] font-semibold mt-1 text-center">
                        Ramadhan
                    </p>
                </div>
            </div>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped></style>