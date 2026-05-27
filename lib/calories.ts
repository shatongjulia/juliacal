import { ActivityLevel, Goal, UserSettings, DietMode } from './types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
}

export function calculateBMR(gender: 'male' | 'female', weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

export function calculateDailyTarget(tdee: number, goal: Goal): number {
  if (goal === 'lose') return Math.max(1000, Math.round(tdee - 500))
  if (goal === 'gain') return Math.round(tdee + 300)
  return Math.round(tdee)
}

// 和平模式：蛋白 30%、脂肪 30%、碳水 40%
export function calculateMacros(dailyCalories: number) {
  return {
    dailyCarbTarget: Math.round((dailyCalories * 0.40) / 4),
    dailyProteinTarget: Math.round((dailyCalories * 0.30) / 4),
    dailyFatTarget: Math.round((dailyCalories * 0.30) / 9),
  }
}

// 战役模式：绝对克数锚定法（蛋白 2.2 / 碳水 1.4 / 脂肪 0.9 g/kg）
export function calculateCampaignMacros(weight: number) {
  const p = Math.round(weight * 2.2)
  const c = Math.round(weight * 1.4)
  const f = Math.round(weight * 0.9)
  return {
    dailyCalorieTarget: p * 4 + c * 4 + f * 9,
    dailyCarbTarget: c,
    dailyProteinTarget: p,
    dailyFatTarget: f,
    dailyWaterTarget: Math.round(weight * 35),
  }
}

// 根据 dietMode 返回当前模式的目标值（用于显示页）
export function getMacroTargets(settings: UserSettings) {
  if (settings.dietMode === 'campaign') {
    return calculateCampaignMacros(settings.weight)
  }
  return {
    dailyCalorieTarget: settings.dailyCalorieTarget,
    dailyWaterTarget: settings.dailyWaterTarget,
    ...calculateMacros(settings.dailyCalorieTarget),
  }
}

export function buildUserTargets(settings: Pick<UserSettings, 'gender' | 'weight' | 'height' | 'age' | 'activityLevel' | 'goal' | 'dietMode'>) {
  if (settings.dietMode === 'campaign') {
    return calculateCampaignMacros(settings.weight)
  }
  const bmr = calculateBMR(settings.gender, settings.weight, settings.height, settings.age)
  const tdee = calculateTDEE(bmr, settings.activityLevel)
  const dailyCalorieTarget = calculateDailyTarget(tdee, settings.goal)
  const macros = calculateMacros(dailyCalorieTarget)
  const dailyWaterTarget = Math.round(settings.weight * 35)
  return { dailyCalorieTarget, ...macros, dailyWaterTarget }
}
