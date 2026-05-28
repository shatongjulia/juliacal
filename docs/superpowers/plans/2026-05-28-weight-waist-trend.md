# 体重 & 腰围趋势图 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在资料页增加腰围字段，每次保存时自动记录体重/腰围历史；在进度页用 SVG 折线图展示两项趋势。

**Architecture:** 体重和腰围的历史数据存在 `UserSettings` 中（`weightHistory` / `waistHistory` 数组），每次资料页保存时自动追加（同一天覆盖）。进度页从 `getSettings()` 读取历史数组，用 SVG `<polyline>` 渲染折线图。复用性方面，两个趋势图结构相同，抽一个内部 `TrendLine` 组件。

**Tech Stack:** Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 3 + SVG（无额外图表库）

---

### Task 1: 扩展类型定义

**Files:**
- Modify: `lib/types.ts:9-25`

- [ ] **Step 1: 给 UserSettings 加 waist、weightHistory、waistHistory**

`lib/types.ts` 第 9 行 `UserSettings` 接口中新增三个字段。定位到 `weight: number` 之后插入 `waist`，在接口末尾的 `onboardingComplete` 之前插入两个 history 数组：

```ts
export interface UserSettings {
  version: number
  name: string
  gender: 'male' | 'female'
  age: number
  height: number
  weight: number
  waist: number                          // 新增：当前腰围 (cm)
  activityLevel: ActivityLevel
  goal: Goal
  dietMode: DietMode
  dailyCalorieTarget: number
  dailyCarbTarget: number
  dailyProteinTarget: number
  dailyFatTarget: number
  dailyWaterTarget: number
  weightHistory: { date: string; value: number }[]   // 新增
  waistHistory: { date: string; value: number }[]    // 新增
  onboardingComplete: boolean
}
```

- [ ] **Step 2: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

预期：可能有其他文件引用 `UserSettings` 缺少新字段导致报错（如 storage.ts 的初始化、onboarding 页、profile 页等），逐一修复。

---

### Task 2: 资料页增加腰围字段

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: 在"基本信息"区域加入腰围输入**

在三个 `(['age', 'height', 'weight'] as const).map(...)` 循环后面（约第 172 行 `})` 闭合后），新增腰围 Field：

```tsx
<Field label="腰围（cm）">
  {editing ? (
    <input
      type="number"
      value={String(form.waist || '')}
      step="0.1"
      onChange={e => setForm(f => ({ ...f, waist: e.target.value }))}
      className="input-field"
    />
  ) : (
    <span>{settings.waist ? `${settings.waist} cm` : '未设置'}</span>
  )}
</Field>
```

- [ ] **Step 2: 在 handleSave 中加腰围校验**

在 `handleSave` 函数内，`const weight = Number(form.weight)` 下面加一行：

```ts
const waist = Number(form.waist)
```

校验区 `if (!weight || weight < 1 || weight > 500)` 下面加：

```ts
if (form.waist !== undefined && form.waist !== '' && (waist < 40 || waist > 200)) newErrors.waist = '腰围 40-200 cm'
```

腰围是可选的（不强制填写），但填了就要在合理范围内。

- [ ] **Step 3: 在 handleSave 中实现历史记录逻辑**

找到 `handleSave` 中 `const updated: UserSettings = { ... }` 这一行（约第 72 行）。在这行之前，插入历史记录逻辑：

```ts
// 记录体重/腰围历史
const today = new Date().toISOString().split('T')[0]
const prevWeightHistory = settings?.weightHistory || []
const prevWaistHistory = settings?.waistHistory || []

const weightHistory = [...prevWeightHistory]
const existingWeight = weightHistory.find(h => h.date === today)
if (existingWeight) {
  existingWeight.value = weight
} else {
  weightHistory.push({ date: today, value: weight })
}

const waistHistory = [...prevWaistHistory]
if (form.waist !== undefined && form.waist !== '' && waist > 0) {
  const existingWaist = waistHistory.find(h => h.date === today)
  if (existingWaist) {
    existingWaist.value = waist
  } else {
    waistHistory.push({ date: today, value: waist })
  }
}
```

然后在 `const updated: UserSettings = { ... }` 中加上：

```ts
waist: waist || settings!.waist || 0,
weightHistory,
waistHistory,
```

- [ ] **Step 4: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

---

### Task 3: 资料页历史迁移（首次自动播种）

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: 在 useEffect 初始化时做迁移**

如果 `settings` 已有 `weight` 值但没有 `weightHistory`（旧用户），自动播种一条今天的记录。

找到 `useEffect` 中的初始化逻辑（约第 32-36 行），在其中加入迁移：

