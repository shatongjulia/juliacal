# JuliaCal 饮食热量追踪应用 - 设计文档

**日期：** 2026-03-20
**技术栈：** Next.js 15 (App Router) + Tailwind CSS 3 + Lucide React
**部署平台：** Vercel

---

## 1. 项目概述

JuliaCal 是一个响应式 Web 饮食热量追踪应用，支持手机（移动优先）和电脑端。用户通过拍照或搜索记录每日三餐和零食，追踪热量和宏量营养素摄入，并获得 211 饮食法则评估。

---

## 2. 整体架构

```
JuliaCal (Next.js App Router)
├── app/
│   ├── page.tsx                  # 仪表板（首页）
│   ├── search/page.tsx           # 食物搜索
│   ├── progress/page.tsx         # 进度统计
│   ├── profile/page.tsx          # 个人资料
│   ├── onboarding/page.tsx       # 首次使用引导页
│   └── api/
│       ├── analyze/route.ts      # Qwen3-VL-Plus 图片识别（仅服务端）
│       └���─ food/route.ts         # Open Food Facts 代理
├── components/
│   ├── BottomNav.tsx
│   ├── CircularProgress.tsx
│   ├── MealSection.tsx
│   ├── FoodCard.tsx
│   ├── MacroCard.tsx
│   └── ImageUpload.tsx
├── lib/
│   ├── storage.ts                # localStorage 读写封装（含版本迁移）
│   ├── calories.ts               # Mifflin-St Jeor 公式
│   ├── diet211.ts                # 211 评估逻辑
│   └── types.ts
└── .env.local                    # QWEN_API_KEY（仅服务端读取，不暴露给浏览器）
```

**注意：** 使用 Tailwind CSS **3.x**（非 4.x），与 Next.js 15 兼容性成熟。

---

## 3. 页面设计

### 3.1 引导页（首次使用）

首次打开应用时跳转到 `/onboarding`（`middleware.ts` 检查 `juliaCal_settings.onboardingComplete`，为 false 则重定向）。用户不可跳过。

**分步表单（5步）：**

| 步骤 | 收集内容 | 验证规则 |
|------|---------|---------|
| 1 | 姓名（可选） | 最长 20 字符 |
| 2 | 性别：男 / 女 | 必选 |
| 3 | 年龄（岁）、身高（cm）、体重（kg） | 年龄 1-120，身高 50-300，体重 1-500 |
| 4 | 活动水平（4选1） | 必选 |
| 5 | 目标（3选1）+ 推荐热量确认 | 热量最低 1000 kcal |

**活动系数：**
- 久坐（几乎不运动）：× 1.2
- 轻度运动（每周1-3天）：× 1.375
- 中度运动（每周3-5天）：× 1.55
- 高强度运动（每周6-7天）：× 1.725

**热量计算（Mifflin-St Jeor）：**
- 男：BMR = 10×体重 + 6.25×身高 - 5×年龄 + 5
- 女：BMR = 10×体重 + 6.25×身高 - 5×年龄 - 161
- TDEE = BMR × 活动系数
- 目标调整：减重 TDEE-500，维持 TDEE，增重 TDEE+300

宏量目标默认分配：碳水 50%、蛋白质 25%、脂肪 25%（按热量比例换算为克数）。

### 3.2 仪表板（首页）

- 顶部：用户头像（Lucide User 图标）+ 问候语（早上好/下午好/晚上好 + 姓名）+ 日期选择器
- 圆形进度条：已摄入 / 每日目标热量，颜色：< 80% 绿，80-100% 黄，> 100% 红
- 宏量营养素卡片：碳水、蛋白质、脂肪（已摄入g / 目标g）
- 今日餐食列表：早餐 / 午餐 / 晚餐 / 零食
  - 每个餐食显示热量小计 + 211 评估徽章（早/午/晚显示，零食不显示）
  - "+" 按钮：跳转搜索页（带 `?meal=breakfast` 参数）
  - "📷" 按钮：打开图片上传

### 3.3 搜索页

- 搜索框（防抖 300ms 后调用 `/api/food`）
- 分类筛选标签
- 食物卡片列表（名称、热量/100g）
- 空状态：显示"未找到相关食物，请尝试其他关键词"
- 食物详情页：营养成分表 + 份量输入（克，默认 100g）+ 选择餐食下拉 + 添加按钮

### 3.4 进度页

