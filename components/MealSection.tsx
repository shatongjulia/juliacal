'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MealType, MealEntry, FoodCategory } from '@/lib/types'
import { getDailyLog, saveDailyLog } from '@/lib/storage'
import { evaluate211 } from '@/lib/diet211'
import ImageUpload, { AnalyzedFood } from './ImageUpload'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '零食',
}

interface MealSectionProps {
  mealType: MealType
  entries: MealEntry[]
  date: string
  onUpdate: () => void
}

export default function MealSection({ mealType, entries, date, onUpdate }: MealSectionProps) {
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)
  const show211 = mealType !== 'snack'
  const assessment = show211 && entries.length >= 2 ? evaluate211(entries) : null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = (id: string) => {
    const log = getDailyLog(date)
    log.meals[mealType] = log.meals[mealType].filter(e => e.id !== id)
    saveDailyLog(log)
    onUpdate()
  }

  const handleCameraResult = (foods: AnalyzedFood[]) => {
    const log = getDailyLog(date)
    const newEntries: MealEntry[] = foods.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      calories: f.calories,
      carbs: f.carbs,
      protein: f.protein,
      fat: f.fat,
      amount: f.estimatedWeight,
      foodCategory: f.category as FoodCategory,
      source: 'camera' as const,
      createdAt: new Date().toISOString(),
    }))
    log.meals[mealType] = [...log.meals[mealType], ...newEntries]
    saveDailyLog(log)
    onUpdate()
    showToast(`已添加 ${foods.length} 项食物`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{MEAL_LABELS[mealType]}</span>
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
            <li key={entry.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{entry.name}</p>
                <p className="text-xs text-gray-400">{Math.round(entry.amount)}g · {Math.round(entry.calories)} kcal</p>
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

      {/* Toast */}
      {toast && (
        <div className="px-4 py-2 bg-gray-800 text-white text-sm text-center">
          {toast}
        </div>
      )}
    </div>
  )
}
