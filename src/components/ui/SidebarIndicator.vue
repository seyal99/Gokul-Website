<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ activeSection: { type: String, required: true } })
const layer = ref(null)
const visible = ref(false)
const position = ref(0)
const animate = ref(false)
let observer
let placed = false

function measure() {
  const navigation = layer.value?.parentElement
  const active = navigation?.querySelector('a.is-active')
  if (!active || !navigation.offsetWidth) {
    visible.value = false
    animate.value = false
    placed = false
    return
  }
  const navigationBox = navigation.getBoundingClientRect()
  const activeBox = active.getBoundingClientRect()
  const destination = activeBox.top - navigationBox.top + (activeBox.height - 16) / 2
  position.value = destination
  if (!placed) {
    animate.value = false
    nextTick(() => {
      if (!layer.value) return
      layer.value.firstElementChild.getBoundingClientRect()
      animate.value = true
    })
  }
  placed = true
  visible.value = true
}
watch(() => props.activeSection, () => nextTick(measure))
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  const navigation = layer.value.parentElement
  observer.observe(navigation)
  navigation.querySelectorAll('a').forEach(link => observer.observe(link))
})
onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="layer" class="section-indicator-layer" aria-hidden="true">
    <div class="section-indicator" :class="{ 'can-animate': animate }" :style="{ transform: `translateY(${position}px)`, opacity: visible ? 1 : 0 }"></div>
  </div>
</template>
