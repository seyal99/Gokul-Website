<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  words: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: ""
  },
  start: {
    type: Boolean,
    default: false
  },
  stepMs: {
    type: Number,
    default: 62
  }
});

const emit = defineEmits(["complete"]);
const active = ref(false);

const tokens = computed(() => props.words.trim().split(/\s+/));

function scheduleComplete() {
  const total = tokens.value.length * props.stepMs + 780;
  window.setTimeout(() => {
    emit("complete");
  }, total);
}

watch(
  () => props.start,
  (value) => {
    if (!value) return;
    active.value = true;
    scheduleComplete();
  },
  { immediate: true }
);
</script>

<template>
  <p :class="[props.class]">
    <span
      v-for="(word, index) in tokens"
      :key="`${word}-${index}`"
      class="tg-word"
      :class="{ 'tg-word--active': active }"
      :style="{ animationDelay: `${index * props.stepMs}ms` }"
    >
      {{ word }}
    </span>
  </p>
</template>

<style scoped>
.tg-word {
  display: inline-block;
  opacity: 0;
  filter: blur(10px);
  transform: translateY(8px);
  margin-right: 0.34ch;
}

.tg-word--active {
  animation: tg-reveal 640ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes tg-reveal {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}
</style>
