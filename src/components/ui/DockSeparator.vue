<script setup lang="ts">
import { inject } from "vue";
import { ORIENTATION_INJECTION_KEY } from "./dock-injection-keys";

const orientation = inject(ORIENTATION_INJECTION_KEY, "vertical");
</script>

<template>
  <div
    class="relative block bg-slate-300/35 dark:bg-slate-600/50"
    :class="[orientation === 'vertical' ? 'h-0.5 w-4/5' : 'h-4/5 w-0.5']"
  />
</template>
