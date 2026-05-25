'use client'

import { useState } from 'react'
import { Droplets, Minus } from 'lucide-react'
import { getDailyLog, saveDailyLog } from '@/lib/storage'

interface WaterTrackerProps {
  current: number
  target: number
  date: string
  onUpdate: () => void
}

const QUICK_ADD = [100, 200, 300, 500]

export default function WaterTracker({ current, target, date, onUpdate }: WaterTrackerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

  const addWater = (ml: number) => {
    if (ml <= 0) return
    const log = getDailyLog(date)
    log.water = Math.min(9999, log.water + ml)
    saveDailyLog(log)
    onUpdate()
  }

  const removeWater = () => {
    const log = getDailyLog(date)
    log.water = Math.max(0, log.water - 200)
    saveDailyLog(log)
    onUpdate()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-500" />
          <span className="font-semibold text-gray-900">饮水</span>
        </div>
        <span className="text-sm text-gray-500">
          {current} / {target} ml
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-3 bg-blue-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 快捷添加 */}
      <div className="flex gap-2 mb-2">
        {QUICK_ADD.map(ml => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 active:scale-95 transition-all duration-150"
          >
            +{ml}
          </button>
        ))}
      </div>

      {/* 自定义 + 撤销 */}
      <div className="flex gap-2">
        {showCustom ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              const input = (e.target as HTMLFormElement).querySelector('input')
              if (input) {
                addWater(Number(input.value))
                input.value = ''
              }
              setShowCustom(false)
            }}
            className="flex gap-2 flex-1"
          >
            <input
              type="number"
              placeholder="ml"
              autoFocus
              min="10"
              max="5000"
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <button type="submit" className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg">确定</button>
          </form>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex-1 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            自定义
          </button>
        )}
        {current > 0 && (
          <button
            onClick={removeWater}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
            title="撤销 200ml"
          >
            <Minus size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
