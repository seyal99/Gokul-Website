<script setup>
import ExperienceEntryHeader from './ExperienceEntryHeader.vue'
import ExperienceDisclosure from './ExperienceDisclosure.vue'
import Doodle from './Doodle.vue'
defineProps({ heading: { type: String, required: true }, items: { type: Array, required: true }, sketch: { type: String, default: '' } })
</script>
<template>
  <div class="experience-column">
    <h3><span>{{ heading }}</span><span v-if="sketch" class="experience-heading-art" aria-hidden="true"><Doodle :kind="sketch" class="experience-heading-sketch" /></span></h3>
    <ol class="experience-list">
      <li v-for="item in items" :key="item.name" class="experience-item">
        <ExperienceDisclosure v-if="item.description" :item="item" />
        <div v-else class="experience-entry"><ExperienceEntryHeader :item="item" /></div>
      </li>
    </ol>
  </div>
</template>
