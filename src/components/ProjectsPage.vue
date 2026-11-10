<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import DotArrow from './ui/DotArrow.vue'
import portfolio from '../data/portfolio.json'
import droneDemo from '../assets/images/ssmdrone.gif'
import ragImage from '../assets/images/rag.png'
import peftImage from '../assets/images/peft.png'
import DotText from './ui/DotText.vue'
import LearningByDoing from './ui/LearningByDoing.vue'
import ProjectEntry from './ui/ProjectEntry.vue'

const props = defineProps({ mini: { type: Boolean, default: false } })
const images = import.meta.glob('../assets/images/{ssmdrone,eventflow,spaceship,soccer3d,gpt2,rag,trt,peft}.{webp,mp4}', { eager: true, query: '?url', import: 'default' })
const imageFor = name => images[`../assets/images/${name}`]
const videoFor = name => /\.gif$/i.test(name) ? imageFor(name.replace(/\.gif$/i, '.mp4')) : undefined
const previewFor = name => name === 'ssmdrone.gif' ? droneDemo : imageFor(name.replace(/\.gif$/i, '.webp'))
const academicEntries = portfolio.projects.map(project => ({
  ...project,
  htmlDescription: true,
  video: videoFor(project.image),
  poster: imageFor(project.image.replace(/\.gif$/i, '.webp')),
  image: previewFor(project.image),
}))
const fullSizeImages = { rag: ragImage, peft: peftImage }
const personalEntries = portfolio.minis.map(project => ({
  ...project,
  uniformPreview: true,
  image: imageFor(`${project.id}.webp`),
  srcset: fullSizeImages[project.id] ? `${imageFor(`${project.id}.webp`)} 700w, ${fullSizeImages[project.id]} 1536w` : undefined,
  links: [{ label: 'code', href: project.href }],
}))
const collections = [
  { id: 'academic', label: 'Academic projects', path: '/projects/', entries: academicEntries },
  { id: 'personal', label: 'Personal projects', path: '/mini-projects/', entries: personalEntries },
]
const selected = ref(props.mini ? 'personal' : 'academic')
const isPersonal = computed(() => selected.value === 'personal')
const tabList = ref(null)
const tabOutline = ref(null)
let tabObserver
const countLabel = entries => String(entries.length).padStart(2, '0')

function measureTabOutline() {
  const list = tabList.value
  const active = list?.querySelector('[aria-selected="true"]')
  if (!list || !active) return
  const strip = list.getBoundingClientRect()
  const tab = active.getBoundingClientRect()
  if (!strip.width || !strip.height) return
  const left = tab.left - strip.left
  const right = tab.right - strip.left
  const radius = 12
  const top = .5
  const baseline = strip.height - .5
  // One continuous stroke joins both lower curves to the baseline at any zoom.
  const path = [
    `M0 ${baseline} H${left - radius}`,
    `A${radius} ${radius} 0 0 0 ${left} ${baseline - radius}`,
    `V${top + radius} A${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
    `H${right - radius} A${radius} ${radius} 0 0 1 ${right} ${top + radius}`,
    `V${baseline - radius} A${radius} ${radius} 0 0 0 ${right + radius} ${baseline}`,
    `H${strip.width}`,
  ].join(' ')
  tabOutline.value = { width: strip.width, height: strip.height, path }
}
watch(selected, () => nextTick(measureTabOutline))

function updateTitle() {
  document.title = `${isPersonal.value ? 'Personal' : 'Academic'} Projects — Gokul Raju`
}
function selectCollection(id) {
  const collection = collections.find(item => item.id === id)
  if (!collection) return
  selected.value = id
  updateTitle()
  if (window.location.pathname !== collection.path) {
    window.history.pushState({ ...window.history.state, projectCollection: id }, '', collection.path)
  }
}
function onTabKeydown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  const tabs = [...tabList.value.querySelectorAll('[role="tab"]')]
  const current = tabs.indexOf(event.target)
  if (current < 0) return
  const next = event.key === 'ArrowRight' ? (current + 1) % tabs.length
    : event.key === 'ArrowLeft' ? (current - 1 + tabs.length) % tabs.length
    : event.key === 'Home' ? 0
    : event.key === 'End' ? tabs.length - 1 : null
  if (next === null) return
  event.preventDefault()
  tabs[next].focus({ preventScroll: true })
  selectCollection(collections[next].id)
}
async function restoreCollection() {
  const restoreFocus = tabList.value?.contains(document.activeElement)
  selected.value = window.location.pathname.includes('mini-projects') ? 'personal' : 'academic'
  updateTitle()
  if (restoreFocus) {
    await nextTick()
    tabList.value?.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true })
  }
}
onMounted(() => {
  updateTitle()
  measureTabOutline()
  tabObserver = new ResizeObserver(measureTabOutline)
  tabObserver.observe(tabList.value)
  tabList.value.querySelectorAll('[role="tab"]').forEach(tab => tabObserver.observe(tab))
  window.addEventListener('popstate', restoreCollection)
})
onUnmounted(() => {
  tabObserver?.disconnect()
  window.removeEventListener('popstate', restoreCollection)
})
</script>

<template>
  <div class="archive-page">
    <a class="back-link" href="/">back to home <DotArrow direction="left" /></a>
    <header class="archive-header">
      <div class="archive-title"><h1><DotText text="projects" /></h1><LearningByDoing /></div>
      <p>A collection of my research, projects, and smaller experiments.</p>
    </header>

    <div class="project-browser">
      <div ref="tabList" class="archive-navigation" role="tablist" aria-label="Project collections" @keydown="onTabKeydown">
        <svg v-if="tabOutline" class="tab-outline" :viewBox="`0 0 ${tabOutline.width} ${tabOutline.height}`" preserveAspectRatio="none" aria-hidden="true"><path :d="tabOutline.path" fill="var(--paper)" stroke="var(--line)" vector-effect="non-scaling-stroke" /></svg>
        <button v-for="collection in collections" :id="`${collection.id}-tab`" :key="collection.id" class="collection-tab" type="button" role="tab" :aria-selected="selected === collection.id" :aria-controls="`${collection.id}-panel`" :tabindex="selected === collection.id ? 0 : -1" @click="selectCollection(collection.id)">
          <span class="collection-label">{{ collection.label }}</span><span class="collection-count">{{ countLabel(collection.entries) }}</span>
        </button>
      </div>
      <div class="project-panels">
        <section v-for="collection in collections" :id="`${collection.id}-panel`" :key="collection.id" class="collection-panel" :class="{ 'is-active': selected === collection.id }" role="tabpanel" :aria-labelledby="`${collection.id}-tab`" :hidden="selected !== collection.id" tabindex="0">
          <div v-if="selected === collection.id" class="project-list">
            <ProjectEntry v-for="entry in collection.entries" :key="entry.id" :entry="entry" />
          </div>
        </section>
      </div>
    </div>
    <div class="archive-end"><a href="#top">back to top <DotArrow direction="up" /></a></div>
  </div>
</template>
