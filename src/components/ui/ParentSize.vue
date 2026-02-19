<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const hostRef = ref<HTMLElement | null>(null);
const width = ref(0);
const height = ref(0);
let observer: ResizeObserver | null = null;

function measure() {
  if (!hostRef.value) return;
  const rect = hostRef.value.getBoundingClientRect();
  width.value = Math.max(1, Math.floor(rect.width));
  height.value = Math.max(1, Math.floor(rect.height));
}

onMounted(() => {
  measure();
  observer = new ResizeObserver(() => {
    measure();
  });
  if (hostRef.value) observer.observe(hostRef.value);
  window.addEventListener("resize", measure, { passive: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("resize", measure);
});
</script>

<template>
  <div ref="hostRef" class="parent-size-root">
    <slot :width="width" :height="height" />
  </div>
</template>

<style scoped>
.parent-size-root {
  width: 100%;
  height: 100%;
}
</style>
