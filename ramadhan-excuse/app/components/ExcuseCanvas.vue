<template>
  <div class="canvas-wrap">
    <canvas ref="canvas" width="1080" height="1080"></canvas>

    <button @click="download">
      💾 Download Meme
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { drawExcuseImage } from '../../lib/imageGenerator'

const props = defineProps<{
  text: string
  rarity: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

watch(
  () => props.text,
  () => {
    requestAnimationFrame(() => {
      draw()
    })
  },
  { immediate: true }
)

function draw() {
  if (!canvas.value) return
  drawExcuseImage(canvas.value, props.text, props.rarity)
}

function download() {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'excuse.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.canvas-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

canvas {
  width: 280px;
  border-radius: 14px;
  box-shadow: 0 0 40px rgba(124,58,237,.35);
}

button {
  background: linear-gradient(135deg,#7c3aed,#ec4899);
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: white;
}
</style>