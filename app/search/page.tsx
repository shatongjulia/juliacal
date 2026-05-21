'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import { MealType, MealEntry, FoodCategory } from '@/lib/types'
import { getDailyLog, saveDailyLog } from '@/lib/storage'
import { inferFoodCategory } from '@/lib/diet211'
import FoodCard from '@/components/FoodCard'

interface FoodProduct {
  id: string
  name: string
  calories: number
  carbs: number
  protein: number
  fat: number
  imageUrl?: string | null
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '零食',
}

const CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein: '蛋白质',
  vegetable: '蔬菜',
  carb: '碳水',
  fat: '脂肪',
  other: '其他',
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meal = (searchParams.get('meal') || 'breakfast') as MealType
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<FoodProduct | null>(null)
  const [amount, setAmount] = useState('100')
  const [selectedMeal, setSelectedMeal] = useState<MealType>(meal)
  const [category, setCategory] = useState<FoodCategory>('other')
  const [toast, setToast] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/food?q=${encodeURIComponent(q)}&page=1&pageSize=20`)
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) {
          setError('食物搜索暂时不可用')
        } else {
          setError(data.error || '搜索失败')
        }
        setProducts([])
        return
      }
      setProducts(data.products || [])
    } catch {
      setError('食物搜索暂时不可用')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  const handleSelectFood = (food: FoodProduct) => {
    setSelected(food)
    setAmount('100')
    setCategory(inferFoodCategory(food.calories, food.carbs, food.protein, food.fat))
  }

  const handleAdd = () => {
    if (!selected) return
    const g = Number(amount)
    if (!g || g <= 0) {
      showToast('请输入有效的克数')
      return
    }
    const ratio = g / 100
    const entry: MealEntry = {
      id: crypto.randomUUID(),
      name: selected.name,
      calories: Math.round(selected.calories * ratio),
      carbs: Math.round(selected.carbs * ratio * 10) / 10,
      protein: Math.round(selected.protein * ratio * 10) / 10,
      fat: Math.round(selected.fat * ratio * 10) / 10,
      amount: g,
      foodCategory: category,
      source: 'search',
      createdAt: new Date().toISOString(),
    }
    const log = getDailyLog(date)
    log.meals[selectedMeal] = [...log.meals[selectedMeal], entry]
    saveDailyLog(log)
    showToast(`已添加"${selected.name}"到${MEAL_LABELS[selectedMeal]}`)
    setSelected(null)
    setQuery('')
    setProducts([])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          添加食物到{MEAL_LABELS[meal]}
        </h1>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索食物名称..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors shadow-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setProducts([]) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 食物详情（展开） */}
      {selected && (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-green-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500">每100g：{Math.round(selected.calories)} kcal</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* 营养成分 */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            {[
              { label: '碳水', value: selected.carbs, color: 'text-blue-500' },
              { label: '蛋白质', value: selected.protein, color: 'text-purple-500' },
              { label: '脂肪', value: selected.fat, color: 'text-amber-500' },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-2">
                <p className={`text-sm font-semibold ${m.color}`}>{Math.round(m.value * 10) / 10}g</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>

          {/* 份量输入 */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">摄入量（克）</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                step="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">添加到</label>
              <select
                value={selectedMeal}
                onChange={e => setSelectedMeal(e.target.value as MealType)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-green-400 transition-colors bg-white"
              >
                {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                  <option key={m} value={m}>{MEAL_LABELS[m]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 分类 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">食物分类（用于211评估）</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as FoodCategory)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-green-400 transition-colors bg-white"
            >
              {(Object.keys(CATEGORY_LABELS) as FoodCategory[]).map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* 实际热量预览 */}
          {Number(amount) > 0 && (
            <div className="bg-green-50 rounded-xl p-3 mb-4 text-center">
              <p className="text-sm text-green-700">
                {Number(amount)}g → <span className="font-bold text-green-600">{Math.round(selected.calories * Number(amount) / 100)} kcal</span>
              </p>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full bg-green-500 text-white font-medium py-3 rounded-xl hover:bg-green-600 active:scale-98 transition-all duration-200"
          >
            添加到{MEAL_LABELS[selectedMeal]}
          </button>
        </div>
      )}

      {/* 搜索结果 */}
      {!selected && (
        <>
          {loading && (
            <div className="text-center py-8 text-gray-400">搜索中...</div>
          )}
          {error && !loading && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 text-center">
              {error}
            </div>
          )}
          {!loading && !error && products.length === 0 && query && (
            <div className="text-center py-12 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p>未找到相关食物</p>
              <p className="text-sm mt-1">请尝试其他关键词</p>
            </div>
          )}
          {!loading && products.length > 0 && (
            <div className="space-y-2">
              {products.map(p => (
                <FoodCard
                  key={p.id}
                  name={p.name}
                  calories={p.calories}
                  carbs={p.carbs}
                  protein={p.protein}
                  fat={p.fat}
                  imageUrl={p.imageUrl}
                  onClick={() => handleSelectFood(p)}
                />
              ))}
            </div>
          )}
          {!query && (
            <div className="text-center py-12 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p>输入食物名���开始搜索</p>
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