- **本周热量趋势**：折线图，周一至周日，每日实际摄入 vs 目标线
- **宏量达成率**：本周平均碳水/蛋白质/脂肪达成百分比（横向进度条）
- **211 达标统计**：本周每日早/午/晚三餐中达标餐数（如"今日 2/3 餐达标"）
- **连续记录天数**：streak 计数
- 历史数据范围：最近 30 天（localStorage 只保留 30 天）

### 3.5 ���人资料页

- 显示/编辑身体信息（触发重新计算推荐热量）
- 修改每日热量目标（最低 1000 kcal）
- 清除所有数据（二次确认弹窗）

---

## 4. 响应式设计

| 断点 | 布局 |
|------|------|
| < 768px（移动端） | 底部固定 Tab Bar，单列布局 |
| ≥ 768px（桌面端） | 左侧固定导航栏（宽 240px），内容区居中，最大宽度 800px |

---

## 5. 数据模型

```typescript
// lib/types.ts

export const STORAGE_VERSION = 1  // 升级时递增，触发迁移逻辑

export type FoodCategory = 'protein' | 'vegetable' | 'carb' | 'fat' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose' | 'maintain' | 'gain'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface UserSettings {
  version: number                  // STORAGE_VERSION
  name: string                     // 可为空字符串
  gender: 'male' | 'female'
  age: number                      // 整数，1-120
  height: number                   // cm，整数，50-300
  weight: number                   // kg，精确到0.1，1-500
  activityLevel: ActivityLevel
  goal: Goal
  dailyCalorieTarget: number       // kcal，最低 1000
  dailyCarbTarget: number          // 克
  dailyProteinTarget: number       // 克
  dailyFatTarget: number           // 克
  onboardingComplete: boolean
}

export interface DailyLog {
  date: string                     // "YYYY-MM-DD"
  meals: Record<MealType, MealEntry[]>
}

export interface MealEntry {
  id: string                       // crypto.randomUUID()
  name: string
  calories: number                 // kcal（按实际摄入量计算）
  carbs: number                    // 克（按实际摄入量）
  protein: number                  // 克（按实际摄入量）
  fat: number                      // 克（按实际摄入量）
  amount: number                   // 克（实际摄入重量，单位固定为克，用于 211 计算）
  foodCategory: FoodCategory       // 自动推断，用户可修改
  source: 'search' | 'camera'
  createdAt: string                // ISO 8601
}
```

**localStorage 键名：**
- `juliaCal_settings` — UserSettings JSON
- `juliaCal_log_YYYY-MM-DD` — DailyLog JSON
- `juliaCal_version` — 当前数据版本号

**版本迁移策略：**
- `storage.ts` 在每次读取时检查 `juliaCal_version`
- 若低于 `STORAGE_VERSION`，执行对应迁移函数（每个版本号对应一个 `migrate_v1_to_v2` 函数）
- 迁移策略：补充缺失字段默认值（非破坏性），不删除现有数据
- 若遇到无法迁移的破坏性变更（未来版本），清空数据并重新引导 onboarding，提示用户"应用已更新，需要重新设置"
- 当前版本 1 无需迁移逻辑，仅记录版本号

**数据清理：** 每次写入时检查并删除 30 天前的日志 key。

**并发写入：** 同一 tab 内操作是同步的，不存在并发问题；多 tab 场景不做特殊处理（低优先级边缘情况）。

---

## 6. API 设计

### 6.1 图片识别 `POST /api/analyze`

**安全：** QWEN_API_KEY 仅在 Next.js 服务端读取（`process.env.QWEN_API_KEY`），不暴露给浏览器。

**请求：**
```json
{
  "image": "data:image/jpeg;base64,/9j/..."
}
```
限制：仅接受 `image/jpeg`、`image/png`、`image/webp`，大小 ≤ 5MB（路由内校验 base64 长度）。

**响应 200：**
```json
{
  "foods": [
    {
      "name": "白米饭",
      "estimatedWeight": 200,
      "calories": 260,
      "carbs": 57.2,
      "protein": 4.8,
      "fat": 0.4,
      "category": "carb"
    }
  ]
}
```

**错误响应：**
| 状态码 | 含义 |
|--------|------|
| 400 | 图片格式不支持或超过大小限制 |
| 422 | 图片中未识别到食物 |
| 500 | Qwen API 调用失败 |

