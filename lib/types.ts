export const STORAGE_VERSION = 1

export type FoodCategory = 'protein' | 'vegetable' | 'carb' | 'fat' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose' | 'maintain' | 'gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface UserSettings {
  version: number
  name: string
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  activityLevel: ActivityLevel
  goal: Goal
  dailyCalorieTarget: number
  dailyCarbTarget: number
  dailyProteinTarget: number
  dailyFatTarget: number
  onboardingComplete: boolean
}

export interface DailyLog {
  date: string
  meals: Record<MealType, MealEntry[]>
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
}
