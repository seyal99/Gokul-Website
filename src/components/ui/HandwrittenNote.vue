<script setup>
defineProps({ arrow: { type: Boolean, default: false } })
</script>
<template>
  <span class="handwritten-note" :class="{ 'handwritten-note--arrow': arrow }" aria-hidden="true">
    <span><slot /></span>
    <svg v-if="arrow" viewBox="0 0 100 40" fill="none"><path d="M90 5C91 25 52 35 9 23M20 17L8 23l8 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
    <svg v-else viewBox="0 0 160 12" fill="none" preserveAspectRatio="none"><path d="M3 6C35 1 72 9 113 5c15-2 28-2 42-1M23 10c34-3 70 1 108-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /></svg>
  </span>
</template>
