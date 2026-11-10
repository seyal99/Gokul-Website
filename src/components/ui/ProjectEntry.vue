<script setup>
import { onBeforeUnmount, ref } from 'vue'
import DotArrow from './DotArrow.vue'

defineProps({ entry: { type: Object, required: true } })
const videoElement = ref(null)
onBeforeUnmount(() => videoElement.value?.pause())
</script>

<template>
  <article :id="entry.id" class="project-entry">
    <figure class="project-media" :class="{ 'project-media--uniform': entry.uniformPreview }">
      <video v-if="entry.video" ref="videoElement" :src="entry.video" :poster="entry.poster" :aria-label="`${entry.title} demonstration`" autoplay muted loop playsinline disablepictureinpicture disableremoteplayback tabindex="-1" preload="metadata" @contextmenu.prevent></video>
      <img v-else :src="entry.image" :srcset="entry.srcset" sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1000px) 640px, 450px" :alt="`${entry.title} preview`" loading="lazy" decoding="async">
    </figure>
    <div class="project-info">
      <header class="project-entry-heading">
        <h2><a v-if="entry.href" :href="entry.href" target="_blank" rel="noreferrer">{{ entry.title }} <DotArrow /></a><template v-else>{{ entry.title }}</template></h2>
      </header>
      <div v-if="entry.htmlDescription" class="project-description" v-html="entry.description"></div>
      <p v-else class="project-description">{{ entry.description }}</p>
      <div class="project-links"><a v-for="link in entry.links" :key="link.href" :href="link.href" target="_blank" rel="noreferrer">{{ link.label }} <DotArrow /></a></div>
    </div>
  </article>
</template>
