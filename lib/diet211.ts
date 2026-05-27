import { FoodCategory, MealEntry, MealType, DietMode } from './types'

export interface Diet211Result {
  compliant: boolean
  proteinRatio: number
  fatRatio: number
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

// 211 法则：和平模式 30/30/40，战役模式 37/37/26
// 使用实际营养素克数计算供能比（蛋白×4、脂肪×9、碳水×4）
const VEG_MIN_GRAMS = 80
const ABS_TOLERANCE = 0.05       // 211 比率用 ±5 个百分点（绝对值）
const PF_TOLERANCE = 0.10        // 220 蛋白:脂肪比率用相对容差

const PEACE_RATIOS = { protein: 0.30, fat: 0.30, carb: 0.40 }
const CAMPAIGN_RATIOS = { protein: 0.39, fat: 0.36, carb: 0.25 }

function getRatios(dietMode?: DietMode) {
  return dietMode === 'campaign' ? CAMPAIGN_RATIOS : PEACE_RATIOS
}

export function evaluate211(entries: MealEntry[], mealType?: MealType, dietMode?: DietMode): Diet211Result | null {
  if (entries.length < 2) return null

  const vegGrams = entries
    .filter(e => e.foodCategory === 'vegetable')
    .reduce((sum, e) => sum + e.amount, 0)

  const nonVeg = entries.filter(e => e.foodCategory !== 'vegetable')

  const proteinCals = nonVeg.reduce((sum, e) => sum + e.protein * 4, 0)
  const fatCals = nonVeg.reduce((sum, e) => sum + e.fat * 9, 0)
  const carbCals = nonVeg.reduce((sum, e) => sum + e.carbs * 4, 0)

  const nonVegCals = proteinCals + fatCals + carbCals
  if (nonVegCals === 0) return null

  const proteinRatio = proteinCals / nonVegCals
  const fatRatio = fatCals / nonVegCals
  const carbRatio = carbCals / nonVegCals

  const R = getRatios(dietMode)

  // 220 模式：晚餐无碳水时只检查蛋白:脂肪比例和蔬菜量
  if (mealType === 'dinner' && carbRatio < 0.01) {
    const pfTarget = R.protein / R.fat
    const pfActual = proteinCals / (fatCals || 1)
    const pfMin = pfTarget * (1 - PF_TOLERANCE)
    const pfMax = pfTarget * (1 + PF_TOLERANCE)

    const issues: string[] = []
    if (vegGrams < VEG_MIN_GRAMS) {
      issues.push(`蔬菜不足（${Math.round(vegGrams)}g，需≥${VEG_MIN_GRAMS}g）`)
    }
    if (pfActual < pfMin) {
      issues.push(`蛋白质相对脂肪偏少（蛋白:脂肪≈${pfActual.toFixed(1)}:1，目标约${pfTarget.toFixed(1)}:1）`)
    }
    if (pfActual > pfMax) {
      issues.push(`脂肪相对蛋白质偏少（蛋白:脂肪≈${pfActual.toFixed(1)}:1，目标约${pfTarget.toFixed(1)}:1）`)
    }

    return {
      compliant: issues.length === 0,
      proteinRatio: pfActual / (1 + pfActual),
      fatRatio: 1 / (1 + pfActual),
      vegetableGrams: vegGrams,
      carbRatio,
      issues,
    }
  }

  const proteinMin = R.protein - ABS_TOLERANCE
  const fatMin = R.fat - ABS_TOLERANCE
  const fatMax = R.fat + ABS_TOLERANCE
  const carbMin = R.carb - ABS_TOLERANCE
  const carbMax = R.carb + ABS_TOLERANCE

  const pct = (v: number) => Math.round(v * 100)

  const issues: string[] = []
  if (vegGrams < VEG_MIN_GRAMS) {
    issues.push(`蔬菜不足（${Math.round(vegGrams)}g，需≥${VEG_MIN_GRAMS}g）`)
  }
  if (proteinRatio < proteinMin) {
    issues.push(`蛋白质不足（${pct(proteinRatio)}%，目标约${pct(R.protein)}%）`)
  }
  if (fatRatio < fatMin) {
    issues.push(`脂肪不足（${pct(fatRatio)}%，目标约${pct(R.fat)}%）`)
  }
  if (fatRatio > fatMax) {
    issues.push(`脂肪过多（${pct(fatRatio)}%，目标约${pct(R.fat)}%）`)
  }
  if (carbRatio < carbMin) {
    issues.push(`碳水不足（${pct(carbRatio)}%，目标约${pct(R.carb)}%）`)
  }
  if (carbRatio > carbMax) {
    issues.push(`碳水过多（${pct(carbRatio)}%，目标约${pct(R.carb)}%）`)
  }

  return {
    compliant: issues.length === 0,
    proteinRatio,
    fatRatio,
    vegetableGrams: vegGrams,
    carbRatio,
    issues,
  }
}
