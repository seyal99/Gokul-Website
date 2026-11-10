import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export function useTheme() {
  const system = window.matchMedia('(prefers-color-scheme: dark)')
  const theme = ref(document.documentElement.dataset.theme || (system.matches ? 'dark' : 'light'))
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let transition = null
  let request = 0
  let disposed = false
  let preference = null
  try { preference = localStorage.getItem('portfolio-theme') } catch {}
  if (preference !== 'dark' && preference !== 'light') preference = null

  function apply(value) {
    theme.value = value
    document.documentElement.dataset.theme = value
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#131514' : '#f2f1ed')
  }
  async function toggleTheme() {
    const id = ++request
    preference = (preference || theme.value) === 'dark' ? 'light' : 'dark'
    const target = preference
    try { localStorage.setItem('portfolio-theme', preference) } catch {}

    // Rapid clicks always win; never disable the control or queue animations.
    const previous = transition
    previous?.skipTransition()
    if (previous) await previous.updateCallbackDone.catch(() => {})
    if (disposed || id !== request) return

    if (reducedMotion.matches || !document.startViewTransition || document.hidden) {
      clearTransitionStyles()
      apply(target)
      return
    }

    const root = document.documentElement
    root.classList.add('theme-changing')
    let current
    try {
      current = document.startViewTransition(async () => {
        if (disposed || id !== request) return
        apply(target)
        await nextTick()
      })
      transition = current
      // ready can reject when a capture is skipped (rapid input, hidden tab).
      await current.ready.catch(() => {})
      await current.finished
    } catch {
      if (!disposed && id === request) apply(target)
    } finally {
      if (id === request) {
        transition = null
        clearTransitionStyles()
      }
    }
  }
  function cancelTransition() {
    request++
    transition?.skipTransition()
    transition = null
    clearTransitionStyles()
  }
  function clearTransitionStyles() {
    document.documentElement.classList.remove('theme-changing')
  }
  function followMotion(event) {
    if (event.matches) {
      cancelTransition()
      apply(preference || (system.matches ? 'dark' : 'light'))
    }
  }
  function followSystem(event) {
    if (!preference) {
      cancelTransition()
      apply(event.matches ? 'dark' : 'light')
    }
  }
  function followStorage(event) {
    if (event.key !== 'portfolio-theme' && event.key !== null) return
    cancelTransition()
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null
    apply(preference || (system.matches ? 'dark' : 'light'))
  }
  onMounted(() => {
    apply(preference || (system.matches ? 'dark' : 'light'))
    system.addEventListener('change', followSystem)
    reducedMotion.addEventListener('change', followMotion)
    window.addEventListener('storage', followStorage)
  })
  onBeforeUnmount(() => {
    disposed = true
    cancelTransition()
    system.removeEventListener('change', followSystem)
    reducedMotion.removeEventListener('change', followMotion)
    window.removeEventListener('storage', followStorage)
  })
  return { theme, toggleTheme }
}
