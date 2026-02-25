<template>
  <main class="container">
    <h1>Ramadhan Excuse Protocol 😈</h1>
    <p>Generate alasan absah kenapa kamu skip ibadah hari ini</p>

    <ClientOnly>
      <WalletConnect />
    </ClientOnly>

    <div v-if="excuse" class="card" :class="excuse.rarity">
      <div class="rarity">{{ excuse.rarity.toUpperCase() }}</div>
      <h2>{{ excuse.text }}</h2>
    </div>

    <button class="generate" @click="roll">
      Generate Excuse
    </button>
    <ExcuseCanvas v-if="excuse" :text="excuse.text" :rarity="excuse.rarity" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WalletConnect from '~/components/WalletConnect.vue'
import { generateExcuse } from '../../lib/excuseEngine'
import ExcuseCanvas from '~/components/ExcuseCanvas.vue'

const excuse = ref<any>(null)

const roll = () => {
  excuse.value = generateExcuse()
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background: radial-gradient(circle at top, #1f2933, #020617);
  color: white;
  text-align: center;
}

.card {
  width: 90%;
  max-width: 420px;
  padding: 24px;
  border-radius: 16px;
  background: #020617;
  border: 2px solid #1e293b;
  animation: pop .3s ease;
}

.rarity {
  font-size: 0.7rem;
  letter-spacing: 2px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.generate {
  background: linear-gradient(135deg,#7c3aed,#ec4899);
  border: none;
  padding: 14px 26px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: white;
}

.common { border-color: #94a3b8 }
.rare { border-color: #38bdf8 }
.epic { border-color: #c084fc }
.legendary { border-color: #facc15 }
.mythic { border-color: #fb7185 }

@keyframes pop {
  0% { transform: scale(.9); opacity: 0 }
  100% { transform: scale(1); opacity: 1 }
}
</style>