<script setup lang="ts">
import Footer from '../footer/Footer.vue'
</script>

<template>
    <div class="content">
        <div class="p-16 min-h-screen">
            <slot></slot>
        </div>
        <Footer />
    </div>
</template>

<style scoped></style>