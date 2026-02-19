<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Application } from "@splinetool/runtime";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import ParentSize from "./ParentSize.vue";

interface Props {
  scene: string;
  class?: HTMLAttributes["class"];
  renderOnDemand?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  renderOnDemand: true
});

const emit = defineEmits<{
  load: [Application];
  splineMouseDown: [unknown];
  splineMouseHover: [unknown];
  splineKeyDown: [unknown];
  splineStart: [unknown];
  splineLookAt: [unknown];
  splineFollow: [unknown];
  splineScroll: [unknown];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let splineApp: Application | null = null;

async function setupSpline() {
  if (!canvasRef.value || !props.scene) return;

  splineApp?.dispose();
  splineApp = new Application(canvasRef.value, {
    renderOnDemand: props.renderOnDemand
  });

  await splineApp.load(props.scene);
  emit("load", splineApp);

  const mapping: Record<string, string> = {
    mouseDown: "splineMouseDown",
    mouseHover: "splineMouseHover",
    keyDown: "splineKeyDown",
    start: "splineStart",
    lookAt: "splineLookAt",
    follow: "splineFollow",
    scroll: "splineScroll"
  };

  Object.entries(mapping).forEach(([eventName, emitName]) => {
    splineApp?.addEventListener(eventName, (event) => {
      emit(emitName as keyof typeof mapping, event);
    });
  });
}

onMounted(() => {
  setupSpline();
});

watch(
  () => props.scene,
  () => {
    setupSpline();
  }
);

onBeforeUnmount(() => {
  splineApp?.dispose();
  splineApp = null;
});
</script>

<template>
  <ParentSize>
    <template #default="{ width, height }">
      <canvas
        ref="canvasRef"
        :class="props.class"
        :width="width"
        :height="height"
      />
    </template>
  </ParentSize>
</template>