**Qwen 返回数据缺失处理：**
- 若某字段（calories/carbs/protein/fat）为 null 或缺失，该字段默认为 `0`
- 若 `estimatedWeight` 缺失，默认为 `100`（克）
- 若 `category` 缺失，使用 7.2 节自动推断规则计算
- 若整个 foods 数组为空或格式无法解析，返回 422

超时：30 秒（Vercel Hobby 函数限制）。

### 6.2 食物搜索 `GET /api/food`

**请求：**
```
GET /api/food?q=苹果&page=1&pageSize=20
```
`q` 为必填参数，缺失返回 400。

**响应 200：**
```json
{
  "products": [
    {
      "id": "off_3017620425035",
      "name": "苹果",
      "calories": 52,
      "carbs": 13.8,
      "protein": 0.3,
      "fat": 0.2,
      "imageUrl": "https://images.openfoodfacts.org/..."
    }
  ],
  "total": 45,
  "page": 1
}
```

Open Food Facts 字段映射：`energy-kcal_100g` → `calories`，`carbohydrates_100g` → `carbs`，`proteins_100g` → `protein`，`fat_100g` → `fat`。

**缓存：** 响应头设置 `Cache-Control: public, max-age=3600`，由 Vercel Edge Network 缓存（CDN 层），不依赖服务端内存。相同 URL 的请求在 1 小时内由边缘节点直接响应。

**错误响应：**
| 状态码 | 含义 |
|--------|------|
| 400 | 缺少 q 参数 |
| 503 | Open Food Facts 不可用 |

---

## 7. 211 饮食法则评估

### 7.1 规则

211 评估使用各 `MealEntry.amount`（克，固定单位）按 `foodCategory` 分组求和，计算各类别占该餐总重量的比例。此计算与 foodCategory 的推断方式（7.2节）完全独立——推断决定分类标签，211 评估只使用已确定的分类标签和 amount 字段。

对每餐（早/午/晚，不含零食）：

| 类别 | 条件（达标） |
|------|------------|
| 蛋白质（protein） | 占该餐总重量 ≥ 40% |
| 蔬菜（vegetable） | 占该餐总重量 ≥ 20% |
| 碳水（carb） | 占该餐总重量 10%–30% |

三项全部满足 → ✅ 达标；否则 → ⚠️ 显示具体不足项。

餐食条目 < 2 项时不显示评估。

### 7.2 foodCategory 自动推断（基于每100g营养素）

| 类别 | 推断规则 |
|------|---------|
| `protein` | 蛋白质 ≥ 15g/100g |
| `vegetable` | 热量 ≤ 50kcal/100g 且 碳水 ≤ 10g/100g |
| `carb` | 碳水 ≥ 40g/100g |
| `fat` | 脂肪 ≥ 20g/100g |
| `other` | 不符合以上任何条件 |

推断结果展示给用户，用户可在添加食物时手动修改分类。

---

## 8. 错误处理策略

| 场景 | 处理方式 |
|------|---------|
| 网络离线 | 展示 localStorage 缓存数据，顶部 Banner 提示"离线模式，数据仅显示本地记录"；禁用图片识别和食物搜索按钮 |
| Qwen API 失败（500） | Toast 提示"识别失败，请手动搜索食物" |
| 图片未识别到食物（422） | Toast 提示"未能识别食物，请手动搜索" |
| 图片超过 5MB | 上传前客户端校验，即时提示"图片过大，请压缩后重试" |
| Open Food Facts 无结果 | 空状态插图 + "未找到相关食物" |
| Open Food Facts 不可用（503） | Toast 提示"食物搜索暂时不可用" |
| localStorage QuotaExceededError | 捕获异常，提示"存储空间不足，将自动清理最早的记录"，删除最旧 7 天数据后重试 |

---

## 9. 设计规范

- **主色调：** `#22c55e`（绿色）、`#16a34a`（深绿）
- **中性色：** `#ffffff`、`#f9fafb`、`#6b7280`、`#111827`
- **圆角：** 卡片 `rounded-2xl`，按钮 `rounded-xl`
- **图标：** Lucide React（统一 24px）
- **字体：** 系统默认字体（`font-sans`）
- **动画：** `transition-all duration-200`

---

## 10. 环境变量

```bash
# .env.local（不提交到 git，加入 .gitignore）
QWEN_API_KEY=your_api_key_here
```

Vercel 部署：控制台 → Project Settings → Environment Variables 配置同名变量。

---

## 11. 技术依赖

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "tailwindcss": "^3.4.0",
  "lucide-react": "latest",
  "typescript": "^5.0.0"
}
```
