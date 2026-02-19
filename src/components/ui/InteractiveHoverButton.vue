<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  text?: string;
  class?: string;
  href?: string;
  target?: "_blank" | "_self";
  rel?: string;
  arrowDirection?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  text: "Button",
  href: "",
  target: "_blank",
  rel: "noreferrer noopener",
  arrowDirection: "right"
});

const tag = computed(() => (props.href ? "a" : "button"));
</script>

<template>
  <component
    :is="tag"
    :href="props.href || undefined"
    :target="props.href ? props.target : undefined"
    :rel="props.href ? props.rel : undefined"
    class="ihb relative inline-flex w-auto cursor-pointer items-center overflow-hidden rounded-full border border-white/45 bg-transparent px-5 py-2 text-center font-medium text-white"
    :class="[props.class]"
  >
    <div class="ihb-front">
      <span class="ihb-dot" />
      <span class="ihb-front-label">
        {{ text }}
      </span>
    </div>

    <div class="ihb-back">
      <svg
        v-if="props.arrowDirection === 'left'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-arrow-left"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      <span class="whitespace-nowrap">{{ text }}</span>
      <svg
        v-if="props.arrowDirection === 'right'"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-arrow-right"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </div>
  </component>
</template>

<style scoped>
.ihb {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  appearance: none;
  -webkit-appearance: none;
  background-color: transparent;
  color: #ffffff;
  transition: background-color 220ms ease, border-color 220ms ease;
}

.ihb:hover {
  background-color: #ffffff !important;
  border-color: #ffffff;
}

.ihb-front {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 280ms ease, opacity 280ms ease;
}

.ihb-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #ffffff;
  transition: background-color 280ms ease, transform 280ms ease;
}

.ihb-front-label {
  color: #ffffff;
}

.ihb-back {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: #000000;
  opacity: 0;
  transform: translateX(2rem);
  transition: transform 280ms ease, opacity 280ms ease;
}

.ihb:hover .ihb-front {
  transform: translateX(2rem);
  opacity: 0;
}

.ihb:hover .ihb-dot {
  background: #000000;
}

.ihb:hover .ihb-back {
  transform: translateX(0);
  opacity: 1;
}
</style>
