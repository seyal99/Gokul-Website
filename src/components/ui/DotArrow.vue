<script setup>
import { computed } from 'vue'
const props = defineProps({ direction: { type: String, default: 'right' } })
const grid = ['000001000', '000000100', '000000010', '111111111', '000000010', '000000100', '000001000']
const dots = grid.flatMap((row, y) => [...row].flatMap((cell, x) => cell === '1' ? [{ x: 4 + x * 4, y: 8 + y * 4 }] : []))
const rotation = computed(() => props.direction === 'left' ? 180 : props.direction === 'up' ? -90 : 0)
</script>
<template>
  <svg class="dot-arrow" viewBox="0 0 40 40" aria-hidden="true"><g :transform="`rotate(${rotation} 20 20)`"><circle v-for="(dot, index) in dots" :key="index" :cx="dot.x" :cy="dot.y" r="1.25" fill="currentColor" /></g></svg>
</template>
