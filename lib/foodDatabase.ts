import { FoodCategory } from './types'

export interface LocalFood {
  id: string
  name: string
  calories: number   // per 100g
  carbs: number
  protein: number
  fat: number
  category: FoodCategory
}

export const LOCAL_FOODS: LocalFood[] = [
  // 蛋类
  { id: 'l_egg', name: '鸡蛋', calories: 144, carbs: 2.8, protein: 13.1, fat: 8.8, category: 'protein' },
  { id: 'l_egg_white', name: '鸡蛋白', calories: 60, carbs: 0.7, protein: 11.6, fat: 0.1, category: 'protein' },
  { id: 'l_egg_yolk', name: '鸡蛋黄', calories: 328, carbs: 3.1, protein: 15.2, fat: 28.2, category: 'fat' },
  { id: 'l_duck_egg', name: '鸭蛋', calories: 180, carbs: 3.1, protein: 12.6, fat: 13.0, category: 'protein' },

  // 肉类
  { id: 'l_chicken_breast', name: '鸡胸肉', calories: 133, carbs: 0, protein: 26.7, fat: 2.5, category: 'protein' },
  { id: 'l_chicken_thigh', name: '鸡腿肉', calories: 181, carbs: 0, protein: 19.5, fat: 11.1, category: 'protein' },
  { id: 'l_pork_lean', name: '猪瘦肉', calories: 143, carbs: 1.5, protein: 20.3, fat: 6.2, category: 'protein' },
  { id: 'l_pork_fat', name: '猪五花肉', calories: 395, carbs: 2.4, protein: 14.6, fat: 37.0, category: 'fat' },
  { id: 'l_beef', name: '牛肉（瘦）', calories: 106, carbs: 2.0, protein: 20.2, fat: 2.3, category: 'protein' },
  { id: 'l_beef_fat', name: '牛肉（肥瘦）', calories: 250, carbs: 2.0, protein: 17.8, fat: 19.2, category: 'protein' },
  { id: 'l_lamb', name: '羊肉', calories: 203, carbs: 0, protein: 19.0, fat: 14.1, category: 'protein' },
  { id: 'l_pork_rib', name: '猪排骨', calories: 278, carbs: 0, protein: 18.3, fat: 22.0, category: 'protein' },

  // 鱼虾海鲜
  { id: 'l_salmon', name: '三文鱼', calories: 208, carbs: 0, protein: 20.0, fat: 13.0, category: 'protein' },
  { id: 'l_tilapia', name: '罗非鱼', calories: 96, carbs: 0, protein: 20.1, fat: 1.7, category: 'protein' },
  { id: 'l_shrimp', name: '虾', calories: 87, carbs: 2.8, protein: 16.8, fat: 0.6, category: 'protein' },
  { id: 'l_tuna', name: '金枪鱼（罐头）', calories: 116, carbs: 0, protein: 25.5, fat: 1.0, category: 'protein' },
  { id: 'l_cod', name: '鳕鱼', calories: 88, carbs: 0, protein: 20.4, fat: 0.5, category: 'protein' },
  { id: 'l_crab', name: '螃蟹', calories: 95, carbs: 2.3, protein: 17.5, fat: 2.6, category: 'protein' },

  // 主食/碳水
  { id: 'l_rice', name: '白米饭（熟）', calories: 116, carbs: 25.6, protein: 2.6, fat: 0.3, category: 'carb' },
  { id: 'l_rice_raw', name: '大米（生）', calories: 346, carbs: 77.2, protein: 7.4, fat: 0.8, category: 'carb' },
  { id: 'l_noodle', name: '面条（煮熟）', calories: 109, carbs: 22.7, protein: 3.3, fat: 0.5, category: 'carb' },
  { id: 'l_bread', name: '白面包', calories: 265, carbs: 49.0, protein: 9.0, fat: 3.2, category: 'carb' },
  { id: 'l_wholemeal_bread', name: '全麦面包', calories: 247, carbs: 41.0, protein: 10.7, fat: 4.1, category: 'carb' },
  { id: 'l_potato', name: '土豆', calories: 81, carbs: 17.8, protein: 2.0, fat: 0.1, category: 'carb' },
  { id: 'l_sweet_potato', name: '红薯', calories: 99, carbs: 23.1, protein: 1.4, fat: 0.1, category: 'carb' },
  { id: 'l_corn', name: '玉米（甜）', calories: 86, carbs: 18.7, protein: 3.3, fat: 1.3, category: 'carb' },
  { id: 'l_oat', name: '燕麦片', calories: 389, carbs: 66.3, protein: 16.9, fat: 6.9, category: 'carb' },
  { id: 'l_tofu', name: '北豆腐', calories: 98, carbs: 4.2, protein: 12.2, fat: 4.8, category: 'protein' },
  { id: 'l_tofu_soft', name: '嫩豆腐', calories: 50, carbs: 2.9, protein: 5.0, fat: 1.9, category: 'protein' },
  { id: 'l_dumpling', name: '饺子（猪肉白菜）', calories: 240, carbs: 28.0, protein: 10.0, fat: 9.5, category: 'carb' },
  { id: 'l_baozi', name: '包子（猪肉）', calories: 226, carbs: 31.0, protein: 9.8, fat: 7.2, category: 'carb' },
  { id: 'l_mantou', name: '馒头', calories: 233, carbs: 48.3, protein: 7.0, fat: 1.1, category: 'carb' },

  // 蔬菜
  { id: 'l_spinach', name: '菠菜', calories: 23, carbs: 3.6, protein: 2.6, fat: 0.3, category: 'vegetable' },
  { id: 'l_broccoli', name: '西兰花', calories: 34, carbs: 6.6, protein: 2.8, fat: 0.4, category: 'vegetable' },
  { id: 'l_cabbage', name: '卷心菜', calories: 25, carbs: 5.8, protein: 1.3, fat: 0.1, category: 'vegetable' },
  { id: 'l_tomato', name: '西红柿', calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2, category: 'vegetable' },
  { id: 'l_cucumber', name: '黄瓜', calories: 15, carbs: 3.6, protein: 0.7, fat: 0.1, category: 'vegetable' },
  { id: 'l_carrot', name: '胡萝卜', calories: 41, carbs: 9.6, protein: 0.9, fat: 0.2, category: 'vegetable' },
  { id: 'l_celery', name: '芹菜', calories: 16, carbs: 3.0, protein: 0.7, fat: 0.1, category: 'vegetable' },
  { id: 'l_lettuce', name: '生菜', calories: 14, carbs: 2.9, protein: 1.4, fat: 0.2, category: 'vegetable' },
  { id: 'l_mushroom', name: '香菇', calories: 26, carbs: 6.8, protein: 2.2, fat: 0.3, category: 'vegetable' },
  { id: 'l_eggplant', name: '茄子', calories: 24, carbs: 5.9, protein: 1.1, fat: 0.2, category: 'vegetable' },
  { id: 'l_pepper', name: '青椒', calories: 27, carbs: 5.4, protein: 1.0, fat: 0.3, category: 'vegetable' },
  { id: 'l_onion', name: '洋葱', calories: 40, carbs: 9.3, protein: 1.1, fat: 0.1, category: 'vegetable' },
  { id: 'l_garlic', name: '大蒜', calories: 149, carbs: 33.1, protein: 6.4, fat: 0.5, category: 'vegetable' },
  { id: 'l_bean_sprout', name: '豆芽', calories: 30, carbs: 5.9, protein: 3.1, fat: 0.1, category: 'vegetable' },
  { id: 'l_cabbage_cn', name: '大白菜', calories: 17, carbs: 3.2, protein: 1.5, fat: 0.1, category: 'vegetable' },
  { id: 'l_bok_choy', name: '小白菜', calories: 15, carbs: 2.4, protein: 1.5, fat: 0.3, category: 'vegetable' },
  { id: 'l_bitter_gourd', name: '苦瓜', calories: 19, carbs: 4.3, protein: 1.0, fat: 0.1, category: 'vegetable' },
  { id: 'l_winter_melon', name: '冬瓜', calories: 11, carbs: 2.6, protein: 0.4, fat: 0.2, category: 'vegetable' },

  // 水果
  { id: 'l_apple', name: '苹果', calories: 52, carbs: 13.8, protein: 0.3, fat: 0.2, category: 'other' },
  { id: 'l_banana', name: '香蕉', calories: 93, carbs: 22.8, protein: 1.1, fat: 0.3, category: 'carb' },
  { id: 'l_orange', name: '橙子', calories: 47, carbs: 11.8, protein: 0.9, fat: 0.1, category: 'other' },
  { id: 'l_grape', name: '葡萄', calories: 69, carbs: 18.1, protein: 0.7, fat: 0.2, category: 'other' },
  { id: 'l_watermelon', name: '西瓜', calories: 30, carbs: 7.6, protein: 0.6, fat: 0.2, category: 'vegetable' },
  { id: 'l_strawberry', name: '草莓', calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3, category: 'vegetable' },
  { id: 'l_mango', name: '芒果', calories: 65, carbs: 17.0, protein: 0.5, fat: 0.3, category: 'carb' },
  { id: 'l_kiwi', name: '猕猴桃', calories: 61, carbs: 14.7, protein: 1.1, fat: 0.5, category: 'other' },
  { id: 'l_pear', name: '梨', calories: 50, carbs: 13.1, protein: 0.3, fat: 0.1, category: 'other' },

  // 奶制品
  { id: 'l_milk', name: '牛奶（全脂）', calories: 61, carbs: 4.8, protein: 3.2, fat: 3.2, category: 'protein' },
  { id: 'l_skim_milk', name: '脱脂牛奶', calories: 33, carbs: 4.9, protein: 3.4, fat: 0.1, category: 'protein' },
  { id: 'l_yogurt', name: '酸奶（原味）', calories: 61, carbs: 5.7, protein: 3.5, fat: 3.1, category: 'protein' },
  { id: 'l_cheese', name: '奶酪', calories: 402, carbs: 1.3, protein: 25.0, fat: 33.1, category: 'fat' },

  // 豆类/坚果
  { id: 'l_peanut', name: '花生', calories: 567, carbs: 16.1, protein: 25.8, fat: 49.2, category: 'fat' },
  { id: 'l_walnut', name: '核桃', calories: 654, carbs: 13.7, protein: 15.2, fat: 65.2, category: 'fat' },
  { id: 'l_almond', name: '杏仁', calories: 579, carbs: 21.6, protein: 21.2, fat: 49.9, category: 'fat' },
  { id: 'l_soybean', name: '黄豆', calories: 446, carbs: 30.2, protein: 35.1, fat: 16.0, category: 'protein' },

  // 油脂调味
  { id: 'l_oil', name: '食用油', calories: 900, carbs: 0, protein: 0, fat: 100, category: 'fat' },
  { id: 'l_butter', name: '黄油', calories: 717, carbs: 0.1, protein: 0.9, fat: 81.1, category: 'fat' },
]

export function searchLocalFoods(query: string): LocalFood[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return LOCAL_FOODS.filter(f => f.name.toLowerCase().includes(q))
}
