import { FoodCategory, MealEntry } from './types'

export interface Diet211Result {
  compliant: boolean
  proteinRatio: number
  vegetableRatio: number
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

export function evaluate211(entries: MealEntry[]): Diet211Result | null {
  if (entries.length < 2) return null
  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0)
  if (totalAmount === 0) return null

  const byCategory = entries.reduce((acc, e) => {
    acc[e.foodCategory] = (acc[e.foodCategory] || 0) + e.amount
    return acc
  }, {} as Record<FoodCategory, number>)

  const proteinRatio = (byCategory.protein || 0) / totalAmount
  const vegetableRatio = (byCategory.vegetable || 0) / totalAmount
  const carbRatio = (byCategory.carb || 0) / totalAmount

  const issues: string[] = []
  if (proteinRatio < 0.4) issues.push(`蛋白质不足（${Math.round(proteinRatio * 100)}%，需≥40%）`)
  if (vegetableRatio < 0.2) issues.push(`蔬菜不足（${Math.round(vegetableRatio * 100)}%，需≥20%）`)
  if (carbRatio < 0.1 || carbRatio > 0.3) issues.push(`碳水不符（${Math.round(carbRatio * 100)}%，需10%-30%）`)

  return {
    compliant: issues.length === 0,
    proteinRatio,
    vegetableRatio,
    carbRatio,
    issues,
  }
}
