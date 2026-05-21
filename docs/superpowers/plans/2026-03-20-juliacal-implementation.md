# JuliaCal 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 JuliaCal 饮食热量追踪 Web 应用，支持移动端和桌面端，集成 Qwen3-VL-Plus 图片识别

**Architecture:** Next.js 15 App Router + Tailwind CSS 3 + TypeScript，数据持久化用 localStorage，图片识别通过服务端 API 路由调用 Qwen3-VL-Plus，食物搜索代理 Open Food Facts API

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 3.4, Lucide React, @dashboardjs/react（进度条用 SVG 手写）

**Spec:** `D:\Juliacode\calorie\docs\superpowers\specs\2026-03-20-juliacal-design.md`

---

## 文件结构

```
D:\Juliacode\calorie\
├── app/
│   ├── layout.tsx                # Root layout，含 BottomNav/侧边栏
│   ├── page.tsx                  # 仪表板（首页）
│   ├── globals.css               # Tailwind directives
│   ├── search/
│   │   └── page.tsx              # 食物搜索 + 详情
│   ├── progress/
│   │   └── page.tsx              # 进度统计
│   ├── profile/
│   │   └── page.tsx              # 个人资料
│   ├── onboarding/
│   │   └── page.tsx              # 引导页（5步）
│   └── api/
│       ├── analyze/
│       │   └── route.ts          # Qwen3-VL-Plus 图片识别
│       └── food/
│           └── route.ts          # Open Food Facts 代理
├── components/
│   ├── BottomNav.tsx             # 底部/侧边导航
│   ├── CircularProgress.tsx      # SVG 圆形进度条
│   ├── MealSection.tsx           # 餐食区块（含211徽章）
│   ├── FoodCard.tsx              # 食物卡片
│   ├── MacroCard.tsx             # 宏量营养素卡片
│   └── ImageUpload.tsx           # 图片上传组件
├── lib/
│   ├── types.ts                  # 所有 TypeScript 类型
│   ├── storage.ts                # localStorage 读写（含版本迁移）
│   ├── calories.ts               # Mifflin-St Jeor 公式
│   └── diet211.ts                # 211 饮食评估逻辑
├── middleware.ts                  # onboarding 重定向检查
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                    # QWEN_API_KEY
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `app/globals.css`, `.env.local`, `.gitignore`

- [ ] **Step 1:** 在 `D:\Juliacode\calorie` 目录运行 `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm`（选项：不用 ESLint, 不用 src/, 用 App Router, 不用 Turbopack）
- [ ] **Step 2:** 验证 `package.json` 包含 next 15, react 19
- [ ] **Step 3:** 安装额外依赖：`npm install lucide-react`
- [ ] **Step 4:** 确认 `tailwind.config.ts` 使用 v3 语法（有 `content` 数组，无 `@import "tailwindcss"`）
- [ ] **Step 5:** 创建 `.env.local`，内容：`QWEN_API_KEY=your_api_key_here`
- [ ] **Step 6:** 初始化 git，首次提交：`git init && git add . && git commit -m "chore: scaffold Next.js 15 project"`

---

## Task 2: 核心类型与工具函数

**Files:**
- Create: `lib/types.ts`, `lib/storage.ts`, `lib/calories.ts`, `lib/diet211.ts`

- [ ] **Step 1:** 创建 `lib/types.ts`，内容完全按 spec 第5节

```typescript
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
```

- [ ] **Step 2:** 创建 `lib/calories.ts`：Mifflin-St Jeor 公式 + TDEE + 目标调整 + 宏量分配

```typescript
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
    carbs: Math.round((dailyCalories * 0.5) / 4),
    protein: Math.round((dailyCalories * 0.25) / 4),
    fat: Math.round((dailyCalories * 0.25) / 9),
  }
}

