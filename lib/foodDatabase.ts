import { FoodCategory } from './types'

export interface LocalFood {
  id: string
  name: string
  calories: number   // per 100g
  carbs: number
  protein: number
  fat: number
  category: FoodCategory
  servingWeight: number  // 单份标准克数
}

export const LOCAL_FOODS: LocalFood[] = [
  // ===== 蛋类 =====
  { id: 'l_egg', name: '鸡蛋', calories: 144, carbs: 2.8, protein: 13.1, fat: 8.8, category: 'protein', servingWeight: 55 },
  { id: 'l_egg_white', name: '鸡蛋白', calories: 60, carbs: 0.7, protein: 11.6, fat: 0.1, category: 'protein', servingWeight: 33 },
  { id: 'l_egg_yolk', name: '鸡蛋黄', calories: 328, carbs: 3.1, protein: 15.2, fat: 28.2, category: 'fat', servingWeight: 17 },
  { id: 'l_duck_egg', name: '鸭蛋', calories: 180, carbs: 3.1, protein: 12.6, fat: 13.0, category: 'protein', servingWeight: 70 },

  // ===== 肉类 =====
  { id: 'l_chicken_breast', name: '鸡胸肉', calories: 133, carbs: 0, protein: 26.7, fat: 2.5, category: 'protein', servingWeight: 150 },
  { id: 'l_chicken_thigh', name: '鸡腿肉', calories: 181, carbs: 0, protein: 19.5, fat: 11.1, category: 'protein', servingWeight: 120 },
  { id: 'l_pork_lean', name: '猪瘦肉', calories: 143, carbs: 1.5, protein: 20.3, fat: 6.2, category: 'protein', servingWeight: 100 },
  { id: 'l_pork_fat', name: '猪五花肉', calories: 395, carbs: 2.4, protein: 14.6, fat: 37.0, category: 'fat', servingWeight: 100 },
  { id: 'l_beef', name: '牛肉（瘦）', calories: 106, carbs: 2.0, protein: 20.2, fat: 2.3, category: 'protein', servingWeight: 100 },
  { id: 'l_beef_fat', name: '牛肉（肥瘦）', calories: 250, carbs: 2.0, protein: 17.8, fat: 19.2, category: 'fat', servingWeight: 100 },
  { id: 'l_lamb', name: '羊肉', calories: 203, carbs: 0, protein: 19.0, fat: 14.1, category: 'protein', servingWeight: 100 },
  { id: 'l_pork_rib', name: '猪排骨', calories: 278, carbs: 0, protein: 18.3, fat: 22.0, category: 'protein', servingWeight: 200 },
  { id: 'l_bacon', name: '培根', calories: 541, carbs: 1.4, protein: 12.5, fat: 53.0, category: 'fat', servingWeight: 30 },
  { id: 'l_sausage', name: '火腿肠', calories: 250, carbs: 8.0, protein: 12.0, fat: 18.0, category: 'protein', servingWeight: 50 },
  { id: 'l_luncheon_meat', name: '午餐肉', calories: 300, carbs: 3.0, protein: 12.0, fat: 26.0, category: 'fat', servingWeight: 100 },

  // ===== 鱼虾海鲜 =====
  { id: 'l_salmon', name: '三文鱼', calories: 208, carbs: 0, protein: 20.0, fat: 13.0, category: 'protein', servingWeight: 120 },
  { id: 'l_tilapia', name: '罗非鱼', calories: 96, carbs: 0, protein: 20.1, fat: 1.7, category: 'protein', servingWeight: 150 },
  { id: 'l_shrimp', name: '虾', calories: 87, carbs: 2.8, protein: 16.8, fat: 0.6, category: 'protein', servingWeight: 100 },
  { id: 'l_tuna', name: '金枪鱼（罐头）', calories: 116, carbs: 0, protein: 25.5, fat: 1.0, category: 'protein', servingWeight: 100 },
  { id: 'l_cod', name: '鳕鱼', calories: 88, carbs: 0, protein: 20.4, fat: 0.5, category: 'protein', servingWeight: 150 },
  { id: 'l_crab', name: '螃蟹', calories: 95, carbs: 2.3, protein: 17.5, fat: 2.6, category: 'protein', servingWeight: 250 },

  // ===== 主食/碳水 =====
  { id: 'l_rice', name: '白米饭（熟）', calories: 116, carbs: 25.6, protein: 2.6, fat: 0.3, category: 'carb', servingWeight: 150 },
  { id: 'l_rice_raw', name: '大米（生）', calories: 346, carbs: 77.2, protein: 7.4, fat: 0.8, category: 'carb', servingWeight: 75 },
  { id: 'l_noodle', name: '面条（煮熟）', calories: 109, carbs: 22.7, protein: 3.3, fat: 0.5, category: 'carb', servingWeight: 200 },
  { id: 'l_bread', name: '白面包', calories: 265, carbs: 49.0, protein: 9.0, fat: 3.2, category: 'carb', servingWeight: 50 },
  { id: 'l_wholemeal_bread', name: '全麦面包', calories: 247, carbs: 41.0, protein: 10.7, fat: 4.1, category: 'carb', servingWeight: 50 },
  { id: 'l_potato', name: '土豆', calories: 81, carbs: 17.8, protein: 2.0, fat: 0.1, category: 'carb', servingWeight: 200 },
  { id: 'l_sweet_potato', name: '红薯', calories: 99, carbs: 23.1, protein: 1.4, fat: 0.1, category: 'carb', servingWeight: 200 },
  { id: 'l_corn', name: '玉米（甜）', calories: 86, carbs: 18.7, protein: 3.3, fat: 1.3, category: 'carb', servingWeight: 200 },
  { id: 'l_oat', name: '燕麦片', calories: 389, carbs: 66.3, protein: 16.9, fat: 6.9, category: 'carb', servingWeight: 40 },
  { id: 'l_tofu', name: '北豆腐', calories: 98, carbs: 4.2, protein: 12.2, fat: 4.8, category: 'protein', servingWeight: 200 },
  { id: 'l_tofu_soft', name: '嫩豆腐', calories: 50, carbs: 2.9, protein: 5.0, fat: 1.9, category: 'protein', servingWeight: 200 },
  { id: 'l_dumpling', name: '饺子（猪肉白菜）', calories: 240, carbs: 28.0, protein: 10.0, fat: 9.5, category: 'carb', servingWeight: 150 },
  { id: 'l_baozi', name: '包子（猪肉）', calories: 226, carbs: 31.0, protein: 9.8, fat: 7.2, category: 'carb', servingWeight: 100 },
  { id: 'l_mantou', name: '馒头', calories: 233, carbs: 48.3, protein: 7.0, fat: 1.1, category: 'carb', servingWeight: 100 },
  { id: 'l_wonton', name: '馄饨', calories: 170, carbs: 17.0, protein: 8.5, fat: 7.5, category: 'carb', servingWeight: 200 },
  { id: 'l_spring_roll', name: '春卷（炸）', calories: 280, carbs: 25.0, protein: 6.0, fat: 17.0, category: 'carb', servingWeight: 80 },
  { id: 'l_zongzi', name: '粽子', calories: 195, carbs: 35.0, protein: 5.5, fat: 4.0, category: 'carb', servingWeight: 150 },
  { id: 'l_instant_noodle', name: '方便面（泡熟）', calories: 440, carbs: 57.0, protein: 9.0, fat: 20.0, category: 'carb', servingWeight: 400 },
  { id: 'l_instant_rice_noodle', name: '米粉', calories: 109, carbs: 24.0, protein: 2.0, fat: 0.5, category: 'carb', servingWeight: 250 },
  { id: 'l_sushi', name: '寿司', calories: 140, carbs: 28.0, protein: 5.0, fat: 1.0, category: 'carb', servingWeight: 200 },
  { id: 'l_pizza', name: '披萨', calories: 266, carbs: 33.0, protein: 11.4, fat: 10.0, category: 'carb', servingWeight: 150 },
  { id: 'l_hamburger', name: '汉堡', calories: 256, carbs: 30.0, protein: 12.0, fat: 9.5, category: 'carb', servingWeight: 200 },
  { id: 'l_sandwich', name: '三明治', calories: 230, carbs: 28.0, protein: 10.0, fat: 9.0, category: 'carb', servingWeight: 150 },

  // ===== 蔬菜 =====
  { id: 'l_spinach', name: '菠菜', calories: 23, carbs: 3.6, protein: 2.6, fat: 0.3, category: 'vegetable', servingWeight: 100 },
  { id: 'l_broccoli', name: '西兰花', calories: 34, carbs: 6.6, protein: 2.8, fat: 0.4, category: 'vegetable', servingWeight: 100 },
  { id: 'l_cabbage', name: '卷心菜', calories: 25, carbs: 5.8, protein: 1.3, fat: 0.1, category: 'vegetable', servingWeight: 100 },
  { id: 'l_tomato', name: '西红柿', calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2, category: 'vegetable', servingWeight: 200 },
  { id: 'l_cucumber', name: '黄瓜', calories: 15, carbs: 3.6, protein: 0.7, fat: 0.1, category: 'vegetable', servingWeight: 100 },
  { id: 'l_carrot', name: '胡萝卜', calories: 41, carbs: 9.6, protein: 0.9, fat: 0.2, category: 'vegetable', servingWeight: 100 },
  { id: 'l_celery', name: '芹菜', calories: 16, carbs: 3.0, protein: 0.7, fat: 0.1, category: 'vegetable', servingWeight: 100 },
  { id: 'l_lettuce', name: '生菜', calories: 14, carbs: 2.9, protein: 1.4, fat: 0.2, category: 'vegetable', servingWeight: 80 },
  { id: 'l_mushroom', name: '香菇', calories: 26, carbs: 6.8, protein: 2.2, fat: 0.3, category: 'vegetable', servingWeight: 100 },
  { id: 'l_eggplant', name: '茄子', calories: 24, carbs: 5.9, protein: 1.1, fat: 0.2, category: 'vegetable', servingWeight: 200 },
  { id: 'l_pepper', name: '青椒', calories: 27, carbs: 5.4, protein: 1.0, fat: 0.3, category: 'vegetable', servingWeight: 100 },
  { id: 'l_onion', name: '洋葱', calories: 40, carbs: 9.3, protein: 1.1, fat: 0.1, category: 'vegetable', servingWeight: 150 },
  { id: 'l_garlic', name: '大蒜', calories: 149, carbs: 33.1, protein: 6.4, fat: 0.5, category: 'vegetable', servingWeight: 5 },
  { id: 'l_bean_sprout', name: '豆芽', calories: 30, carbs: 5.9, protein: 3.1, fat: 0.1, category: 'vegetable', servingWeight: 100 },
  { id: 'l_cabbage_cn', name: '大白菜', calories: 17, carbs: 3.2, protein: 1.5, fat: 0.1, category: 'vegetable', servingWeight: 100 },
  { id: 'l_bok_choy', name: '小白菜', calories: 15, carbs: 2.4, protein: 1.5, fat: 0.3, category: 'vegetable', servingWeight: 100 },
  { id: 'l_bitter_gourd', name: '苦瓜', calories: 19, carbs: 4.3, protein: 1.0, fat: 0.1, category: 'vegetable', servingWeight: 200 },
  { id: 'l_winter_melon', name: '冬瓜', calories: 11, carbs: 2.6, protein: 0.4, fat: 0.2, category: 'vegetable', servingWeight: 200 },
  { id: 'l_pumpkin', name: '南瓜', calories: 22, carbs: 5.3, protein: 0.7, fat: 0.1, category: 'vegetable', servingWeight: 200 },
  { id: 'l_cauliflower', name: '花菜', calories: 24, carbs: 4.6, protein: 2.4, fat: 0.2, category: 'vegetable', servingWeight: 120 },
  { id: 'l_kelp', name: '海带', calories: 12, carbs: 2.1, protein: 1.2, fat: 0.1, category: 'vegetable', servingWeight: 80 },

  // ===== 水果 =====
  { id: 'l_apple', name: '苹果', calories: 52, carbs: 13.8, protein: 0.3, fat: 0.2, category: 'other', servingWeight: 200 },
  { id: 'l_banana', name: '香蕉', calories: 93, carbs: 22.8, protein: 1.1, fat: 0.3, category: 'carb', servingWeight: 120 },
  { id: 'l_orange', name: '橙子', calories: 47, carbs: 11.8, protein: 0.9, fat: 0.1, category: 'other', servingWeight: 200 },
  { id: 'l_grape', name: '葡萄', calories: 69, carbs: 18.1, protein: 0.7, fat: 0.2, category: 'other', servingWeight: 200 },
  { id: 'l_watermelon', name: '西瓜', calories: 30, carbs: 7.6, protein: 0.6, fat: 0.2, category: 'vegetable', servingWeight: 300 },
  { id: 'l_strawberry', name: '草莓', calories: 32, carbs: 7.7, protein: 0.7, fat: 0.3, category: 'vegetable', servingWeight: 150 },
  { id: 'l_mango', name: '芒果', calories: 65, carbs: 17.0, protein: 0.5, fat: 0.3, category: 'carb', servingWeight: 200 },
  { id: 'l_kiwi', name: '猕猴桃', calories: 61, carbs: 14.7, protein: 1.1, fat: 0.5, category: 'other', servingWeight: 100 },
  { id: 'l_pear', name: '梨', calories: 50, carbs: 13.1, protein: 0.3, fat: 0.1, category: 'other', servingWeight: 200 },
  { id: 'l_pineapple', name: '菠萝', calories: 41, carbs: 10.8, protein: 0.5, fat: 0.1, category: 'other', servingWeight: 200 },
  { id: 'l_lemon', name: '柠檬', calories: 29, carbs: 9.3, protein: 1.1, fat: 0.3, category: 'other', servingWeight: 15 },
  { id: 'l_cherry', name: '樱桃', calories: 63, carbs: 16.0, protein: 1.1, fat: 0.2, category: 'other', servingWeight: 100 },
  { id: 'l_peach', name: '桃子', calories: 39, carbs: 9.5, protein: 0.9, fat: 0.3, category: 'other', servingWeight: 200 },
  { id: 'l_avocado', name: '牛油果', calories: 160, carbs: 8.5, protein: 2.0, fat: 14.7, category: 'fat', servingWeight: 100 },

  // ===== 奶制品 =====
  { id: 'l_milk', name: '牛奶（全脂）', calories: 61, carbs: 4.8, protein: 3.2, fat: 3.2, category: 'protein', servingWeight: 250 },
  { id: 'l_skim_milk', name: '脱脂牛奶', calories: 33, carbs: 4.9, protein: 3.4, fat: 0.1, category: 'protein', servingWeight: 250 },
  { id: 'l_yogurt', name: '酸奶（原味）', calories: 61, carbs: 5.7, protein: 3.5, fat: 3.1, category: 'protein', servingWeight: 200 },
  { id: 'l_cheese', name: '奶酪', calories: 402, carbs: 1.3, protein: 25.0, fat: 33.1, category: 'fat', servingWeight: 20 },

  // ===== 豆类/坚果 =====
  { id: 'l_peanut', name: '花生', calories: 567, carbs: 16.1, protein: 25.8, fat: 49.2, category: 'fat', servingWeight: 20 },
  { id: 'l_walnut', name: '核桃', calories: 654, carbs: 13.7, protein: 15.2, fat: 65.2, category: 'fat', servingWeight: 20 },
  { id: 'l_almond', name: '杏仁', calories: 579, carbs: 21.6, protein: 21.2, fat: 49.9, category: 'fat', servingWeight: 20 },
  { id: 'l_cashew', name: '腰果', calories: 553, carbs: 30.2, protein: 18.2, fat: 43.8, category: 'fat', servingWeight: 20 },
  { id: 'l_pistachio', name: '开心果', calories: 560, carbs: 27.2, protein: 20.2, fat: 45.3, category: 'fat', servingWeight: 20 },
  { id: 'l_soybean', name: '黄豆', calories: 446, carbs: 30.2, protein: 35.1, fat: 16.0, category: 'protein', servingWeight: 30 },
  { id: 'l_edamame', name: '毛豆', calories: 147, carbs: 10.4, protein: 12.9, fat: 6.5, category: 'protein', servingWeight: 100 },
  { id: 'l_soy_milk', name: '豆浆', calories: 30, carbs: 2.4, protein: 3.0, fat: 1.0, category: 'protein', servingWeight: 300 },

  // ===== 中式菜肴（食堂/家常）=====
  { id: 'l_braised_pork', name: '红烧肉', calories: 305, carbs: 10.5, protein: 11.6, fat: 23.5, category: 'protein', servingWeight: 150 },
  { id: 'l_sweet_sour_pork', name: '糖醋里脊', calories: 260, carbs: 28.0, protein: 14.2, fat: 10.5, category: 'protein', servingWeight: 150 },
  { id: 'l_kung_pao_chicken', name: '宫保鸡丁', calories: 190, carbs: 8.5, protein: 16.2, fat: 10.3, category: 'protein', servingWeight: 150 },
  { id: 'l_scrambled_egg_tomato', name: '西红柿炒鸡蛋', calories: 95, carbs: 6.3, protein: 5.5, fat: 5.2, category: 'protein', servingWeight: 180 },
  { id: 'l_mapo_tofu', name: '麻婆豆腐', calories: 108, carbs: 5.2, protein: 8.5, fat: 6.0, category: 'protein', servingWeight: 180 },
  { id: 'l_stir_fried_cabbage', name: '手撕包菜', calories: 55, carbs: 7.0, protein: 2.0, fat: 2.5, category: 'vegetable', servingWeight: 150 },
  { id: 'l_garlic_bok_choy', name: '蒜蓉青菜', calories: 35, carbs: 4.0, protein: 2.5, fat: 1.5, category: 'vegetable', servingWeight: 120 },
  { id: 'l_vinegar_shredded_potato', name: '醋溜土豆丝', calories: 90, carbs: 19.0, protein: 2.2, fat: 1.0, category: 'carb', servingWeight: 150 },
  { id: 'l_fish_fragrant_eggplant', name: '鱼香茄子', calories: 120, carbs: 12.0, protein: 3.5, fat: 7.0, category: 'vegetable', servingWeight: 150 },
  { id: 'l_fried_rice', name: '蛋炒饭', calories: 188, carbs: 28.0, protein: 6.5, fat: 5.5, category: 'carb', servingWeight: 250 },
  { id: 'l_fried_noodle', name: '炒面', calories: 175, carbs: 26.0, protein: 7.0, fat: 5.0, category: 'carb', servingWeight: 250 },
  { id: 'l_braised_chicken', name: '黄焖鸡', calories: 170, carbs: 4.0, protein: 18.5, fat: 9.0, category: 'protein', servingWeight: 250 },
  { id: 'l_twice_cooked_pork', name: '回锅肉', calories: 280, carbs: 6.0, protein: 13.0, fat: 22.0, category: 'protein', servingWeight: 150 },
  { id: 'l_meatball', name: '红烧狮子头', calories: 240, carbs: 8.0, protein: 12.5, fat: 17.5, category: 'protein', servingWeight: 120 },
  { id: 'l_steamed_egg', name: '蒸水蛋', calories: 65, carbs: 2.0, protein: 6.0, fat: 3.5, category: 'protein', servingWeight: 120 },
  { id: 'l_stir_fry_green_beans', name: '干煸四季豆', calories: 95, carbs: 10.0, protein: 3.5, fat: 5.0, category: 'vegetable', servingWeight: 130 },
  { id: 'l_braised_ribs', name: '红烧排骨', calories: 260, carbs: 5.0, protein: 15.0, fat: 20.0, category: 'protein', servingWeight: 200 },
  { id: 'l_soy_sauce_chicken', name: '酱油鸡', calories: 185, carbs: 2.0, protein: 22.0, fat: 10.0, category: 'protein', servingWeight: 150 },
  { id: 'l_stir_fried_beef', name: '青椒牛肉', calories: 145, carbs: 6.0, protein: 16.5, fat: 6.5, category: 'protein', servingWeight: 150 },
  { id: 'l_hot_sour_soup', name: '酸辣汤', calories: 35, carbs: 5.0, protein: 2.0, fat: 1.0, category: 'vegetable', servingWeight: 300 },
  { id: 'l_congee', name: '白粥', calories: 46, carbs: 9.7, protein: 1.1, fat: 0.1, category: 'carb', servingWeight: 300 },
  { id: 'l_salted_duck_egg', name: '咸鸭蛋', calories: 190, carbs: 3.0, protein: 12.7, fat: 13.5, category: 'protein', servingWeight: 60 },
  { id: 'l_braised_fish', name: '红烧鱼', calories: 140, carbs: 3.0, protein: 16.0, fat: 7.0, category: 'protein', servingWeight: 200 },
  { id: 'l_steamed_fish', name: '清蒸鱼', calories: 105, carbs: 0.5, protein: 18.0, fat: 3.5, category: 'protein', servingWeight: 200 },
  { id: 'l_cola_chicken_wings', name: '可乐鸡翅', calories: 220, carbs: 12.0, protein: 16.0, fat: 12.5, category: 'protein', servingWeight: 180 },
  { id: 'l_salted_fried_chicken', name: '盐酥鸡', calories: 260, carbs: 16.0, protein: 18.0, fat: 14.0, category: 'protein', servingWeight: 150 },
  { id: 'l_dry_fried_cauliflower', name: '干锅花菜', calories: 65, carbs: 6.0, protein: 3.5, fat: 3.0, category: 'vegetable', servingWeight: 150 },
  { id: 'l_chive_egg', name: '韭菜炒鸡蛋', calories: 100, carbs: 4.0, protein: 7.5, fat: 6.0, category: 'protein', servingWeight: 150 },
  { id: 'l_cumin_lamb', name: '孜然羊肉', calories: 210, carbs: 2.0, protein: 18.0, fat: 14.0, category: 'protein', servingWeight: 150 },
  { id: 'l_sweet_sour_fish', name: '糖醋鱼', calories: 170, carbs: 15.0, protein: 13.0, fat: 7.0, category: 'protein', servingWeight: 180 },

  // ===== 饮品 =====
  { id: 'l_bubble_tea', name: '珍珠奶茶', calories: 70, carbs: 11.0, protein: 1.5, fat: 2.5, category: 'other', servingWeight: 500 },
  { id: 'l_milk_tea', name: '奶茶', calories: 55, carbs: 8.5, protein: 1.3, fat: 1.8, category: 'other', servingWeight: 400 },
  { id: 'l_coffee_black', name: '黑咖啡', calories: 1, carbs: 0, protein: 0.1, fat: 0, category: 'other', servingWeight: 300 },
  { id: 'l_latte', name: '拿铁（加奶）', calories: 45, carbs: 3.8, protein: 2.5, fat: 2.2, category: 'other', servingWeight: 350 },
  { id: 'l_cappuccino', name: '卡布奇诺', calories: 40, carbs: 3.5, protein: 2.2, fat: 1.8, category: 'other', servingWeight: 350 },
  { id: 'l_cola', name: '可乐', calories: 42, carbs: 10.6, protein: 0, fat: 0, category: 'other', servingWeight: 330 },
  { id: 'l_sprite', name: '雪碧', calories: 40, carbs: 10.0, protein: 0, fat: 0, category: 'other', servingWeight: 330 },
  { id: 'l_orange_juice', name: '橙汁', calories: 45, carbs: 10.4, protein: 0.7, fat: 0.2, category: 'other', servingWeight: 300 },
  { id: 'l_apple_juice', name: '苹果汁', calories: 46, carbs: 11.3, protein: 0.1, fat: 0.1, category: 'other', servingWeight: 300 },
  { id: 'l_lemon_tea', name: '柠檬茶', calories: 36, carbs: 8.9, protein: 0.1, fat: 0, category: 'other', servingWeight: 400 },
  { id: 'l_green_tea', name: '绿茶', calories: 0, carbs: 0, protein: 0, fat: 0, category: 'other', servingWeight: 300 },
  { id: 'l_sports_drink', name: '运动饮料', calories: 26, carbs: 6.4, protein: 0, fat: 0, category: 'other', servingWeight: 500 },
  { id: 'l_beer', name: '啤酒', calories: 43, carbs: 3.6, protein: 0.5, fat: 0, category: 'other', servingWeight: 500 },
  { id: 'l_coconut_water', name: '椰子水', calories: 19, carbs: 4.3, protein: 0.2, fat: 0.1, category: 'other', servingWeight: 330 },

  // ===== 零食/甜品 =====
  { id: 'l_chips', name: '薯片', calories: 536, carbs: 53.0, protein: 7.0, fat: 33.0, category: 'fat', servingWeight: 30 },
  { id: 'l_cookie', name: '饼干', calories: 480, carbs: 68.0, protein: 7.5, fat: 20.0, category: 'other', servingWeight: 30 },
  { id: 'l_chocolate', name: '巧克力', calories: 546, carbs: 60.0, protein: 5.0, fat: 32.0, category: 'fat', servingWeight: 30 },
  { id: 'l_ice_cream', name: '冰淇淋', calories: 207, carbs: 24.0, protein: 3.5, fat: 11.0, category: 'other', servingWeight: 100 },
  { id: 'l_cake', name: '蛋糕（奶油）', calories: 380, carbs: 55.0, protein: 6.0, fat: 16.0, category: 'other', servingWeight: 80 },
  { id: 'l_candy', name: '糖果', calories: 387, carbs: 98.0, protein: 0, fat: 0.2, category: 'other', servingWeight: 10 },
  { id: 'l_jerky', name: '牛肉干', calories: 320, carbs: 16.0, protein: 45.0, fat: 8.0, category: 'protein', servingWeight: 30 },
  { id: 'l_squid_shred', name: '鱿鱼丝', calories: 280, carbs: 12.0, protein: 38.0, fat: 7.0, category: 'protein', servingWeight: 30 },
  { id: 'l_red_bean_paste', name: '红豆沙', calories: 240, carbs: 53.0, protein: 5.5, fat: 0.5, category: 'carb', servingWeight: 50 },
  { id: 'l_mochi', name: '麻薯', calories: 245, carbs: 50.0, protein: 3.5, fat: 3.0, category: 'carb', servingWeight: 60 },
  { id: 'l_egg_tart', name: '蛋挞', calories: 300, carbs: 30.0, protein: 6.0, fat: 17.0, category: 'other', servingWeight: 60 },
  { id: 'l_mooncake', name: '月饼', calories: 420, carbs: 55.0, protein: 7.0, fat: 20.0, category: 'other', servingWeight: 80 },
  { id: 'l_pocky', name: '百奇/饼干棒', calories: 490, carbs: 65.0, protein: 8.0, fat: 22.0, category: 'other', servingWeight: 30 },
  { id: 'l_pudding', name: '布丁', calories: 130, carbs: 20.0, protein: 3.0, fat: 4.0, category: 'other', servingWeight: 100 },
  { id: 'l_french_fries', name: '炸薯条', calories: 312, carbs: 41.0, protein: 3.4, fat: 15.0, category: 'carb', servingWeight: 100 },
  { id: 'l_popcorn', name: '爆米花', calories: 387, carbs: 78.0, protein: 12.0, fat: 4.0, category: 'carb', servingWeight: 50 },
  { id: 'l_sunflower_seeds', name: '瓜子', calories: 560, carbs: 13.0, protein: 22.0, fat: 49.0, category: 'fat', servingWeight: 30 },
  { id: 'l_dried_fruit', name: '葡萄干', calories: 299, carbs: 79.0, protein: 3.0, fat: 0.5, category: 'carb', servingWeight: 30 },

  // ===== 酱料/调味 =====
  { id: 'l_oil', name: '食用油', calories: 900, carbs: 0, protein: 0, fat: 100, category: 'fat', servingWeight: 10 },
  { id: 'l_butter', name: '黄油', calories: 717, carbs: 0.1, protein: 0.9, fat: 81.1, category: 'fat', servingWeight: 10 },
  { id: 'l_mayonnaise', name: '蛋黄酱', calories: 680, carbs: 3.0, protein: 1.0, fat: 74.0, category: 'fat', servingWeight: 15 },
  { id: 'l_ketchup', name: '番茄酱', calories: 29, carbs: 5.9, protein: 1.4, fat: 0.1, category: 'other', servingWeight: 20 },
  { id: 'l_salad_dressing', name: '沙拉酱', calories: 540, carbs: 8.0, protein: 1.5, fat: 56.0, category: 'fat', servingWeight: 20 },
  { id: 'l_sesame_paste', name: '芝麻酱', calories: 620, carbs: 17.0, protein: 19.0, fat: 53.0, category: 'fat', servingWeight: 15 },
  { id: 'l_chili_oil', name: '辣椒油', calories: 860, carbs: 3.0, protein: 0.5, fat: 93.0, category: 'fat', servingWeight: 5 },
  { id: 'l_soy_sauce', name: '酱油', calories: 53, carbs: 5.6, protein: 8.0, fat: 0.1, category: 'other', servingWeight: 10 },
  { id: 'l_vinegar', name: '醋', calories: 21, carbs: 2.7, protein: 0.4, fat: 0, category: 'other', servingWeight: 10 },
  { id: 'l_sugar', name: '白糖', calories: 387, carbs: 100, protein: 0, fat: 0, category: 'other', servingWeight: 5 },
  { id: 'l_honey', name: '蜂蜜', calories: 304, carbs: 82.4, protein: 0.3, fat: 0, category: 'other', servingWeight: 10 },
]

export function searchLocalFoods(query: string): LocalFood[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return LOCAL_FOODS.filter(f => f.name.toLowerCase().includes(q))
}
