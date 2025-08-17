export function getStoredTheme() {
  try {
    return localStorage.getItem('theme')
  } catch {
    return null
  }
}

export function setStoredTheme(value) {
  try {
    localStorage.setItem('theme', value)
  } catch {
    // ignore
  }
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function initTheme() {
  const stored = getStoredTheme()
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = stored || (prefersDark ? 'dark' : 'light')
  applyTheme(theme)
  return theme
}

export function toggleTheme() {
  const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  setStoredTheme(next)
  applyTheme(next)
  return next
}

export function useTheme() {
  // minimal hook-like API without React to avoid extra deps here; components can call initTheme/toggleTheme
  return {
    initTheme,
    toggleTheme,
    getStoredTheme,
    setStoredTheme,
  }
}