export function buildUserTargets(settings: Pick<UserSettings, 'gender' | 'weight' | 'height' | 'age' | 'activityLevel' | 'goal'>) {
  const bmr = calculateBMR(settings.gender, settings.weight, settings.height, settings.age)
  const tdee = calculateTDEE(bmr, settings.activityLevel)
  const dailyCalorieTarget = calculateDailyTarget(tdee, settings.goal)
  const macros = calculateMacros(dailyCalorieTarget)
  return { dailyCalorieTarget, ...macros }
}
```

- [ ] **Step 3:** 创建 `lib/diet211.ts`：211 评估逻辑

```typescript
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
```

- [ ] **Step 4:** 创建 `lib/storage.ts`：localStorage 封装，含版本迁移、30天清理、QuotaExceededError 处理

```typescript
import { STORAGE_VERSION, UserSettings, DailyLog, MealType } from './types'

const SETTINGS_KEY = 'juliaCal_settings'
const VERSION_KEY = 'juliaCal_version'

const EMPTY_DAILY_LOG = (): DailyLog['meals'] => ({
  breakfast: [], lunch: [], dinner: [], snack: []
})

// 版本迁移（当前v1无需迁移逻辑）
function migrateIfNeeded() {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(VERSION_KEY)
  if (!stored) {
    localStorage.setItem(VERSION_KEY, String(STORAGE_VERSION))
  }
}

export function getSettings(): UserSettings | null {
  if (typeof window === 'undefined') return null
  migrateIfNeeded()
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  safeSetItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getDailyLog(date: string): DailyLog {
  if (typeof window === 'undefined') return { date, meals: EMPTY_DAILY_LOG() }
  try {
    const raw = localStorage.getItem(`juliaCal_log_${date}`)
    return raw ? JSON.parse(raw) : { date, meals: EMPTY_DAILY_LOG() }
  } catch {
    return { date, meals: EMPTY_DAILY_LOG() }
  }
}

export function saveDailyLog(log: DailyLog): void {
  if (typeof window === 'undefined') return
  cleanOldLogs()
  safeSetItem(`juliaCal_log_${log.date}`, JSON.stringify(log))
}

function cleanOldLogs() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  Object.keys(localStorage)
    .filter(k => k.startsWith('juliaCal_log_') && k.slice('juliaCal_log_'.length) < cutoffStr)
    .forEach(k => localStorage.removeItem(k))
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // 删除最旧7天
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('juliaCal_log_'))
        .sort()
      keys.slice(0, 7).forEach(k => localStorage.removeItem(k))
      try { localStorage.setItem(key, value) } catch {}
    }
  }
}

export function getRecentLogs(days: number): DailyLog[] {
  const logs: DailyLog[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    logs.push(getDailyLog(date))
  }
  return logs.reverse()
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.keys(localStorage)
    .filter(k => k.startsWith('juliaCal_'))
    .forEach(k => localStorage.removeItem(k))
}
```

- [ ] **Step 5:** 运行 `npx tsc --noEmit` 验证类型无错误
- [ ] **Step 6:** `git add lib/ && git commit -m "feat: add core types, storage, calories, 211 logic"`

---

## Task 3: API 路由

**Files:**
- Create: `app/api/analyze/route.ts`, `app/api/food/route.ts`

- [ ] **Step 1:** 创建 `app/api/analyze/route.ts`：调用 Qwen3-VL-Plus API

  关键点：
  - 仅接受 image/jpeg, image/png, image/webp，base64 长度 ≤ 5MB
  - 调用阿里云 DashScope API（兼容 OpenAI 格式）
  - endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
  - 解析响应，缺失字段补0，category 缺失用 inferFoodCategory
  - 返回 400/422/500 错误码

- [ ] **Step 2:** 创建 `app/api/food/route.ts`：代理 Open Food Facts API

  关键点：
  - GET ?q=...&page=1&pageSize=20，q 必填
  - Open Food Facts URL: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}&json=1&page=${page}&page_size=${pageSize}&fields=id,product_name,nutriments,image_front_url`
  - 字段映射：energy-kcal_100g → calories，carbohydrates_100g → carbs，proteins_100g → protein，fat_100g → fat
  - 响应头：`Cache-Control: public, max-age=3600`

- [ ] **Step 3:** 运行 `npx tsc --noEmit` 验证无错误
- [ ] **Step 4:** `git add app/api/ && git commit -m "feat: add analyze and food API routes"`

