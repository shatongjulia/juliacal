'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserSettings, ActivityLevel, Goal, DietMode } from '@/lib/types'
import { getSettings, saveSettings, clearAllData } from '@/lib/storage'
import { buildUserTargets, getMacroTargets } from '@/lib/calories'

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: '久坐（几乎不运动）',
  light: '轻度运动（每周1-3天）',
  moderate: '中度运动（每周3-5天）',
  active: '高强度运动（每周6-7天）',
}

const GOAL_LABELS: Record<Goal, string> = {
  lose: '减重',
  maintain: '维持体重',
  gain: '增重',
}

export default function ProfilePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<UserSettings>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [calorieManuallySet, setCalorieManuallySet] = useState(false)

  useEffect(() => {
    const s = getSettings()
    setSettings(s)
    if (s) setForm(s)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    const age = Number(form.age)
    const height = Number(form.height)
    const weight = Number(form.weight)
    const target = Number(form.dailyCalorieTarget)

    if (!form.gender) newErrors.gender = '请选择性别'
    if (!age || age < 1 || age > 120) newErrors.age = '年龄 1-120'
    if (!height || height < 50 || height > 300) newErrors.height = '身高 50-300 cm'
    if (!weight || weight < 1 || weight > 500) newErrors.weight = '体重 1-500 kg'
    if (!form.activityLevel) newErrors.activityLevel = '请选择活动水平'
    if (!form.goal) newErrors.goal = '请选择目标'
    if (target < 1000) newErrors.dailyCalorieTarget = '每日热量目标不低于 1000 kcal'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const dietMode = (form.dietMode || 'peace') as DietMode
    const targets = buildUserTargets({
      gender: form.gender as 'male' | 'female',
      age,
      height,
      weight,
      activityLevel: form.activityLevel as ActivityLevel,
      goal: form.goal as Goal,
      dietMode,
    })

    const updated: UserSettings = {
      ...settings!,
      ...form,
      age,
      height,
      weight,
      gender: form.gender as 'male' | 'female',
      activityLevel: form.activityLevel as ActivityLevel,
      goal: form.goal as Goal,
      dietMode,
      dailyCalorieTarget: calorieManuallySet ? target : targets.dailyCalorieTarget,
      dailyCarbTarget: targets.dailyCarbTarget,
      dailyProteinTarget: targets.dailyProteinTarget,
      dailyFatTarget: targets.dailyFatTarget,
      dailyWaterTarget: targets.dailyWaterTarget,
    }

    saveSettings(updated)
    setSettings(updated)
    setEditing(false)
    showToast('设置已保存，热量目标已更新')
  }

  const handleClear = () => {
    clearAllData()
    router.push('/onboarding')
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">加载中...</div>
  }

  const macroTargets = getMacroTargets(settings)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">个人资料</h1>
        <button
          onClick={() => editing ? handleSave() : (setEditing(true), setCalorieManuallySet(false))}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            editing
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {editing ? '保存' : '编辑'}
        </button>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">基本信息</h2>

        <Field label="姓名">
          {editing ? (
            <input
              type="text"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              maxLength={20}
              className="input-field"
            />
          ) : <span>{settings.name || '未设置'}</span>}
        </Field>

        <Field label="性别" error={errors.gender}>
          {editing ? (
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setForm(f => ({ ...f, gender: g }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm transition-all duration-200 ${
                    form.gender === g ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {g === 'male' ? '♂ 男' : '♀ 女'}
                </button>
              ))}
            </div>
          ) : <span>{settings.gender === 'male' ? '男' : '女'}</span>}
        </Field>

        {(['age', 'height', 'weight'] as const).map(key => {
          const labels = { age: '年龄（岁）', height: '身高（cm）', weight: '体重（kg）' }
          const steps = { age: '1', height: '1', weight: '0.1' }
          return (
            <Field key={key} label={labels[key]} error={errors[key]}>
              {editing ? (
                <input
                  type="number"
                  value={String(form[key] || '')}
                  step={steps[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="input-field"
                />
              ) : <span>{settings[key]}{key === 'age' ? '岁' : key === 'height' ? ' cm' : ' kg'}</span>}
            </Field>
          )
        })}

        <Field label="活动水平" error={errors.activityLevel}>
          {editing ? (
            (form.dietMode || 'peace') === 'campaign' ? (
              <div>
                <select
                  value={form.activityLevel || ''}
                  onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value as ActivityLevel }))}
                  className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(k => (
                    <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">战役模式由体重直接锚定，切换回和平模式时保留此设置</p>
              </div>
            ) : (
              <select
                value={form.activityLevel || ''}
                onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value as ActivityLevel }))}
                className="input-field bg-white"
              >
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(k => (
                  <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
                ))}
              </select>
            )
          ) : <span>{ACTIVITY_LABELS[settings.activityLevel]}</span>}
        </Field>

        <Field label="目标" error={errors.goal}>
          {editing ? (
            (form.dietMode || 'peace') === 'campaign' ? (
              <div>
                <div className="flex gap-2 opacity-50 pointer-events-none">
                  {(Object.keys(GOAL_LABELS) as Goal[]).map(g => (
                    <button
                      key={g}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs ${
                        form.goal === g ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {GOAL_LABELS[g]}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">战役模式为减脂冲刺，由体重直接锚定宏量</p>
              </div>
            ) : (
              <div className="flex gap-2">
                {(Object.keys(GOAL_LABELS) as Goal[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(f => ({ ...f, goal: g }))}
                    className={`flex-1 py-2 rounded-xl border-2 text-xs transition-all duration-200 ${
                      form.goal === g ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {GOAL_LABELS[g]}
                  </button>
                ))}
              </div>
            )
          ) : <span>{GOAL_LABELS[settings.goal]}</span>}
        </Field>
      </div>

      {/* 饮食模式 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">饮食模式</h2>
        <Field label="模式">
          {editing ? (
            <div className="flex gap-2">
              {([
                { value: 'peace', label: '🍃 和平模式', desc: '30/30/40，长期维持' },
                { value: 'campaign', label: '🔥 战役模式', desc: '绝对克数锚定，减脂冲刺' },
              ] as const).map(m => (
                <button
                  key={m.value}
                  onClick={() => setForm(f => ({ ...f, dietMode: m.value }))}
                  className={`flex-1 py-2 rounded-xl border-2 text-xs transition-all duration-200 ${
                    (form.dietMode || 'peace') === m.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <div>{m.label}</div>
                  <div className="text-[10px] opacity-60">{m.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            <span>{settings.dietMode === 'campaign' ? '🔥 战役模式' : '🍃 和平模式'}</span>
          )}
        </Field>
      </div>

      {/* 热量目标 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">每日热量目标</h2>
        <Field label="热量（kcal）" error={errors.dailyCalorieTarget}>
          {editing ? (
            (form.dietMode || 'peace') === 'campaign' ? (
              <span className="text-gray-400 text-sm">由体重自动计算 ({macroTargets.dailyCalorieTarget} kcal)</span>
            ) : (
              <input
                type="number"
                value={String(form.dailyCalorieTarget || '')}
                min="1000"
                step="10"
                onChange={e => { setCalorieManuallySet(true); setForm(f => ({ ...f, dailyCalorieTarget: Number(e.target.value) })) }}
                className="input-field"
              />
            )
          ) : <span className="text-green-600 font-semibold">{settings.dailyCalorieTarget} kcal</span>}
        </Field>
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="bg-blue-50 rounded-xl p-2">
            <p className="text-blue-600 font-semibold">{macroTargets.dailyCarbTarget}g</p>
            <p className="text-gray-500 text-xs">碳水</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-2">
            <p className="text-purple-600 font-semibold">{macroTargets.dailyProteinTarget}g</p>
            <p className="text-gray-500 text-xs">蛋白质</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2">
            <p className="text-amber-600 font-semibold">{macroTargets.dailyFatTarget}g</p>
            <p className="text-gray-500 text-xs">脂肪</p>
          </div>
        </div>
        <div className="mt-2 bg-blue-50 rounded-xl p-2 text-center">
          <p className="text-blue-600 font-semibold">{settings.dailyWaterTarget}ml</p>
          <p className="text-gray-500 text-xs">饮水量（体重 × 3.5%）</p>
        </div>
      </div>

      {/* 危险区 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">数据管理</h2>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-all duration-200"
        >
          清除所有数据
        </button>
      </div>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认清除所有数据？</h3>
            <p className="text-gray-500 text-sm mb-6">此操作不可撤销，所有饮食记录和设置将被删除，并重新引导设置。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #4ade80;
        }
      `}</style>
    </div>
  )
}

function Field({
  label, children, error
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 w-28 flex-shrink-0">{label}</span>
        <div className="flex-1 text-right text-sm text-gray-900">{children}</div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
