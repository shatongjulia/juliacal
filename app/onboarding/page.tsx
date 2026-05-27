'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { ActivityLevel, Goal, UserSettings } from '@/lib/types'
import { buildUserTargets } from '@/lib/calories'
import { saveSettings } from '@/lib/storage'

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: '久坐', desc: '几乎不运动' },
  { value: 'light', label: '轻度运动', desc: '每周1-3天' },
  { value: 'moderate', label: '中度运动', desc: '每周3-5天' },
  { value: 'active', label: '高强度运动', desc: '每周6-7天' },
]

const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: 'lose', label: '减重', desc: '每天减少500 kcal' },
  { value: 'maintain', label: '维持体重', desc: '保持当前体重' },
  { value: 'gain', label: '增重', desc: '每天增加300 kcal' },
]

interface FormData {
  name: string
  gender: 'male' | 'female' | ''
  age: string
  height: string
  weight: string
  activityLevel: ActivityLevel | ''
  goal: Goal | ''
  dietMode: 'peace' | 'campaign'
}

interface FormErrors {
  name?: string
  gender?: string
  age?: string
  height?: string
  weight?: string
  activityLevel?: string
  goal?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: '',
    goal: '',
    dietMode: 'peace',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const recommendedCalories = (() => {
    if (!form.gender || !form.age || !form.height || !form.weight || !form.activityLevel || !form.goal) return null
    const age = Number(form.age)
    const height = Number(form.height)
    const weight = Number(form.weight)
    if (age < 1 || height < 50 || weight < 1) return null
    try {
      const targets = buildUserTargets({
        gender: form.gender as 'male' | 'female',
        age,
        height,
        weight,
        activityLevel: form.activityLevel as ActivityLevel,
        goal: form.goal as Goal,
        dietMode: form.dietMode,
      })
      return targets
    } catch {
      return null
    }
  })()

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}
    if (step === 1) {
      if (form.name.length > 20) newErrors.name = '姓名不超过20字符'
    }
    if (step === 2) {
      if (!form.gender) newErrors.gender = '请选择性别'
    }
    if (step === 3) {
      const age = Number(form.age)
      const height = Number(form.height)
      const weight = Number(form.weight)
      if (!form.age || age < 1 || age > 120 || !Number.isInteger(age)) newErrors.age = '年龄 1-120 整数'
      if (!form.height || height < 50 || height > 300 || !Number.isInteger(height)) newErrors.height = '身高 50-300 cm 整数'
      if (!form.weight || weight < 1 || weight > 500) newErrors.weight = '体重 1-500 kg'
    }
    if (step === 4) {
      if (!form.activityLevel) newErrors.activityLevel = '请选择活动水平'
    }
    if (step === 5) {
      if (!form.goal) newErrors.goal = '请选择目标'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (step < 6) {
      setStep(s => s + 1)
      setErrors({})
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!form.gender || !form.activityLevel || !form.goal) return
    try {
      const targets = buildUserTargets({
        gender: form.gender as 'male' | 'female',
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activityLevel as ActivityLevel,
        goal: form.goal as Goal,
        dietMode: form.dietMode,
      })
      const settings: UserSettings = {
        version: 1,
        name: form.name.trim(),
        gender: form.gender as 'male' | 'female',
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: form.activityLevel as ActivityLevel,
        goal: form.goal as Goal,
        dietMode: form.dietMode,
        dailyCalorieTarget: targets.dailyCalorieTarget,
        dailyCarbTarget: targets.dailyCarbTarget,
        dailyProteinTarget: targets.dailyProteinTarget,
        dailyFatTarget: targets.dailyFatTarget,
        dailyWaterTarget: targets.dailyWaterTarget,
        onboardingComplete: true,
      }
      saveSettings(settings)
      router.push('/')
    } catch {
      setErrors({ goal: '保存失败，请重试' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-500">JuliaCal</h1>
          <p className="text-gray-500 mt-1">饮食热量追踪</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-green-500' : i < step ? 'w-2 bg-green-300' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Step 1: 姓名 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">你好！</h2>
              <p className="text-gray-500 mb-6">请告诉我你的名字（可选）</p>
              <input
                type="text"
                placeholder="你的名字"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                maxLength={20}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Step 2: 性别 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">你的性别</h2>
              <p className="text-gray-500 mb-6">用于准确计算基础代谢率</p>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(f => ({ ...f, gender: g }))}
                    className={`py-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                      form.gender === g
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {g === 'male' ? '♂ 男' : '♀ 女'}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-sm mt-2">{errors.gender}</p>}
            </div>
          )}

          {/* Step 3: 年龄、身高、体重 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">身体信息</h2>
              <p className="text-gray-500 mb-6">计算你的每日热量需求</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">年龄（岁）</label>
                  <input
                    type="number"
                    placeholder="例：25"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">身高（cm）</label>
                  <input
                    type="number"
                    placeholder="例：165"
                    value={form.height}
                    onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
                  />
                  {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">体重（kg）</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="例：60.5"
                    value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400 transition-colors"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 活动水平 */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">活动水平</h2>
              <p className="text-gray-500 mb-6">你的日常运动频率</p>
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(f => ({ ...f, activityLevel: opt.value }))}
                    className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.activityLevel === opt.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-medium ${form.activityLevel === opt.value ? 'text-green-700' : 'text-gray-800'}`}>
                      {opt.label}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{opt.desc}</span>
                  </button>
                ))}
              </div>
              {errors.activityLevel && <p className="text-red-500 text-sm mt-2">{errors.activityLevel}</p>}
            </div>
          )}

          {/* Step 5: 目标 + 推荐热量 */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">你的目标</h2>
              <p className="text-gray-500 mb-4">选择你的饮食目标</p>
              <div className="space-y-2 mb-6">
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setForm(f => ({ ...f, goal: opt.value }))}
                    className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.goal === opt.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-medium ${form.goal === opt.value ? 'text-green-700' : 'text-gray-800'}`}>
                      {opt.label}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">{opt.desc}</span>
                  </button>
                ))}
              </div>
              {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal}</p>}

              {recommendedCalories && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-green-700 font-medium mb-1">推荐每日热量</p>
                  <p className="text-2xl font-bold text-green-600">{recommendedCalories.dailyCalorieTarget} kcal</p>
                  <div className="flex gap-4 mt-2 text-xs text-green-600">
                    <span>碳水 {recommendedCalories.dailyCarbTarget}g</span>
                    <span>蛋白质 {recommendedCalories.dailyProteinTarget}g</span>
                    <span>脂肪 {recommendedCalories.dailyFatTarget}g</span>
                    <span>饮水 {recommendedCalories.dailyWaterTarget}ml</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: 饮食模式 */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">选择饮食模式</h2>
              <p className="text-gray-500 mb-6">可以随时在资料页切换</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'peace' as const, label: '🍃 和平模式', desc: '30/30/40，长期维持' },
                  { value: 'campaign' as const, label: '🔥 战役模式', desc: '绝对克数锚定，减脂冲刺' },
                ]).map(m => (
                  <button
                    key={m.value}
                    onClick={() => setForm(f => ({ ...f, dietMode: m.value }))}
                    className={`py-4 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                      form.dietMode === m.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-[10px] opacity-60 mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => { setStep(s => s - 1); setErrors({}) }}
              className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <ChevronLeft size={18} /> 上一步
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-1 px-5 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 active:scale-98 transition-all duration-200"
          >
            {step === 6 ? '开始使用' : <><span>下一步</span><ChevronRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
