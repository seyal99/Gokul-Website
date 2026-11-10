<script setup lang="ts">
import { inject } from "vue";
import { ORIENTATION_INJECTION_KEY } from "./dock-injection-keys";

const orientation = inject(ORIENTATION_INJECTION_KEY, "vertical");
</script>

<template>
  <div
    class="dock-separator"
    :class="{ 'dock-separator--vertical': orientation === 'vertical' }"
  />
</template>
