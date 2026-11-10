<script setup>
import Dock from './Dock.vue'
import DockIcon from './DockIcon.vue'
import DockSeparator from './DockSeparator.vue'
</script>
<template>
  <nav class="social-dock" aria-label="Social links">
    <Dock :icon-size="28" :magnification="8" :distance="42" direction="middle" orientation="horizontal">
      <DockIcon><a class="dock-link dock-email" href="mailto:gokul10012000@gmail.com" aria-label="Email" title="Email"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M4.2 7.2 12 13l7.8-5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a></DockIcon>
      <DockSeparator />
      <DockIcon><a class="dock-link dock-github" href="https://github.com/seyal99" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.8-.25.8-.57v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.72 1.26 3.38.97.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.95 10.95 0 0 1 5.73 0c2.2-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.08 0 4.42-2.7 5.4-5.27 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.68.81.57A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg></a></DockIcon>
      <DockIcon><a class="dock-link dock-linkedin" href="https://www.linkedin.com/in/gokul-8011a/?skipRedirect=true" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.03-1.84-3.03-1.85 0-2.13 1.44-2.13 2.93v5.68H9.36V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.37-1.84 3.61 0 4.27 2.38 4.27 5.48v6.25ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.56V9h3.56v11.45Z"/></svg></a></DockIcon>
      <DockIcon><a class="dock-link dock-scholar" href="https://scholar.google.com/citations?user=16313Y8AAAAJ&hl=en" target="_blank" rel="noreferrer" aria-label="Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 1.8 8.6 12 14.2l8.3-4.55V16h1.9V8.6L12 3Z" fill="currentColor"/><path d="M6.2 13.1V17c0 .26.14.5.36.63C8.14 18.59 10.02 19.2 12 19.2c1.98 0 3.86-.61 5.44-1.57.22-.13.36-.37.36-.63v-3.9L12 16.3l-5.8-3.2Z" fill="currentColor"/></svg></a></DockIcon>
    </Dock>
  </nav>
</template>
