<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholders: {
    type: Array,
    default: () => ["Ask anything..."]
  }
});

const emit = defineEmits(["update:modelValue", "submit"]);

const placeholderIndex = ref(0);
const vanishing = ref(false);
const inputRef = ref(null);
let intervalId = null;

const activePlaceholder = computed(() => {
  if (!props.placeholders.length) return "Ask anything...";
  return props.placeholders[placeholderIndex.value % props.placeholders.length];
});

const canSubmit = computed(() => props.modelValue.trim().length > 0);

function onInput(event) {
  emit("update:modelValue", event.target.value);
  if (inputRef.value) {
    const maxHeight = 120;
    inputRef.value.style.height = "auto";
    const nextHeight = Math.min(inputRef.value.scrollHeight, maxHeight);
    inputRef.value.style.height = `${nextHeight}px`;
    inputRef.value.style.overflowY = inputRef.value.scrollHeight > maxHeight ? "auto" : "hidden";
  }
}

function submitInput() {
  if (!canSubmit.value) return;
  const value = props.modelValue.trim();
  if (!value) return;
  vanishing.value = true;
  emit("submit", value);
  window.setTimeout(() => {
    vanishing.value = false;
  }, 220);
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
    inputRef.value.style.height = `${inputRef.value.scrollHeight}px`;
    inputRef.value.style.overflowY = "hidden";
  }
  intervalId = window.setInterval(() => {
    placeholderIndex.value = (placeholderIndex.value + 1) % Math.max(1, props.placeholders.length);
  }, 2200);
});

onBeforeUnmount(() => {
  if (intervalId) window.clearInterval(intervalId);
});

watch(
  () => props.modelValue,
  (value) => {
    if (!inputRef.value) return;
    if (value.length === 0) {
      inputRef.value.style.height = "auto";
      inputRef.value.style.overflowY = "hidden";
    }
  }
);
</script>

<template>
  <div class="vanish-input-wrap">
    <textarea
      ref="inputRef"
      class="vanish-input"
      :class="{ 'is-vanishing': vanishing }"
      :value="props.modelValue"
      :placeholder="activePlaceholder"
      rows="1"
      @input="onInput"
      @keydown.enter.prevent="submitInput"
    />
    <button class="vanish-send" :disabled="!canSubmit" type="button" @click="submitInput" aria-label="Send">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="m12 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.vanish-input-wrap {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.45rem;
}

.vanish-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  border-radius: 0.6rem;
  padding: 0.56rem 0.66rem;
  outline: none;
  transition: opacity 160ms ease, transform 160ms ease, filter 160ms ease, border-color 140ms ease;
  line-height: 1.3;
  resize: none;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vanish-input::-webkit-scrollbar {
  display: none;
}

.vanish-input:focus {
  border-color: rgba(255, 255, 255, 0.45);
}

.vanish-input::placeholder {
  color: rgba(226, 232, 240, 0.58);
}

.vanish-input.is-vanishing {
  opacity: 0.5;
  transform: scale(0.985);
  filter: blur(1.5px);
}

.vanish-send {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.9);
  color: #020617;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease, opacity 140ms ease;
}

.vanish-send:disabled {
  cursor: default;
  opacity: 0.55;
}

.vanish-send svg {
  width: 1.05rem;
  height: 1.05rem;
}
</style>
