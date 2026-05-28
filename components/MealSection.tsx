'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MealType, MealEntry, FoodCategory, DietMode } from '@/lib/types'
import { getDailyLog, saveDailyLog } from '@/lib/storage'
import { evaluate211 } from '@/lib/diet211'
import ImageUpload, { AnalyzedFood } from './ImageUpload'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  snack: '零食',
  dinner: '晚餐',
  nightsnack: '夜宵',
}

interface MealSectionProps {
  mealType: MealType
  entries: MealEntry[]
  date: string
  onUpdate: () => void
  dietMode?: DietMode
}

export default function MealSection({ mealType, entries, date, onUpdate, dietMode }: MealSectionProps) {
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTime, setEditingTime] = useState(false)
  const timeInputRef = useRef<HTMLInputElement>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [movingId, setMovingId] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = useRef(false)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)
  const show211 = mealType === 'lunch' || mealType === 'dinner'
  const assessment = show211 && entries.length >= 2 ? evaluate211(entries, mealType, dietMode) : null

  const log = getDailyLog(date)
  const mealTime = log.mealTimes[mealType]

  const formatMealTime = (iso: string | null): string | null => {
    if (!iso) return null
    try {
      const d = new Date(iso)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    } catch { return null }
  }

  const handleRecordTime = () => {
    const log = getDailyLog(date)
    log.mealTimes[mealType] = new Date().toISOString()
    saveDailyLog(log)
    onUpdate()
  }

  const commitTimeEdit = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    const log = getDailyLog(date)
    const d = new Date(log.date + 'T00:00:00')
    d.setHours(h, m, 0, 0)
    log.mealTimes[mealType] = d.toISOString()
    saveDailyLog(log)
    setEditingTime(false)
    onUpdate()
  }

  useEffect(() => {
    if (editingTime) {
      timeInputRef.current?.focus()
      timeInputRef.current?.select()
    }
  }, [editingTime])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleWeightChange = (id: string, newWeight: number) => {
    if (newWeight <= 0 || newWeight > 5000) return
    const log = getDailyLog(date)
    const entries = log.meals[mealType]
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    const pg = entry.per100g || { calories: entry.calories * 100 / entry.amount, carbs: entry.carbs * 100 / entry.amount, protein: entry.protein * 100 / entry.amount, fat: entry.fat * 100 / entry.amount }
    entry.amount = newWeight
    {
      const factor = newWeight / 100
      entry.calories = Math.round(pg.calories * factor)
      entry.carbs = Math.round(pg.carbs * factor * 10) / 10
      entry.protein = Math.round(pg.protein * factor * 10) / 10
      entry.fat = Math.round(pg.fat * factor * 10) / 10
    }
    entry.per100g = pg
    saveDailyLog(log)
    setEditingId(null)
    onUpdate()
  }

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    touchStartPos.current = null
  }

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    longPressTriggered.current = false
    clearLongPress()
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      setMovingId(id)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15)
    }, 600)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return
    const dx = e.touches[0].clientX - touchStartPos.current.x
    const dy = e.touches[0].clientY - touchStartPos.current.y
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      clearLongPress()
    }
  }

  const handleMouseDown = (id: string) => {
    longPressTriggered.current = false
    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      setMovingId(id)
    }, 600)
  }

  const handleMove = (targetMeal: MealType) => {
    if (!movingId) return
    const log = getDailyLog(date)
    const idx = log.meals[mealType].findIndex(e => e.id === movingId)
    if (idx === -1) { setMovingId(null); return }
    const [entry] = log.meals[mealType].splice(idx, 1)
    log.meals[targetMeal] = [...log.meals[targetMeal], entry]
    saveDailyLog(log)
    setMovingId(null)
    onUpdate()
    showToast(`已移至${MEAL_LABELS[targetMeal]}`)
  }

  const handleDelete = (id: string) => {
    const log = getDailyLog(date)
    log.meals[mealType] = log.meals[mealType].filter(e => e.id !== id)
    saveDailyLog(log)
    onUpdate()
  }

  const handleCameraResult = (foods: AnalyzedFood[]) => {
    try {
      const log = getDailyLog(date)
      const newEntries: MealEntry[] = foods.map(f => {
        let id: string
        try {
          id = crypto.randomUUID()
        } catch {
          id = 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
        }
        return {
          id,
          name: f.name,
          calories: f.calories,
          carbs: f.carbs,
          protein: f.protein,
          fat: f.fat,
          amount: f.estimatedWeight,
          foodCategory: f.category as FoodCategory,
          source: 'camera' as const,
          createdAt: new Date().toISOString(),
          per100g: f.per100g,
        }
      })
      log.meals[mealType] = [...log.meals[mealType], ...newEntries]
      saveDailyLog(log)
      onUpdate()
      showToast(`已添加 ${foods.length} 项食物`)
    } catch (e) {
      showToast('添加失败，请重试')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{MEAL_LABELS[mealType]}</span>
          {editingTime ? (
            <input
              ref={timeInputRef}
              type="time"
              defaultValue={formatMealTime(mealTime) ?? undefined}
              className="text-xs w-16 px-1 py-0 border border-gray-300 rounded focus:outline-none focus:border-green-400"
              onBlur={e => commitTimeEdit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTimeEdit(e.currentTarget.value)
                if (e.key === 'Escape') setEditingTime(false)
              }}
            />
          ) : formatMealTime(mealTime) ? (
            <button
              onClick={() => setEditingTime(true)}
              className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded hover:text-gray-600 hover:bg-gray-200 transition-colors"
              title="点击修改进餐时间"
            >
              {formatMealTime(mealTime)}
            </button>
          ) : null}
          {totalCalories > 0 && (
            <span className="text-sm text-gray-500">{Math.round(totalCalories)} kcal</span>
          )}
          {assessment && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              assessment.compliant
                ? 'bg-green-50 text-green-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {assessment.compliant ? '✅ 211达标' : '⚠️ 未达标'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRecordTime}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
            title="记录进餐时间"
          >
            <Clock size={18} />
          </button>
          <ImageUpload
            onResult={handleCameraResult}
            onError={showToast}
            disabled={!isOnline}
          />
          <button
            onClick={() => router.push(`/search?meal=${mealType}&date=${date}`)}
            className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
            title="搜索添加"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Food entries */}
      {entries.length > 0 ? (
        <ul className="divide-y divide-gray-50">
          {entries.map(entry => (
            <li
              key={entry.id}
              className="flex items-center justify-between px-4 py-3 select-none active:bg-gray-50"
              onTouchStart={(e) => handleTouchStart(entry.id, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={clearLongPress}
              onMouseDown={() => handleMouseDown(entry.id)}
              onMouseUp={clearLongPress}
              onMouseLeave={clearLongPress}
              onContextMenu={e => e.preventDefault()}
              onClick={() => { if (longPressTriggered.current) { longPressTriggered.current = false; return } }}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {entry.name}
                  {entry.foodCategory === 'protein' && entry.fat * 100 / entry.protein >= 50 && (
                    <span className="ml-1.5 text-[10px] text-amber-500 bg-amber-50 px-1 py-0.5 rounded" title="此蛋白食物脂肪含量较高（脂肪/蛋白质 ≥ 50%）">高脂</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {editingId === entry.id ? (
                    <EditableWeight
                      value={entry.amount}
                      onConfirm={w => handleWeightChange(entry.id, w)}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingId(entry.id)}
                      className="text-gray-400 border-b border-dashed border-gray-300 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      {Math.round(entry.amount)}g
                    </button>
                  )}
                  <span> · {Math.round(entry.calories)} kcal</span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-sm text-gray-400 text-center">暂无记录，点击 + 添加食物</p>
      )}

      {/* 211 issues detail */}
      {assessment && !assessment.compliant && entries.length >= 2 && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
          {assessment.issues.map((issue, i) => (
            <p key={i} className="text-xs text-amber-600">{issue}</p>
          ))}
        </div>
      )}

      {/* Move modal */}
      {movingId && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 px-4 pb-8" onClick={() => setMovingId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-700 mb-3">移动到</p>
            <div className="space-y-2">
              {(Object.keys(MEAL_LABELS) as MealType[])
                .filter(m => m !== mealType)
                .map(m => (
                  <button
                    key={m}
                    onClick={() => handleMove(m)}
                    className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
                  >
                    {MEAL_LABELS[m]}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setMovingId(null)}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="px-4 py-2 bg-gray-800 text-white text-sm text-center">
          {toast}
        </div>
      )}
    </div>
  )
}

function EditableWeight({ value, onConfirm }: { value: number; onConfirm: (w: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const commit = () => {
    const v = Number(inputRef.current?.value)
    if (v > 0 && v <= 5000) onConfirm(v)
  }

  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="numeric"
      defaultValue={Math.round(value)}
      className="w-14 px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none focus:border-green-400"
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') onConfirm(value)
      }}
    />
  )
}
