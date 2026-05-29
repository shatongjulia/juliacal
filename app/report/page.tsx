'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { MealType } from '@/lib/types'
import { getSettings, getDailyLog } from '@/lib/storage'
import { evaluate211 } from '@/lib/diet211'

function getAvailableMonths(): string[] {
  const months = new Set<string>()
  if (typeof window === 'undefined') return []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('juliaCal_log_')) {
      const date = key.slice('juliaCal_log_'.length)
      months.add(date.slice(0, 7))
    }
  }
  return Array.from(months).sort().reverse()
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m)}月`
}

export default function ReportPage() {
  const router = useRouter()
  const availableMonths = useMemo(() => getAvailableMonths(), [])
  const [selected, setSelected] = useState<Set<string>>(new Set(
    availableMonths.length > 0 ? [availableMonths[0]] : []
  ))

  const toggle = (m: string) => {
    const next = new Set(selected)
    if (next.has(m)) next.delete(m)
    else next.add(m)
    setSelected(next)
  }

  const selectAll = () => setSelected(new Set(availableMonths))
  const deselectAll = () => setSelected(new Set())

  const selectedList = Array.from(selected).sort()

  const handleGenerate = () => {
    if (selectedList.length === 0) return

    const settings = getSettings()
    const dietMode = settings?.dietMode

    // 收集每日数据
    const dailyData: Record<string, unknown>[] = []
    const bodyData: Record<string, unknown>[] = []

    const weightMap = new Map<string, number>()
    const waistMap = new Map<string, number>()
    const targetMap = new Map<string, number>()

    if (settings?.weightHistory) {
      for (const h of settings.weightHistory) {
        if (selectedList.some(m => h.date.startsWith(m))) {
          weightMap.set(h.date, h.weight)
          targetMap.set(h.date, h.calorieTarget)
        }
      }
    }
    if (settings?.waistHistory) {
      for (const h of settings.waistHistory) {
        if (selectedList.some(m => h.date.startsWith(m))) {
          waistMap.set(h.date, h.value)
        }
      }
    }

    const today = new Date().toISOString().split('T')[0]

    for (const month of selectedList) {
      const [y, m] = month.split('-').map(Number)
      const daysInMonth = new Date(y, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${month}-${String(d).padStart(2, '0')}`
        if (date > today) break
        const log = getDailyLog(date)
        const entries = Object.values(log.meals).flat()
        if (entries.length > 0 || log.water > 0) {
          const veg = entries.filter(e => e.foodCategory === 'vegetable')
          dailyData.push({
            '日期': date,
            '热量(kcal)': entries.reduce((s, e) => s + e.calories, 0),
            '碳水(g)': entries.reduce((s, e) => s + e.carbs, 0),
            '净碳水(g)': Math.round(entries.reduce((s, e) => s + e.carbs, 0) - veg.reduce((s, e) => s + e.carbs, 0) * 0.5),
            '蛋白质(g)': Math.round(entries.reduce((s, e) => s + e.protein, 0) * 10) / 10,
            '脂肪(g)': Math.round(entries.reduce((s, e) => s + e.fat, 0) * 10) / 10,
            '饮水(ml)': log.water,
            '餐段数': (['breakfast', 'lunch', 'snack', 'dinner', 'nightsnack'] as MealType[]).filter(mt => log.meals[mt].length > 0).length,
            '午餐211': evaluate211(log.meals.lunch, 'lunch', dietMode)?.compliant ? '达标' : '',
            '晚餐211': evaluate211(log.meals.dinner, 'dinner', dietMode)?.compliant ? '达标' : '',
          })
        }
        if (weightMap.has(date) || waistMap.has(date)) {
          bodyData.push({
            '日期': date,
            '体重(kg)': weightMap.get(date) ?? '',
            '腰围(cm)': waistMap.get(date) ?? '',
            '热量目标(kcal)': targetMap.get(date) ?? '',
          })
        }
      }
    }

    // 月度汇总
    const monthlySummary = selectedList.map(month => {
      const days = dailyData.filter(d => (d['日期'] as string).startsWith(month))
      if (days.length === 0) return null
      return {
        '月份': formatMonth(month),
        '记录天数': days.length,
        '日均热量': Math.round(days.reduce((s, d) => s + (d['热量(kcal)'] as number), 0) / days.length),
        '日均蛋白质': Math.round(days.reduce((s, d) => s + (d['蛋白质(g)'] as number), 0) / days.length),
        '日均碳水': Math.round(days.reduce((s, d) => s + (d['碳水(g)'] as number), 0) / days.length),
        '日均脂肪': Math.round(days.reduce((s, d) => s + (d['脂肪(g)'] as number), 0) / days.length),
        '午餐211达标率': Math.round(days.filter(d => d['午餐211'] === '达标').length / days.length * 100) + '%',
        '晚餐211达标率': Math.round(days.filter(d => d['晚餐211'] === '达标').length / days.length * 100) + '%',
      }
    }).filter(Boolean)

    // 生成 Excel
    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(dailyData)
    ws1['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, '每日摘要')

    if (bodyData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(bodyData)
      ws2['!cols'] = [
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, '体重与腰围')
    }

    if (monthlySummary.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(monthlySummary)
      ws3['!cols'] = [
        { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
      ]
      XLSX.utils.book_append_sheet(wb, ws3, '月度汇总')
    }

    const filename = `JuliaCal_${selectedList.join('_')}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  // 统计选中月份的总记录天数
  const previewDays = (() => {
    let count = 0
    const today = new Date().toISOString().split('T')[0]
    for (const month of selectedList) {
      const [y, m] = month.split('-').map(Number)
      const daysInMonth = new Date(y, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const date = `${month}-${String(d).padStart(2, '0')}`
        if (date > today) break
        const log = getDailyLog(date)
        if (Object.values(log.meals).flat().length > 0 || log.water > 0) count++
      }
    }
    return count
  })()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">导出月度报告</h1>
      </div>

      {/* 月份选择 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">选择月份</h2>
        {availableMonths.length > 0 ? (
          <>
            <div className="flex gap-3 mb-3">
              <button onClick={selectAll} className="text-xs text-indigo-500 hover:text-indigo-700">全选</button>
              <button onClick={deselectAll} className="text-xs text-gray-400 hover:text-gray-600">全不选</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableMonths.map(m => (
                <label key={m} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  selected.has(m) ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                }`}>
                  <input type="checkbox" checked={selected.has(m)} onChange={() => toggle(m)}
                    className="accent-indigo-500 w-4 h-4" />
                  <span className="text-sm">{formatMonth(m)}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
        )}
      </div>

      {/* 预览 + 生成 */}
      {selected.size > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <p className="text-sm text-gray-500">
            已选 {selected.size} 个月，共 {previewDays} 天饮食记录
          </p>
          <button onClick={handleGenerate}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 active:scale-98 transition-all">
            生成并下载 Excel
          </button>
        </div>
      )}
    </div>
  )
}
