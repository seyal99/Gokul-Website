<script setup>
import MeiLogo from './MeiLogo.vue'
import ethLogo from '../../assets/logos/eth-acronym.svg?raw'
import heriotWattLogo from '../../assets/logos/heriot-watt-crest.svg?raw'
defineProps({ brand: { type: String, required: true } })
</script>
<template>
  <svg v-if="brand === 'personal'" viewBox="0 0 40 40" fill="none" aria-hidden="true" class="personal-mark"><path d="M5 12V5h7M28 5h7v7M35 28v7h-7M12 35H5v-7" stroke="currentColor" stroke-width="3" /><path d="M13 14h14v12H13z" fill="currentColor" /><path d="M17 18v4M23 18v4" stroke="var(--paper)" stroke-width="2" /><path d="M20 10v4M20 26v4" stroke="currentColor" stroke-width="2" /></svg>
  <MeiLogo v-else-if="brand === 'mei'" />
  <span v-else-if="brand === 'fprime'" class="institution-logo fprime-logo" role="img" aria-label="FPrime AI"></span>
  <span v-else-if="brand === 'eth'" class="institution-logo eth-logo" role="img" aria-label="ETH" v-html="ethLogo"></span>
  <img v-else-if="brand === 'rpg'" class="institution-logo rpg-logo" src="/logos/rpg-symbol.png" alt="Robotics and Perception Group, University of Zurich" width="52" height="45">
  <span v-else-if="brand === 'hw'" class="institution-logo hw-logo" role="img" aria-label="Heriot-Watt University" v-html="heriotWattLogo"></span>
</template>