---

## Task 4: UI 基础组件

**Files:**
- Create: `components/CircularProgress.tsx`, `components/MacroCard.tsx`, `components/FoodCard.tsx`, `components/BottomNav.tsx`

- [ ] **Step 1:** 创建 `components/CircularProgress.tsx`：SVG 圆形进度条

  Props: `{ current: number, target: number, size?: number }`
  颜色规则：< 80% 绿色 `#22c55e`，80-100% 黄色 `#f59e0b`，> 100% 红色 `#ef4444`
  中心显示：已摄入 kcal + "/" + 目标 kcal

- [ ] **Step 2:** 创建 `components/MacroCard.tsx`：宏量营养素卡片

  Props: `{ label: string, current: number, target: number, unit?: string, color?: string }`
  显示进度条（线性）

- [ ] **Step 3:** 创建 `components/FoodCard.tsx`：食物卡片

  Props: `{ name: string, calories: number, carbs?: number, protein?: number, fat?: number, onClick?: () => void }`

- [ ] **Step 4:** 创建 `components/BottomNav.tsx`：导航栏

  移动端：底部固定 tab bar（图标+文字）
  桌面端（≥ 768px）：左侧固定导航栏（240px 宽）
  页面：仪表板(/), 搜索(/search), 进度(/progress), 个人资料(/profile)
  使用 Lucide 图标：Home, Search, BarChart2, User

- [ ] **Step 5:** `npx tsc --noEmit` 确认无错误
- [ ] **Step 6:** `git add components/ && git commit -m "feat: add CircularProgress, MacroCard, FoodCard, BottomNav components"`

---

## Task 5: 剩余组件 + Root Layout

**Files:**
- Create: `components/MealSection.tsx`, `components/ImageUpload.tsx`, `app/layout.tsx`

- [ ] **Step 1:** 创建 `components/ImageUpload.tsx`：图片上传

  Props: `{ onResult: (foods: AnalyzedFood[]) => void, onError: (msg: string) => void, disabled?: boolean }`
  - 客户端校验：仅接受 jpeg/png/webp，≤ 5MB
  - 将图片转 base64，POST 到 /api/analyze
  - loading 状态显示"识别中..."
  - AnalyzedFood 类型定义在组件文件内或 types.ts

- [ ] **Step 2:** 创建 `components/MealSection.tsx`：餐食区块

  Props: `{ mealType: MealType, entries: MealEntry[], date: string, onUpdate: () => void }`
  - 显示餐食名称（早餐/午餐/晚餐/零食）
  - 热量小计
  - 早/午/晚：显示 211 评估徽章（来自 evaluate211）
  - "+" 按钮跳转 /search?meal=mealType&date=date
  - "📷" 按钮触发 ImageUpload
  - 每个食物条目：名称 + 热量 + 删除按钮

- [ ] **Step 3:** 创建 `app/layout.tsx`：Root layout

  - 导入 globals.css
  - 渲染 BottomNav + `{children}`
  - 移动端 padding-bottom: 64px（为底部 tab bar 留空间）
  - 桌面端 margin-left: 240px

- [ ] **Step 4:** `npx tsc --noEmit` 确认无错��
- [ ] **Step 5:** `git add components/MealSection.tsx components/ImageUpload.tsx app/layout.tsx && git commit -m "feat: add MealSection, ImageUpload, root layout"`

---

## Task 6: Onboarding 引导页 + middleware

**Files:**
- Create: `app/onboarding/page.tsx`, `middleware.ts`

