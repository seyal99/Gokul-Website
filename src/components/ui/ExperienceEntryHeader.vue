<script setup>
import BrandLogo from './BrandLogo.vue'
defineProps({ item: { type: Object, required: true } })
</script>
<template>
  <span class="experience-brand" :class="`brand-${item.brand}`"><BrandLogo :brand="item.brand" /></span>
  <span class="experience-copy">
    <span class="experience-dates"><template v-if="item.start"><time :datetime="item.start">{{ item.startLabel }}</time><span aria-hidden="true"> – </span></template><time v-if="item.end" :datetime="item.end">{{ item.endLabel }}</time><span v-else :class="{ 'present-label': item.current }">{{ item.endLabel }}</span></span>
    <span class="experience-role-title">{{ item.role }}</span>
    <span class="experience-organization">{{ item.name }}</span>
  </span>
</template>
