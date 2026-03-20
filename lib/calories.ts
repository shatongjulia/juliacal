import { ActivityLevel, Goal, UserSettings } from './types'

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

export function calculateMacros(dailyCalories: number) {
  return {
    dailyCarbTarget: Math.round((dailyCalories * 0.5) / 4),
    dailyProteinTarget: Math.round((dailyCalories * 0.25) / 4),
    dailyFatTarget: Math.round((dailyCalories * 0.25) / 9),
  }
}

export function buildUserTargets(settings: Pick<UserSettings, 'gender' | 'weight' | 'height' | 'age' | 'activityLevel' | 'goal'>) {
  const bmr = calculateBMR(settings.gender, settings.weight, settings.height, settings.age)
  const tdee = calculateTDEE(bmr, settings.activityLevel)
  const dailyCalorieTarget = calculateDailyTarget(tdee, settings.goal)
  const macros = calculateMacros(dailyCalorieTarget)
  return { dailyCalorieTarget, ...macros }
}
