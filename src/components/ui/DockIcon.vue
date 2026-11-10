<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { Motion, useMotionValue, useSpring } from 'motion-v';
import { usePreferredReducedMotion } from '@vueuse/core';
import { DISTANCE_INJECTION_KEY, ICON_SIZE_INJECTION_KEY, MAGNIFICATION_INJECTION_KEY, MOUSE_X_INJECTION_KEY, MOUSE_Y_INJECTION_KEY, ORIENTATION_INJECTION_KEY } from './dock-injection-keys';

const iconRef = ref<HTMLDivElement | null>(null);
const mouseX = inject(MOUSE_X_INJECTION_KEY, ref(Infinity));
const mouseY = inject(MOUSE_Y_INJECTION_KEY, ref(Infinity));
const distance = inject(DISTANCE_INJECTION_KEY, computed(() => 42));
const magnification = inject(MAGNIFICATION_INJECTION_KEY, computed(() => 8));
const iconSize = inject(ICON_SIZE_INJECTION_KEY, computed(() => 40));
const orientation = inject(ORIENTATION_INJECTION_KEY, 'horizontal');
const focused = ref(false);
const reducedMotion = usePreferredReducedMotion();
const scaleTarget = useMotionValue(1);
const liftTarget = useMotionValue(0);
const spring = { stiffness: 300, damping: 25, mass: .5 };
const scale = useSpring(scaleTarget, spring);
const y = useSpring(liftTarget, spring);

function onFocusIn(event: FocusEvent) {
  focused.value = event.target instanceof Element && event.target.matches(':focus-visible');
}

// Measure the fixed slot, so magnification never moves the pointer target.
const influence = computed(() => {
  if (reducedMotion.value === 'reduce') return 0;
  if (focused.value) return 1;
  const bounds = iconRef.value?.getBoundingClientRect();
  if (!bounds) return 0;
  const delta = orientation === 'vertical' ? mouseY.value - bounds.y - bounds.height / 2 : mouseX.value - bounds.x - bounds.width / 2;
  if (!Number.isFinite(delta) || Math.abs(delta) >= distance.value) return 0;
  return (1 + Math.cos(Math.PI * delta / distance.value)) / 2;
});
watch([influence, reducedMotion], () => {
  if (reducedMotion.value === 'reduce') {
    scaleTarget.jump(1); liftTarget.jump(0); scale.jump(1); y.jump(0);
  } else {
    scaleTarget.set(1 + influence.value * magnification.value / iconSize.value);
    liftTarget.set(-3 * influence.value);
  }
}, { immediate: true });
onBeforeUnmount(() => { scale.destroy(); y.destroy(); scaleTarget.destroy(); liftTarget.destroy(); });
</script>

<template>
  <div ref="iconRef" class="dock-icon" :style="{ width: `${iconSize}px`, height: `${iconSize}px` }" @focusin="onFocusIn" @focusout="focused = false" @pointerdown="focused = false">
    <Motion class="dock-icon-visual" :style="{ scale, y }"><slot /></Motion>
  </div>
</template>
