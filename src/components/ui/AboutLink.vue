<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  label: { type: String, required: true },
  href: { type: String, required: true },
})

const link = ref(null)
const labelElement = ref(null)
const strokes = ref([])
const viewBox = ref('0 0 1 1')
let observer
let disposed = false

function measure() {
  if (disposed || !labelElement.value) return
  const paragraph = link.value.closest('p')
  const bounds = paragraph.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  const range = document.createRange()
  range.selectNodeContents(labelElement.value)
  // Use text fragments so wrapped phrases get a stroke under each line.
  const lines = []
  for (const rect of range.getClientRects()) {
    if (!rect.width || !rect.height) continue
    const previous = lines.at(-1)
    if (previous && Math.abs(previous.bottom - rect.bottom) < 1 && rect.left <= previous.right + 1) {
      previous.right = Math.max(previous.right, rect.right)
    } else lines.push({ left: rect.left, right: rect.right, bottom: rect.bottom })
  }
  viewBox.value = `0 0 ${bounds.width} ${bounds.height}`
  strokes.value = lines.map((line, index) => {
    const x = line.left - bounds.left + .5
    const y = line.bottom - bounds.top + .5
    const width = Math.max(1, line.right - line.left - 1)
    const bend = index % 2 ? -1 : 1
    return {
      d: `M ${x} ${y} C ${x + width * .2} ${y - bend * 1.4}, ${x + width * .37} ${y + bend * 1.8}, ${x + width * .55} ${y + bend * .35} S ${x + width * .84} ${y - bend * .9}, ${x + width} ${y + bend * .3}`,
      delay: `${Math.min(index * 80, 160)}ms`,
    }
  })
}

onMounted(() => {
  observer = new ResizeObserver(measure)
  observer.observe(link.value.closest('p'))
  window.addEventListener('resize', measure)
  document.fonts?.addEventListener('loadingdone', measure)
  document.fonts?.ready.then(measure)
  measure()
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  window.removeEventListener('resize', measure)
  document.fonts?.removeEventListener('loadingdone', measure)
})
</script>

<template>
  <a ref="link" class="about-inline-link" :href="href" target="_blank" rel="noopener noreferrer">
    <span ref="labelElement">{{ label }}</span>
    <svg class="about-link-art" :viewBox="viewBox" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path v-for="(stroke, index) in strokes" :key="index" class="about-link-stroke" :d="stroke.d" pathLength="1" :style="{ '--stroke-delay': stroke.delay }" />
    </svg>
  </a>
</template>

<style scoped>
.about-link-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.about-link-stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition: stroke-dashoffset 360ms cubic-bezier(.22, 1, .36, 1), opacity 120ms ease;
}
@media (hover: hover) {
  .about-inline-link:hover .about-link-stroke {
    stroke-dashoffset: 0;
    opacity: 1;
    transition-delay: var(--stroke-delay), 0ms;
  }
}
.about-inline-link:focus-visible .about-link-stroke {
  stroke-dashoffset: 0;
  opacity: 1;
  transition-delay: var(--stroke-delay), 0ms;
}
@media (prefers-reduced-motion: reduce) {
  .about-link-stroke { transition: none; }
}
</style>
