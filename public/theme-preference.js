(() => {
  let preference
  try { preference = localStorage.getItem('portfolio-theme') } catch {}
  const theme = preference === 'dark' || preference === 'light'
    ? preference
    : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#131514' : '#f2f1ed')
})()
