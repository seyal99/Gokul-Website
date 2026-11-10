<script setup>
import DotArrow from "./components/ui/DotArrow.vue"
import { onMounted, onUnmounted, ref } from 'vue'
import HomePage from './components/HomePage.vue'
import ProjectsPage from './components/ProjectsPage.vue'
import BlogPage from './components/BlogPage.vue'
import portrait from './assets/images/aboutme.png'
import cv from './assets/docs/CV.pdf'
import { useTheme } from './composables/use-theme'
import SocialDock from './components/ui/SocialDock.vue'
import Doodle from './components/ui/Doodle.vue'
import HandwrittenNote from './components/ui/HandwrittenNote.vue'
import SidebarIndicator from './components/ui/SidebarIndicator.vue'

const { theme, toggleTheme } = useTheme()

const isMini = /^\/mini-projects(?:\/|$)/.test(window.location.pathname)
const isProjects = isMini || /^\/projects(?:\/|$)/.test(window.location.pathname)
const isBlogs = /^\/blogs(?:\/|$)/.test(window.location.pathname)
const isHome = !isProjects && !isBlogs
const menuOpen = ref(false)
const activeSection = ref(isProjects ? 'projects' : isBlogs ? 'blogs' : 'about')
let pendingSection = null
let scrollSettleTimer
const sections = [
  { id: 'about', label: 'about me' },
  { id: 'experience', label: 'experience' },
  { id: 'papers', label: 'papers' },
  { id: 'projects', label: 'projects' },
  { id: 'blogs', label: 'blogs' },
  { id: 'contact', label: 'contact' },
]

function updateSection() {
  if (!isHome) return
  if (pendingSection) {
    if (!hasReachedSection(pendingSection)) return
    window.clearTimeout(scrollSettleTimer)
    pendingSection = null
  }
  const marker = Math.min(window.innerHeight * .3, 200)
  let current = 'about'
  for (const section of sections) {
    const element = document.getElementById(section.id)
    if (element && element.getBoundingClientRect().top <= marker) current = section.id
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
    const linkedId = window.location.hash.slice(1)
    const linkedSection = sections.some(section => section.id === linkedId) && document.getElementById(linkedId)
    current = linkedSection && linkedSection.getBoundingClientRect().top > 0 ? linkedId : 'contact'
  }
  activeSection.value = current
}
function selectSection(id, event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  window.clearTimeout(scrollSettleTimer)
  if (isHome && document.getElementById(id)) {
    pendingSection = id
    scrollSettleTimer = window.setTimeout(cancelSectionScroll, 1500)
  }
  activeSection.value = id
  menuOpen.value = false
}
function finishSectionScroll() {
  if (pendingSection && !hasReachedSection(pendingSection)) return
  cancelSectionScroll()
}
function hasReachedSection(id) {
  const element = document.getElementById(id)
  if (!element) return true
  const inset = parseFloat(getComputedStyle(element).scrollMarginTop) || 0
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const destination = Math.min(maximum, Math.max(0, element.getBoundingClientRect().top + window.scrollY - inset))
  return Math.abs(window.scrollY - destination) < 3
}
function cancelSectionScroll() {
  window.clearTimeout(scrollSettleTimer)
  pendingSection = null
  updateSection()
}
function closeMenu(event) {
  if (event.key === 'Escape') menuOpen.value = false
  if (!event.altKey && !event.ctrlKey && !event.metaKey && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelSectionScroll()
}
onMounted(() => {
  updateSection()
  window.addEventListener('scroll', updateSection, { passive: true })
  window.addEventListener('scrollend', finishSectionScroll)
  window.addEventListener('wheel', cancelSectionScroll, { passive: true })
  window.addEventListener('touchstart', cancelSectionScroll, { passive: true })
  window.addEventListener('resize', updateSection)
  window.addEventListener('hashchange', updateSection)
  window.addEventListener('keydown', closeMenu)
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateSection)
  window.removeEventListener('scrollend', finishSectionScroll)
  window.removeEventListener('wheel', cancelSectionScroll)
  window.removeEventListener('touchstart', cancelSectionScroll)
  window.clearTimeout(scrollSettleTimer)
  window.removeEventListener('resize', updateSection)
  window.removeEventListener('hashchange', updateSection)
  window.removeEventListener('keydown', closeMenu)
})
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <aside class="sidebar" :class="{ 'sidebar--home': isHome }" aria-label="Profile and navigation">
    <div class="sidebar-top">
      <a class="profile" href="/" aria-label="Gokul Raju home">
        <img :src="portrait" alt="" class="profile-photo" width="76" height="76">
        <span class="profile-name">Gokul Raju</span>
      </a>
      <p class="profile-role">Founder at <span class="company-name">MEI</span></p>
      <button class="menu-toggle" :aria-expanded="menuOpen" aria-controls="sidebar-navigation" @click="menuOpen = !menuOpen">{{ menuOpen ? 'close' : 'menu' }}</button>
    </div>
    <div id="sidebar-navigation" class="sidebar-navigation" :class="{ 'is-open': menuOpen }">
      <nav class="section-nav" aria-label="Main navigation">
        <SidebarIndicator :active-section="activeSection" />
        <template v-for="section in sections" :key="section.id">
          <a :href="`/#${section.id}`" :class="{ 'is-active': activeSection === section.id }" :aria-current="activeSection === section.id ? 'location' : undefined" @click="selectSection(section.id, $event)">{{ section.label }} <DotArrow /></a>
        </template>
        <a :href="cv" target="_blank" rel="noreferrer">resume <DotArrow /></a>
      </nav>
      <div class="sidebar-bottom">
        <SocialDock />
        <div class="sidebar-meta">
          <span>© 2026 Gokul Raju.</span>
          <button class="theme-toggle" :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'" :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'" @click="toggleTheme">
            <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.1A8.3 8.3 0 0 1 8.9 4a8.4 8.4 0 1 0 11.1 11.1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.8" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  </aside>
  <div id="top" class="reading-column" :class="{ 'reading-column--projects': isProjects, 'reading-column--home': isHome }">
    <main id="main"><ProjectsPage v-if="isProjects" :mini="isMini" /><BlogPage v-else-if="isBlogs" /><HomePage v-else /></main>
    <footer v-if="isHome" id="contact" class="site-footer">
      <div class="section-title"><h2>Contact</h2><div class="sketch-note"><Doodle kind="plane" /><HandwrittenNote>Say hello!</HandwrittenNote></div></div>
      <p>Want to chat about robots, research, or something you're making? Drop me a message.</p>
      <a class="email-link" href="mailto:gokul10012000@gmail.com">gokul10012000@gmail.com <DotArrow /></a>
      <div class="footer-bottom"><a href="#top">back to top <DotArrow direction="up" /></a></div>
    </footer>
  </div>
</template>
