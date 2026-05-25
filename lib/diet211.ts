import { FoodCategory, MealEntry } from './types'

export interface Diet211Result {
  compliant: boolean
  proteinRatio: number
  vegetableGrams: number
  carbRatio: number
  issues: string[]
}

export function inferFoodCategory(calories: number, carbs: number, protein: number, fat: number): FoodCategory {
  if (protein >= 15) return 'protein'
  if (calories <= 50 && carbs <= 10) return 'vegetable'
  if (carbs >= 40) return 'carb'
  if (fat >= 20) return 'fat'
  return 'other'
}

// 211 法则：蔬菜不计能量（粗纤维不吸收），只看蛋白+碳水的热量比
const VEG_MIN_GRAMS = 80
const PROTEIN_TARGET = 2.8 / 3.8  // ≈ 73.7%
const CARB_TARGET = 1 / 3.8       // ≈ 26.3%
const TOLERANCE = 0.05            // 目标的 ±5%

export function evaluate211(entries: MealEntry[]): Diet211Result | null {
  if (entries.length < 2) return null

  const vegGrams = entries
    .filter(e => e.foodCategory === 'vegetable')
    .reduce((sum, e) => sum + e.amount, 0)

  const proteinCals = entries
    .filter(e => e.foodCategory === 'protein')
    .reduce((sum, e) => sum + e.calories, 0)

  const carbCals = entries
    .filter(e => e.foodCategory === 'carb')
    .reduce((sum, e) => sum + e.calories, 0)

  const nonVegCals = proteinCals + carbCals
  if (nonVegCals === 0) return null

  const proteinRatio = proteinCals / nonVegCals
  const carbRatio = carbCals / nonVegCals

  const proteinMin = PROTEIN_TARGET * (1 - TOLERANCE)
  const proteinMax = PROTEIN_TARGET * (1 + TOLERANCE)
  const carbMin = CARB_TARGET * (1 - TOLERANCE)
  const carbMax = CARB_TARGET * (1 + TOLERANCE)

  const issues: string[] = []
  if (vegGrams < VEG_MIN_GRAMS) {
    issues.push(`蔬菜不足（${Math.round(vegGrams)}g，需≥${VEG_MIN_GRAMS}g）`)
  }
  if (proteinRatio < proteinMin) {
    issues.push(`蛋白质不足（${Math.round(proteinRatio * 100)}%，目标约74%）`)
  }
  if (proteinRatio > proteinMax) {
    issues.push(`蛋白质过多（${Math.round(proteinRatio * 100)}%，目标约74%）`)
  }
  if (carbRatio < carbMin) {
    issues.push(`碳水不足（${Math.round(carbRatio * 100)}%，目标约26%）`)
  }
  if (carbRatio > carbMax) {
    issues.push(`碳水过多（${Math.round(carbRatio * 100)}%，目标约26%）`)
  }

  return {
    compliant: issues.length === 0,
    proteinRatio,
    vegetableGrams: vegGrams,
    carbRatio,
    issues,
  }
}
