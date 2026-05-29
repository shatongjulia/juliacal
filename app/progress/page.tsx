'use client'

import { useRouter } from 'next/navigation'
import { getSettings, getRecentLogs } from '@/lib/storage'
import { DailyLog, MealType } from '@/lib/types'
import { getMacroTargets } from '@/lib/calories'
import { evaluate211 } from '@/lib/diet211'
import { Moon } from 'lucide-react'

const MEAL_TYPES: MealType[] = ['lunch', 'dinner']

function getWeekDays(): string[] {
  const days: string[] = []
  const today = new Date()
  // 本周一到周日
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function calcStreak(logs: DailyLog[]): number {
  let streak = 0
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  for (const log of sorted) {
    const hasEntry = Object.values(log.meals).flat().length > 0
    if (hasEntry) streak++
    else break
  }
  return streak
}

function TrendLine({ data, color, unit, label }: {
  data: { date: string; value: number }[]
  color: string
  unit: string
  label: string
}) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{label}趋势</h2>
        <p className="text-sm text-gray-400 text-center py-4">数据不足，记录两次以上后显示趋势</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const values = sorted.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = range * 0.2
  const yMin = min - pad
  const yMax = max + pad

  const W = 320
  const H = 160
  const padX = 30
  const padY = 20
  const graphW = W - padX * 2
  const graphH = H - padY * 2

  const points = sorted.map((d, i) => {
    const x = padX + (i / (sorted.length - 1)) * graphW
    const y = padY + graphH - ((d.value - yMin) / (yMax - yMin)) * graphH
    return `${x},${y}`
  }).join(' ')

  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const delta = latest.value - first.value

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">{label}趋势</h2>
        <span className={`text-xs font-medium ${delta < 0 ? 'text-green-500' : delta > 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {delta < 0 ? '↓' : delta > 0 ? '↑' : '→'} {Math.abs(delta).toFixed(1)}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = padY + graphH * (1 - frac)
          const val = yMin + (yMax - yMin) * frac
          return (
            <g key={frac}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={padX - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((d, i) => {
          const x = padX + (i / (sorted.length - 1)) * graphW
          const y = padY + graphH - ((d.value - yMin) / (yMax - yMin)) * graphH
          return (
            <g key={d.date}>
              <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
              <text x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                {d.date.slice(5)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ProgressPage() {
  const router = useRouter()
  const settings = getSettings()
  const logs = getRecentLogs(30)
  const weightHistory = settings?.weightHistory || []
  const waistHistory = settings?.waistHistory || []

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>
  }

  const macroTargets = getMacroTargets(settings)

  const weekDays = getWeekDays()
  const emptyLog = (date: string): DailyLog => ({ date, meals: { breakfast: [], lunch: [], snack: [], dinner: [], nightsnack: [] }, water: 0, mealTimes: { breakfast: null, lunch: null, snack: null, dinner: null, nightsnack: null } })
  const weekLogs = weekDays.map(date => logs.find(l => l.date === date) || emptyLog(date))

  const weekCalories = weekLogs.map(log => ({
    date: log.date,
    calories: Object.values(log.meals).flat().reduce((s, e) => s + e.calories, 0),
  }))

  const maxCalories = Math.max(...weekCalories.map(d => d.calories), settings.dailyCalorieTarget, 1)

  // 宏量达成率（本周平均）
  const weekAvg = weekLogs.reduce(
    (acc, log) => {
      const entries = Object.values(log.meals).flat()
      const veg = entries.filter(e => e.foodCategory === 'vegetable')
      acc.carbs += entries.reduce((s, e) => s + e.carbs, 0)
      acc.vegCarbs += veg.reduce((s, e) => s + e.carbs, 0)
      acc.protein += entries.reduce((s, e) => s + e.protein, 0)
      acc.fat += entries.reduce((s, e) => s + e.fat, 0)
      return acc
    },
    { carbs: 0, vegCarbs: 0, protein: 0, fat: 0 }
  )
  const daysWithData = weekLogs.filter(l => Object.values(l.meals).flat().length > 0).length || 1
  const avgCarbs = weekAvg.carbs / daysWithData
  const avgVegCarbs = weekAvg.vegCarbs / daysWithData
  const avgNetCarbs = avgCarbs - avgVegCarbs * 0.5
  const avgProtein = weekAvg.protein / daysWithData
  const avgFat = weekAvg.fat / daysWithData

  // 今日211达标
  const todayDate = new Date().toISOString().split('T')[0]
  const todayLog = logs.find(l => l.date === todayDate) || emptyLog(todayDate)
  const today211 = MEAL_TYPES.filter(m => {
    const entries = todayLog.meals[m]
    if (entries.length < 2) return false
    const result = evaluate211(entries, m, settings.dietMode)
    return result?.compliant ?? false
  }).length

  // 饮水
  const weekAvgWater = Math.round(weekLogs.reduce((s, l) => s + l.water, 0) / daysWithData)
  const waterPct = Math.round(Math.min(weekAvgWater / settings.dailyWaterTarget, 1) * 100)

  // 夜晚空腹时间（早餐 - 前一天晚餐）
  function calcOvernightFasting(logs: DailyLog[]): { avg: number; rate16to8: number; count: number; hit16: number } {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
    let totalH = 0
    let count = 0
    let hit16 = 0
    for (let i = 1; i < sorted.length; i++) {
      const prevTimes = Object.values(sorted[i - 1].mealTimes).filter(Boolean) as string[]
      const todayTimes = Object.values(sorted[i].mealTimes).filter(Boolean) as string[]
      if (prevTimes.length === 0 || todayTimes.length === 0) continue
      const lastMeal = Math.max(...prevTimes.map(t => new Date(t).getTime()))
      const firstMeal = Math.min(...todayTimes.map(t => new Date(t).getTime()))
      const h = (firstMeal - lastMeal) / (1000 * 60 * 60)
      if (h > 0 && h < 24) {
        totalH += h
        count++
        if (h >= 16) hit16++
      }
    }
    return { avg: count > 0 ? totalH / count : 0, rate16to8: count > 0 ? Math.round(hit16 / count * 100) : 0, count, hit16 }
  }

  const fasting = calcOvernightFasting(logs)
  const streak = calcStreak(logs)

  const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">进度统计</h1>
        <button onClick={() => router.push('/report')}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors">
          导出报告
        </button>
      </div>

      {/* streak */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">连续记录</p>
          <p className="text-3xl font-bold text-green-500">{streak} <span className="text-base font-normal text-gray-500">天</span></p>
        </div>
        <div className="text-4xl">🔥</div>
      </div>

      {/* 本周热量趋势 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">本周热量趋势</h2>
        <div className="flex items-end justify-between gap-1 h-32">
          {weekCalories.map((d, i) => {
            const ratio = d.calories / maxCalories
            const targetRatio = settings.dailyCalorieTarget / maxCalories
            const isToday = d.date === todayDate
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex flex-col justify-end" style={{ height: '96px' }}>
                  {/* 目标线 */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-gray-300"
                    style={{ bottom: `${targetRatio * 96}px` }}
                  />
                  {/* 柱子 */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday ? 'bg-green-500' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.max(ratio * 96, d.calories > 0 ? 4 : 0)}px` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">虚线 = 每日目标 {settings.dailyCalorieTarget} kcal</p>
      </div>

      {/* 体重趋势 */}
      <TrendLine data={weightHistory.map(h => ({ date: h.date, value: h.weight }))} color="#0d9488" unit="kg" label="体重" />

      {/* 腰围趋势 */}
      <TrendLine data={waistHistory} color="#6366f1" unit="cm" label="腰围" />

      {/* 宏量达成率 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">本周宏量达成率（日均）</h2>
        {[
          { label: '碳水', avg: avgNetCarbs, target: macroTargets.dailyCarbTarget, color: '#3b82f6', note: `含蔬菜 ${Math.round(avgVegCarbs)}g` },
          { label: '蛋白质', avg: avgProtein, target: macroTargets.dailyProteinTarget, color: '#8b5cf6' },
          { label: '脂肪', avg: avgFat, target: macroTargets.dailyFatTarget, color: '#f59e0b' },
        ].map(m => {
          const ratio = Math.min(m.avg / m.target, 1)
          const pct = Math.round(m.avg / m.target * 100)
          return (
            <div key={m.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{m.label}</span>
                <span className="text-gray-500">{Math.round(m.avg)}g / {m.target}g ({pct}%)</span>
              </div>
              {'note' in m && (
                <p className="text-[10px] text-gray-400 mb-1">{m.note}</p>
              )}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${ratio * 100}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* 饮水达成率 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">本周饮水达成率（日均）</h2>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-blue-500">{waterPct}%</div>
          <div className="text-sm text-gray-500">
            日均 {weekAvgWater}ml / 目标 {settings.dailyWaterTarget}ml
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${waterPct}%` }}
          />
        </div>
      </div>

      {/* 夜晚空腹统计 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">夜晚空腹统计（近30天）</h2>
        {fasting.count > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{fasting.avg.toFixed(1)}h</p>
                <p className="text-xs text-purple-500">平均空腹时长</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{fasting.hit16}<span className="text-base font-normal text-indigo-400">/30天</span></p>
                <p className="text-xs text-indigo-500">16:8 达成次数</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              基于 {fasting.count} 天夜间空腹时长统计（前一天最晚进餐→次日最早进餐）
            </p>
          </>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            <Moon size={28} className="mx-auto mb-2 opacity-40" />
            <p>记录进餐时间后自动统计</p>
            <p className="text-xs mt-1">点击餐段的时钟按钮记录时间</p>
          </div>
        )}
      </div>

      {/* 211 达标统计 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">今日 211 达标</h2>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-green-500">{today211}/2</div>
          <div className="text-sm text-gray-500">餐达标（午/晚）</div>
        </div>
        <div className="flex gap-2 mt-3">
          {MEAL_TYPES.map(m => {
            const entries = todayLog.meals[m]
            const result = entries.length >= 2 ? evaluate211(entries, m, settings.dietMode) : null
            const labelMap: Record<MealType, string> = { breakfast: '早餐', lunch: '午餐', snack: '零食', dinner: '晚餐', nightsnack: '夜宵' }
            const label = labelMap[m]
            return (
              <div
                key={m}
                className={`flex-1 py-2 rounded-xl text-center text-xs font-medium ${
                  result?.compliant
                    ? 'bg-green-50 text-green-600'
                    : entries.length >= 2
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                {result?.compliant ? '✅' : entries.length >= 2 ? '⚠️' : '—'} {label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
