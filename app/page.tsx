'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from 'lucide-react'
import { getSettings, getDailyLog } from '@/lib/storage'
import { UserSettings, DailyLog, MealType } from '@/lib/types'
import { getMacroTargets } from '@/lib/calories'
import CircularProgress from '@/components/CircularProgress'
import MacroCard from '@/components/MacroCard'
import MealSection from '@/components/MealSection'
import WaterTracker from '@/components/WaterTracker'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner', 'nightsnack']

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function DashboardPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [log, setLog] = useState<DailyLog | null>(null)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadData = useCallback(() => {
    setSettings(getSettings())
    setLog(getDailyLog(selectedDate))
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 静默备份 Settings 到云端
  useEffect(() => {
    if (!settings) return
    const code = (settings as any).syncCode as string | undefined
    if (!code) return
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, type: 'settings', data: settings }),
    }).catch(() => {})
  }, [settings])

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>
  }

  const macroTargets = getMacroTargets(settings)

  const totalCalories = log
    ? Object.values(log.meals).flat().reduce((sum, e) => sum + e.calories, 0)
    : 0
  const totalCarbs = log
    ? Object.values(log.meals).flat().reduce((sum, e) => sum + e.carbs, 0)
    : 0
  const vegCarbs = log
    ? Object.values(log.meals).flat().filter(e => e.foodCategory === 'vegetable').reduce((sum, e) => sum + e.carbs, 0)
    : 0
  const netCarbs = Math.round(totalCarbs - vegCarbs * 0.5)
  const totalProtein = log
    ? Object.values(log.meals).flat().reduce((sum, e) => sum + e.protein, 0)
    : 0
  const totalFat = log
    ? Object.values(log.meals).flat().reduce((sum, e) => sum + e.fat, 0)
    : 0

  return (
    <div className="space-y-5">
      {/* 离线 Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700 text-center">
          离线模式，数据仅显示本地记录
        </div>
      )}

      {/* 顶部：头像 + 问候 + 日期选择 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <User size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{getGreeting()}</p>
            <p className="font-semibold text-gray-900">
              {settings.name || '用户'}
            </p>
          </div>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          max={formatDate(new Date())}
          className="text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-green-400"
        />
      </div>

      {/* 圆形进度条 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-4">{formatDisplayDate(selectedDate)} 热量摄入</p>
        <CircularProgress current={totalCalories} target={settings.dailyCalorieTarget} />
      </div>

      {/* 宏量营养素 */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard label="碳水" current={netCarbs} target={macroTargets.dailyCarbTarget} color="#3b82f6" subtitle={`含蔬菜 ${Math.round(vegCarbs)}g`} />
        <MacroCard label="蛋白质" current={totalProtein} target={macroTargets.dailyProteinTarget} color="#8b5cf6" />
        <MacroCard label="脂肪" current={totalFat} target={macroTargets.dailyFatTarget} color="#f59e0b" />
      </div>

      {/* 饮水 */}
      <WaterTracker
        current={log?.water ?? 0}
        target={settings.dailyWaterTarget}
        date={selectedDate}
        onUpdate={loadData}
      />

      {/* 餐食列表 */}
      <div className="space-y-3">
        {MEAL_TYPES.map(mealType => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={log?.meals[mealType] ?? []}
            date={selectedDate}
            onUpdate={loadData}
            dietMode={settings.dietMode}
          />
        ))}
      </div>
    </div>
  )
}