```tsx
useEffect(() => {
  const s = getSettings()
  if (s) {
    // 迁移：旧数据没有 history，自动播种当前值
    if (!s.weightHistory || s.weightHistory.length === 0) {
      s.weightHistory = [{ date: new Date().toISOString().split('T')[0], value: s.weight }]
    }
    if (!s.waistHistory) {
      s.waistHistory = []
    }
    if (s.waist === undefined) {
      s.waist = 0
    }
  }
  setSettings(s)
  if (s) setForm(s)
}, [])
```

注意：迁移后要 `saveSettings(s)` 让数据持久化，否则仅内存修改会丢失。所以在 `setSettings(s)` 之前调用 `saveSettings(s)`。

- [ ] **Step 2: 编译检查**

```bash
npx tsc --noEmit
```

---

### Task 4: 进度页加体重 & 腰围趋势图

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 1: 从 settings 取历史数据**

在 `const settings = getSettings()` 后面（约第 36 行），取出历史数组：

```ts
const weightHistory = settings?.weightHistory || []
const waistHistory = settings?.waistHistory || []
```

- [ ] **Step 2: 写内部 TrendLine 组件**

在 `export default function ProgressPage()` 上面、`calcStreak` 函数下面，新增一个纯展示组件：

```tsx
function TrendLine({ data, color, unit, label }: {
  data: { date: string; value: number }[]
  color: string
  unit: string
  label: string
}) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{label}趋势</h2>
        <p className="text-sm text-gray-400 text-center py-4">数据不足，记录两次以上后显示趋势</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const values = sorted.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = range * 0.2
  const yMin = min - pad
  const yMax = max + pad

  const W = 320
  const H = 160
  const padX = 30
  const padY = 20
  const graphW = W - padX * 2
  const graphH = H - padY * 2

  const points = sorted.map((d, i) => {
    const x = padX + (i / (sorted.length - 1)) * graphW
    const y = padY + graphH - ((d.value - yMin) / (yMax - yMin)) * graphH
    return `${x},${y}`
  }).join(' ')

  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const delta = latest.value - first.value

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">{label}趋势</h2>
        <span className={`text-xs font-medium ${delta < 0 ? 'text-green-500' : delta > 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {delta < 0 ? '↓' : delta > 0 ? '↑' : '→'} {Math.abs(delta).toFixed(1)}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = padY + graphH * (1 - frac)
          const val = yMin + (yMax - yMin) * frac
          return (
            <g key={frac}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={padX - 4} y={y + 3} textAnchor="end" className="text-[9px]" fill="#9ca3af">
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}
        {/* 折线 */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* 数据点 */}
        {sorted.map((d, i) => {
          const x = padX + (i / (sorted.length - 1)) * graphW
          const y = padY + graphH - ((d.value - yMin) / (yMax - yMin)) * graphH
          return (
            <g key={d.date}>
              <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
              <text x={x} y={H - 4} textAnchor="middle" className="text-[9px]" fill="#9ca3af">
                {d.date.slice(5)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: 在进度页 JSX 中渲染两个趋势图**

在「本周热量趋势」卡片之后、「本周宏量达成率」卡片之前（约第 162-163 行之间），插入：

```tsx
{/* 体重趋势 */}
<TrendLine
  data={weightHistory}
  color="#ef4444"
  unit="kg"
  label="体重"
/>

{/* 腰围趋势 */}
<TrendLine
  data={waistHistory}
  color="#8b5cf6"
  unit="cm"
  label="腰围"
/>
```

- [ ] **Step 4: 编译 & 构建检查**

```bash
npx tsc --noEmit && npx next build
```

---

### Task 5: 启动 dev server 验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 手动验证清单**

1. 打开 http://localhost:3000/profile — 编辑模式下能看到腰围输入框
2. 修改体重并保存 — 切换到进度页，能看到体重趋势图出现
3. 输入腰围并保存 — 切换到进度页，能看到腰围趋势图出现
4. 多次修改体重/腰围（不同日期或手动改 localStorage 日期）— 折线图有多个数据点
5. 只有 0-1 条数据时 — 显示"数据不足"提示而非空白

---

### Self-Review

**Spec coverage:**
- ✅ 数据模型扩展（waist + weightHistory + waistHistory）
- ✅ 资料页腰围输入
- ✅ 保存时自动记录历史（同天覆盖、新天追加）
- ✅ 旧用户迁移（自动播种首次记录）
- ✅ 进度页双折线趋势图（SVG polyline + 数据点 + 网格线 + Y轴标签 + 变化方向）

**Placeholder scan:** 无 TBD/TODO，所有代码完整可执行。

**Type consistency:**
- `weightHistory` / `waistHistory` 在 types.ts、profile.tsx、progress.tsx 三处一致
- `waist` 字段三处一致
- `TrendLine` 组件 props 类型与调用处匹配
