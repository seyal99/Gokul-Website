<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { DataOrientation, Direction } from "./dock-types";
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue";
import {
  DISTANCE_INJECTION_KEY,
  ICON_SIZE_INJECTION_KEY,
  MAGNIFICATION_INJECTION_KEY,
  MOUSE_X_INJECTION_KEY,
  MOUSE_Y_INJECTION_KEY,
  ORIENTATION_INJECTION_KEY
} from "./dock-injection-keys";

interface DockProps {
  class?: HTMLAttributes["class"];
  magnification?: number;
  iconSize?: number;
  distance?: number;
  direction?: Direction;
  orientation?: DataOrientation;
}

const props = withDefaults(defineProps<DockProps>(), {
  magnification: 60,
  iconSize: 40,
  distance: 140,
  direction: "middle",
  orientation: "horizontal"
});

const dockRef = ref<HTMLElement | null>(null);
const mouseX = ref(Infinity);
const mouseY = ref(Infinity);
const magnification = computed(() => props.magnification);
const distance = computed(() => props.distance);
const iconSize = computed(() => props.iconSize);

const dockClass = computed(() => ({
  "dock--top": props.direction === "top",
  "dock--middle": props.direction === "middle",
  "dock--bottom": props.direction === "bottom"
}));

function onMouseMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return;
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
}

function onMouseLeave() {
  mouseX.value = Infinity;
  mouseY.value = Infinity;
}

function onVisibilityChange() {
  if (document.hidden) onMouseLeave();
}

onMounted(() => {
  window.addEventListener('blur', onMouseLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
});
onBeforeUnmount(() => {
  window.removeEventListener('blur', onMouseLeave);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

provide(MOUSE_X_INJECTION_KEY, mouseX);
provide(MOUSE_Y_INJECTION_KEY, mouseY);
provide(ORIENTATION_INJECTION_KEY, props.orientation);
provide(MAGNIFICATION_INJECTION_KEY, magnification);
provide(DISTANCE_INJECTION_KEY, distance);
provide(ICON_SIZE_INJECTION_KEY, iconSize);
</script>

<template>
  <div
    ref="dockRef"
    class="dock"
    :class="[props.orientation === 'vertical' && 'dock--vertical', props.class, dockClass]"
    @pointermove="onMouseMove"
    @pointerleave="onMouseLeave"
    @pointercancel="onMouseLeave"
    @click="onMouseLeave"
  >
    <slot />
  </div>
</template>
