const STORAGE_KEY = 'expense-tracker:settings'

interface Settings {
  displayName: string
}

function loadFromStorage(): Settings {
  if (import.meta.server) return { displayName: '' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { displayName: '' }
  } catch {
    return { displayName: '' }
  }
}

export function useSettings() {
  const settings = useState<Settings>('settings', loadFromStorage)

  function setDisplayName(name: string) {
    settings.value = { ...settings.value, displayName: name.trim() }
    if (import.meta.server) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  return { settings: readonly(settings), setDisplayName }
}
