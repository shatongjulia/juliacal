import { STORAGE_VERSION, UserSettings, DailyLog, MealType } from './types'

const SETTINGS_KEY = 'juliaCal_settings'
const VERSION_KEY = 'juliaCal_version'

function emptyMeals(): DailyLog['meals'] {
  return { breakfast: [], lunch: [], dinner: [], snack: [] }
}

function migrateIfNeeded() {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(VERSION_KEY)
  if (!stored) {
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION))
  }
}

export function getSettings(): UserSettings | null {
  if (typeof window === 'undefined') return null
  migrateIfNeeded()
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  safeSetItem(SETTINGS_KEY, JSON.stringify(settings))
  // 同步 cookie 供 middleware 检查
  if (settings.onboardingComplete) {
    document.cookie = 'juliaCal_onboarding_complete=true; path=/; max-age=31536000'
  }
}

export function getDailyLog(date: string): DailyLog {
  if (typeof window === 'undefined') return { date, meals: emptyMeals() }
  try {
    const raw = localStorage.getItem(`juliaCal_log_${date}`)
    return raw ? JSON.parse(raw) : { date, meals: emptyMeals() }
  } catch {
    return { date, meals: emptyMeals() }
  }
}

export function saveDailyLog(log: DailyLog): void {
  if (typeof window === 'undefined') return
  cleanOldLogs()
  safeSetItem(`juliaCal_log_${log.date}`, JSON.stringify(log))
}

function cleanOldLogs() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  Object.keys(localStorage)
    .filter(k => k.startsWith('juliaCal_log_') && k.slice('juliaCal_log_'.length) < cutoffStr)
    .forEach(k => localStorage.removeItem(k))
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('juliaCal_log_'))
        .sort()
      keys.slice(0, 7).forEach(k => localStorage.removeItem(k))
      try { localStorage.setItem(key, value) } catch { /* 存储仍然失败，忽略 */ }
    }
  }
}

export function getRecentLogs(days: number): DailyLog[] {
  const logs: DailyLog[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    logs.push(getDailyLog(date))
  }
  return logs
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.keys(localStorage)
    .filter(k => k.startsWith('juliaCal_'))
    .forEach(k => localStorage.removeItem(k))
  document.cookie = 'juliaCal_onboarding_complete=; path=/; max-age=0'
}
