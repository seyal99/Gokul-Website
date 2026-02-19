<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { Motion } from "motion-v";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

interface Props {
  containerClass?: HTMLAttributes["class"];
  class?: HTMLAttributes["class"];
  items?: {
    id: string;
    label: string;
  }[];
  title?: string;
  description?: string;
  scrollOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  scrollOffset: 96
});

const timelineContainerRef = ref<HTMLElement | null>(null);
const timelineRef = ref<HTMLElement | null>(null);
const lineTop = ref(0);
const lineHeight = ref(0);
const lineProgress = ref(0);
const firstDotCenterDocY = ref(0);
const lastDotCenterDocY = ref(0);
let resizeObserver: ResizeObserver | null = null;
let syncHeightFn: (() => void) | null = null;

function measureDots() {
  if (!timelineRef.value) return;
  const dots = timelineRef.value.querySelectorAll<HTMLElement>(".timeline-dot-wrap");
  if (dots.length > 0) {
    const containerRect = timelineRef.value.getBoundingClientRect();
    const first = dots[0];
    const last = dots[dots.length - 1];
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const firstCenter = firstRect.top - containerRect.top + firstRect.height / 2;
    const lastCenter = lastRect.top - containerRect.top + lastRect.height / 2;
    lineTop.value = firstCenter;
    lineHeight.value = Math.max(0, lastCenter - firstCenter);
    firstDotCenterDocY.value = firstRect.top + window.scrollY + firstRect.height / 2;
    lastDotCenterDocY.value = lastRect.top + window.scrollY + lastRect.height / 2;
    return;
  }

  lineTop.value = 0;
  lineHeight.value = Math.max(0, timelineRef.value.scrollHeight);
  firstDotCenterDocY.value = 0;
  lastDotCenterDocY.value = 0;
}

onMounted(async () => {
  await nextTick();
  const syncHeight = () => {
    measureDots();
    updateLineProgress();
  };
  syncHeightFn = syncHeight;

  syncHeight();
  resizeObserver = new ResizeObserver(syncHeight);
  if (timelineRef.value) resizeObserver.observe(timelineRef.value);
  window.addEventListener("scroll", updateLineProgress, { passive: true });
  window.addEventListener("resize", syncHeight, { passive: true });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("scroll", updateLineProgress);
  if (syncHeightFn) {
    window.removeEventListener("resize", syncHeightFn);
  }
});

function updateLineProgress() {
  if (lineHeight.value <= 0) {
    lineProgress.value = 0;
    return;
  }

  const doc = document.documentElement;
  // Use a deeper viewport anchor so the progress starts earlier while scrolling.
  const viewportAnchor = window.innerHeight * 0.42;
  const anchorOffset = Math.max(props.scrollOffset, viewportAnchor);
  const anchorDocY = window.scrollY + anchorOffset;
  const maxReachableAnchor = doc.scrollHeight - window.innerHeight + anchorOffset;
  const effectiveLast = Math.min(lastDotCenterDocY.value, maxReachableAnchor);
  const total = effectiveLast - firstDotCenterDocY.value;

  if (total <= 0) {
    lineProgress.value = anchorDocY >= effectiveLast ? lineHeight.value : 0;
    return;
  }

  const ratio = (anchorDocY - firstDotCenterDocY.value) / total;
  const clamped = Math.min(1, Math.max(0, ratio));
  lineProgress.value = clamped * lineHeight.value;
}

</script>

<template>
  <div ref="timelineContainerRef" class="timeline-root" :class="[props.containerClass]">
    <div ref="timelineRef" class="timeline-track-area" :class="[props.class]">
      <div
        v-for="(item, index) in props.items"
        :id="`timeline-item-${item.id}`"
        :key="item.id + index"
        class="timeline-row"
      >
        <div class="timeline-year-col">
          <div
            class="timeline-dot-wrap"
          >
            <div class="timeline-dot" />
          </div>
        </div>
        <div class="timeline-content">
          <slot :name="item.id" />
        </div>
      </div>
      <Motion
        as="div"
        :style="{
          top: `${lineTop}px`,
          height: `${lineProgress}px`,
          opacity: lineProgress > 0 ? 1 : 0
        }"
        class="timeline-line-progress"
      />
    </div>
  </div>
</template>

<style scoped>
.timeline-root {
  width: 100%;
  background: transparent;
  font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

.timeline-track-area {
  position: relative;
  max-width: 100%;
  padding-bottom: 0.5rem;
  --axis-x: 2rem;
}

.timeline-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  column-gap: 0.35rem;
  padding-top: 4.2rem;
  align-items: stretch;
  transition: opacity 160ms ease;
}

.timeline-year-col {
  position: relative;
  min-height: 2.5rem;
}

.timeline-dot-wrap {
  position: absolute;
  left: var(--axis-x);
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}

.timeline-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  border: 1px solid rgb(82 82 91);
  background: rgb(38 38 38);
}

.timeline-content {
  min-width: 0;
}

.timeline-line-progress {
  position: absolute;
  left: calc(var(--axis-x) - 1px);
  top: 0;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(to top, rgb(168 85 247) 0%, rgb(59 130 246) 12%, transparent 100%);
}

@media (max-width: 900px) {
  .timeline-track-area {
    --axis-x: 1.6rem;
  }

  .timeline-row {
    grid-template-columns: 56px 1fr;
    column-gap: 0.7rem;
    padding-top: 3.2rem;
  }

  .timeline-dot-wrap {
    width: 2.1rem;
    height: 2.1rem;
  }

  .timeline-dot {
    width: 0.82rem;
    height: 0.82rem;
  }
}
</style>
