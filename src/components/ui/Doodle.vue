<script setup>
defineProps({ kind: { type: String, default: 'drone' } })
</script>
<template>
  <svg class="doodle" :viewBox="kind === 'arm' ? '0 0 110 82' : '0 0 100 80'" fill="none" aria-hidden="true">
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="kind === 'drone'"><path d="m29 23 41 35m-1-35L30 58M42 31l16 1 3 14-13 8-10-10 4-13Z"/><path d="M12 21c-1-12 27-13 29-1 2 12-27 16-29 1Zm47-1c0-12 29-12 29 0s-29 12-29 0ZM12 59c-1-13 28-13 29-1 1 13-29 14-29 1Zm47 0c0-12 29-12 29 0s-29 13-29 0Z"/><path d="m48 36 7 1m-7 4 6 1M8 12l-3-4m87 58 4 3M51 10V5"/></template>
      <template v-else-if="kind === 'notebook'"><path d="m29 12 45 3-5 56-46-4 6-55Zm7 1-5 55M22 20l14 1M21 31l14 1M20 42l14 1M19 53l14 1m7-8 19 2m-18-9 21 2m-20-9 15 1"/><path d="m69 58 13-18 5 4-13 18-7 4 2-8Z"/></template>
      <template v-else-if="kind === 'pen'">
        <path d="m26 58 36-41c4-5 9-5 13-1l3 3c4 4 3 9-1 13L40 71l-18 5 4-18Z" />
        <path d="m27 58 13 13M62 18l15 14M32 65 22 76M70 13l4-5c3-2 6 1 5 4l-3 4M57 27 33 55" />
        <path d="M50 65c4-5 11-6 11-2 0 5-9 10-5 11 4 2 9-8 13-7 3 1-2 6 2 6l13-2" />
      </template>
      <template v-else-if="kind === 'camera'"><path d="m18 27 17-2 5-9 22 1 4 10 17 2-2 38-64-3 1-37Z"/><path d="M37 46c0-19 29-20 29 0s-29 20-29 0Z"/><path d="M43 45c-1-11 17-13 17 0s-17 13-17 0Zm-17-9 5 1M71 35l4 1M12 14l-4-5m79 10 6-4"/></template>
      <template v-else-if="kind === 'papers'">
        <path d="m29 12 48 4 6 48-9 2M19 20l37-4 15 13 3 39-50 4-5-52ZM56 16l2 15 13-2" />
        <path d="m30 39 25-2m-24 11 32-3m-31 12 23-2m-22 11 30-3" />
      </template>
      <template v-else-if="kind === 'briefcase'">
        <path d="m36 28 1-12 26 1 2 10M17 30l67-3 1 39-65 3-3-39Z" />
        <path d="M18 40c17 12 47 13 66-2M45 43l12-1 1 11-12 1-1-11ZM22 73c18-2 41 1 60-2" />
      </template>
      <template v-else-if="kind === 'graduation'">
        <path d="m10 28 39-17 41 15-39 19-41-17Zm20 12 1 17c11 10 29 10 42-1l-1-18M50 28l30 7 1 23" />
        <path d="M79 57c-1 4-3 9-3 13l10-1-4-12M35 60c9 5 23 5 32-1" />
      </template>
      <template v-else-if="kind === 'arm'">
        <path d="m21 71 48 1-2-7-42-1-4 7Zm16-8 2-15 12-3 9 19M39 48 23 30l7-7 23 22M28 23l24-12 5 7-24 15M53 11l14 9-4 8-12-9" />
        <path d="M64 19c4-5 12-1 12 4 0 6-9 9-12 3m5-5 3 3M76 21l7 1-1 8-7-1M83 22l7-7 14 3-1 7-5-1 1-2-8-1-5 6M82 29l5 10 14 2 1-7-5-1v3l-7-2-4-8" />
        <path d="M23 29c-3-7 8-12 12-6 5 7-7 13-12 6Zm19 19c-2-6 7-9 10-4 3 6-8 10-10 4ZM13 75c24-2 44 3 66-1" />
      </template>
      <template v-else><path d="m10 43 79-29-26 57-14-21-39-7Zm39 7 40-36M49 50l-7 17 13-9"/><path d="M8 62c4 7 13 8 19 4M4 52l10 2m7 22 9-4"/></template>
    </g>
  </svg>
</template>
