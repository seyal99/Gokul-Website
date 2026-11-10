<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import ExperienceEntryHeader from './ExperienceEntryHeader.vue'

defineProps({ item: { type: Object, required: true } })

const disclosure = ref(null)
const summary = ref(null)
const body = ref(null)
const description = ref(null)
const reducedMotion = usePreferredReducedMotion()
let animation = null
let observer
let targetOpen = false

function finish(open) {
  const previous = animation
  animation = null
  previous?.cancel()
  disclosure.value.open = open
  body.value.style.height = ''
  targetOpen = open
}

function animateTo(open) {
  targetOpen = open
  const element = body.value
  // Read the live height before cancelling, so rapid clicks reverse smoothly.
  const from = disclosure.value.open ? element.getBoundingClientRect().height : 0
  animation?.cancel()
  animation = null
  disclosure.value.open = true
  element.style.height = 'auto'
  const to = open ? element.getBoundingClientRect().height : 0
  if (reducedMotion.value === 'reduce' || !element.animate || Math.abs(to - from) < .5) {
    finish(open)
    return
  }
  element.style.height = `${from}px`
  const next = element.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration: 300,
    easing: 'cubic-bezier(.22, 1, .36, 1)',
  })
  animation = next
  next.onfinish = () => {
    if (animation === next) finish(targetOpen)
  }
}

function toggle() {
  animateTo(!targetOpen)
}

function syncOpen() {
  if (!animation) targetOpen = disclosure.value.open
}

watch(reducedMotion, value => {
  if (value === 'reduce' && animation) finish(targetOpen)
})

onMounted(() => {
  observer = new ResizeObserver(() => {
    if (animation) animateTo(targetOpen)
  })
  observer.observe(summary.value)
  observer.observe(description.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  animation?.cancel()
})
</script>

<template>
  <details ref="disclosure" class="experience-disclosure" @toggle="syncOpen">
    <summary ref="summary" class="experience-entry experience-trigger" @click.prevent="toggle">
      <ExperienceEntryHeader :item="item" />
    </summary>
    <div ref="body" class="experience-disclosure-body">
      <p ref="description" class="experience-description">{{ item.description }}</p>
    </div>
  </details>
</template>

<style scoped>
.experience-disclosure-body { overflow: hidden; }
</style>
