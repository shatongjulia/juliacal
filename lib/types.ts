export const STORAGE_VERSION = 1

export type FoodCategory = 'protein' | 'vegetable' | 'carb' | 'fat' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose' | 'maintain' | 'gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type DietMode = 'peace' | 'campaign'

export interface UserSettings {
  version: number
  name: string
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  activityLevel: ActivityLevel
  goal: Goal
  dietMode: DietMode
  dailyCalorieTarget: number
  dailyCarbTarget: number
  dailyProteinTarget: number
  dailyFatTarget: number
  dailyWaterTarget: number
  onboardingComplete: boolean
}

export interface DailyLog {
  date: string
  meals: Record<MealType, MealEntry[]>
  water: number
  mealTimes: Record<MealType, string | null>
}

export interface MealEntry {
  id: string
  name: string
  calories: number
  carbs: number
  protein: number
  fat: number
  amount: number
  foodCategory: FoodCategory
  source: 'search' | 'camera'
  createdAt: string
  per100g?: { calories: number; carbs: number; protein: number; fat: number }
}