- [ ] **Step 1:** 创建 `middleware.ts`

  检查 `juliaCal_settings` 中 `onboardingComplete`：
  - 仅在 server 侧读取 cookie 无法读 localStorage，所以 middleware 检查 cookie `juliaCal_onboarding_complete`
  - 若 cookie 不存在或为 false，且路径不是 /onboarding，则重定向到 /onboarding
  - 跳过 /api/*, /_next/*, /favicon.ico

- [ ] **Step 2:** 修改 `lib/storage.ts`，在 `saveSettings` 时同步设置 cookie：
  `document.cookie = 'juliaCal_onboarding_complete=true; path=/; max-age=31536000'`
  在 `clearAllData` 时清除该 cookie。

- [ ] **Step 3:** 创建 `app/onboarding/page.tsx`：5步引导表单

  步骤1：姓名（可选，max 20字符）
  步骤2：性别（男/女）
  步骤3：年龄、身高、体重（验证规则按 spec）
  步骤4：活动水平（4选1）
  步骤5：目标（3选1）+ 推荐热量展示 + 确认

  完成后：saveSettings(…) → router.push('/')

- [ ] **Step 4:** `npx next build` 验证构建无错误（可能有类型错误需修复）
- [ ] **Step 5:** `git add app/onboarding/ middleware.ts lib/storage.ts && git commit -m "feat: add onboarding flow and middleware redirect"`

---

## Task 7: 仪表板首页

**Files:**
- Modify: `app/page.tsx`（替换默认内容）

- [ ] **Step 1:** 创建 `app/page.tsx`：仪表板

  'use client'
  - 顶部：Lucide User 图标 + 问候语（早上好/下午好/晚上好 + settings.name）+ 日期选择器
  - CircularProgress：当日已摄入 / dailyCalorieTarget
  - 3个 MacroCard：碳水、蛋白质、脂肪
  - 4个 MealSection：breakfast, lunch, dinner, snack
  - 离线检测：`navigator.onLine` + 顶部 Banner

- [ ] **Step 2:** `npx next build` 验证无错误
- [ ] **Step 3:** `git add app/page.tsx && git commit -m "feat: implement dashboard page"`

---

## Task 8: 搜索页

**Files:**
- Create: `app/search/page.tsx`

- [ ] **Step 1:** 创建 `app/search/page.tsx`：食物搜索

  'use client'
  - 读取 query params: meal, date
  - 搜索框（防抖 300ms）
  - 调用 /api/food?q=...&page=1&pageSize=20
  - 食物卡片列表（FoodCard）
  - 点击食物卡片 → 展开详情（内联，非跳转）：
    - 营养成分展示（per 100g）
    - 份量输入（克，默认 100g）
    - foodCategory 下拉（可��改推断结果）
    - 选择餐食下拉（默认为 URL 参数中的 meal）
    - 添加按钮 → saveDailyLog → router.back()
  - 空状态："未找到相关食物，请尝试其他关键词"
  - 503 错误：Toast "食物搜索暂时不可用"

- [ ] **Step 2:** `npx next build` 验证无错误
- [ ] **Step 3:** `git add app/search/ && git commit -m "feat: implement food search page"`

---

## Task 9: 进度页 + 个人资料页

**Files:**
- Create: `app/progress/page.tsx`, `app/profile/page.tsx`

- [ ] **Step 1:** 创建 `app/progress/page.tsx`

  'use client'，读取最近30天 logs
  - 本周热量趋势：SVG 折线图（周一到周日，实际值 vs 目标线）
  - 宏量达成率：本周平均碳水/蛋白质/脂肪达成百分比（横向进度条）
  - 211 达标统计：本周每日三餐达标餐数
  - 连续记录天数（streak）

- [ ] **Step 2:** 创建 `app/profile/page.tsx`

  'use client'
  - 显示/编辑身体信息（触发重新计算推荐热量）
  - 手动修改每日热量目标（最低 1000）
  - 清除所有数据（二次确认 window.confirm 或内联对话框）

- [ ] **Step 3:** `npx next build` 确认整个项目构建成功
- [ ] **Step 4:** `git add app/progress/ app/profile/ && git commit -m "feat: implement progress and profile pages"`

---

## 最终验证

- [ ] `npm run dev` 启动，访问 http://localhost:3000
- [ ] 完整走通 onboarding 5步
- [ ] 仪表板正常显示
- [ ] 添加食物（搜索方式）正常
- [ ] 拍照识别（需配置真实 QWEN_API_KEY）
- [ ] 进度页数据正常
- [ ] 个人资料页编辑正常
- [ ] 桌面端（>768px）布局正常
