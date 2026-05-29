# JuliaCal 工作日志

## 2026-05-22

### Bug 修复

1. **汉字乱码修复**
   - 修复搜索页"称"、进度页"记"和"餐"、资料页"料"——UTF-8 字节级损坏 (U+FFFD)
   - 用 Node.js Buffer 脚本替换为正确字节序列

2. **改克数卡路里不变（两个根因）**
   - 根因1: `entry.amount = newWeight` 在 per100g fallback 计算**之前**执行，新旧值抵消
   - 根因2: bug 版本期间编辑过的条目 amount/calories 关系已永久错位
   - 修复: 先计算 per100g 再改 amount，编辑成功后保存 `entry.per100g = pg`

3. **分析 API 未匹配食物缺少 per100g**
   - 未匹配本地库的食物不返回 per100g，导致克数编辑无法重算营养
   - 修复: 从 AI 返回的 per-100g 值中提取

### 新功能

4. **手机图库上传**
   - 移除 `<input capture="environment">`，移动端打开文件选择器时同时提供相机和相册选项

5. **饮水追踪**
   - WaterTracker 组件: +100/200/300/500ml 快捷按钮 + 自定义输入 + 撤销(-200ml)
   - 每日目标 = 体重(kg) × 35ml（3.5%）
   - dailyWaterTarget 加入 UserSettings → 引导页/个人资料页同步
   - 进度页新增「本周饮水达成率（日均）」

6. **进餐时间 + 空腹统计**
   - DailyLog 新增 `mealTimes` 字段
   - MealSection 每个餐段增加时钟按钮，点击记录当前时间
   - 进度页新增「夜晚空腹统计」卡片：近30天平均空腹时长 + 16:8达成率
   - 研究结论：16:8 并非独立代谢魔法，核心仍是热量缺口；早起窗口 (9:00-17:00) 优于晚窗口

### 食物数据库

7. **大规模扩展** 90+ → 170+ 条目
   - 饮品 14 种: 珍珠奶茶、拿铁、可乐、豆浆、柠檬茶等
   - 零食 17 种: 薯片、巧克力、牛肉干、蛋挞、月饼等
   - 中式菜肴 33 种: 食堂+家常全覆盖
   - 酱料 10 种: 蛋黄酱、芝麻酱、辣椒油、蜂蜜等
   - 更多水果、坚果、加工食品

8. **AI 搜索兜底**
   - food API 增加 Qwen-Turbo 文本模型兜底（本地+OFF 无结果时触发）
   - 每次查询约 ¥0.0001，响应 < 2s

### AI 识别优化

9. **Prompt 重写**
   - 明确要求每 100g 营养格式（而非整份）
   - 新增拳头参照物逻辑：「女性拳≈80-100g，男性拳≈100-120g」
   - 餐盘/碗尺寸参考 + 食堂份量指导

10. **图片质量提升**
    - MAX_DIM: 800 → 1000px
    - JPEG: 0.65 → 0.75
    - max_tokens: 600 → 800

### 部署
- 4 次生产部署，均 Ready @ juliacal.shatongjulia.tech

### 工程
- 建立 Claude memory 体系：项目概览 + 协作偏好
- 建立 docs/changelog.md 作为项目工作日志

## 2026-05-25

### PWA 安装

11. **manifest.json + sw.js + 安装按钮**
    - 创建 `public/manifest.json`：PWA 配置（standalone 模式、绿色主题、512px SVG 图标）
    - 创建 `public/sw.js`：离线缓存静态资源，API 请求走网络
    - 创建 `components/PwaRegister.tsx`：监听 `beforeinstallprompt` 事件，底部显示绿色"安装到桌面"按钮
    - `app/layout.tsx` 添加 PWA meta 标签和 `<PwaRegister />`
    - Safari 安装成功，Chrome 需手动触发，微信浏览器不支持

### Bug 修复

12. **早餐移除 211 蔬菜指标**
    - `MealSection.tsx:31` — `show211` 条件增加 `mealType !== 'breakfast'`
    - 早餐不再显示"未达标"和蔬菜不足提示

13. **进度页数据不刷新**
    - `app/progress/page.tsx` — 去掉 `useState` + `useEffect([], [])`
    - 改为直接从 localStorage 读取，每次切换到进度页数据自动刷新
    - 影响范围：热量趋势、宏量达成率、211达标、饮水、空腹统计

14. **图像识别超时**
    - `ImageUpload.tsx` — 图片压缩 1000→768px，质量 0.75→0.6（base64 体积约 -40%）
    - `app/api/analyze/route.ts` — `max_tokens` 800→400，超时 9s→9.5s
    - 新增 `export const maxDuration = 10` 用满 Vercel Hobby 上限
    - 注意：Hobby 10s 天花板无法突破，Qwen API 波动超过此值仍会超时

### Skill 生态

15. **全局 skill 体系梳理**
    - 盘点已有：superpowers 14 子技能 + vercel-react-best-practices + web-design-guidelines 等
    - 新安装全局：`frontend-design`、`skill-creator`、`xlsx`（Anthropic 官方）
    - 建立 Skill 安装规则写入全局 CLAUDE.md：先判断全局/项目级 → 选来源 → symlink
    - `npx skills add` 默认装到当前工作目录，全局安装需 `cd ~` 后执行
    - 新增"工具调用被拒后"规则：必须先确认理解再执行

## 2026-05-26

### 宏量公式修正

16. **蛋白质自带脂肪修正：蛋白:脂肪:碳水 = 1.7:1.1:1**
    - 用户发现蛋白食物实际含 40-50% 脂肪热量，原公式 2.8:1 假设纯蛋白不合理
    - `lib/calories.ts` — `calculateMacros` 改为三向比值 1.7:1.1:1（60%蛋白/40%脂肪拆分）
    - 以 1500 kcal 为例：蛋白 221→168g，脂肪 33→48g，碳水 79→99g

17. **页面宏量目标值改为实时计算**
    - 首页 (`app/page.tsx`)、进度页 (`app/progress/page.tsx`)、资料页 (`app/profile/page.tsx`)
    - 三个页面均从 `settings.dailyXxxTarget`（localStorage 旧值）改为 `calculateMacros(settings.dailyCalorieTarget)` 实时计算
    - 公式变更自动全局生效，无需迁移 localStorage 数据

18. **牛肉（肥瘦）category 修正**
    - `lib/foodDatabase.ts` — `l_beef_fat` 从 `protein` 改为 `fat`（脂肪 19.2g > 蛋白 17.8g）

19. **高脂蛋白 UI 标注**
    - `components/MealSection.tsx` — 脂肪/蛋白质 ≥ 50% 的蛋白食物，名称旁显示琥珀色 `高脂` 标签
    - 触发食物：鸡蛋、鸭蛋、咸鸭蛋、鸡腿肉、羊肉、三文鱼、牛奶（全脂）、宫保鸡丁、可乐鸡翅、盐酥鸡等

## 2026-05-26（续）

### 宏量比例重构：和平 30/30/40 + 双模式系统

20. **和平模式比例改为 30/30/40**
    - 40/30/30 蛋白过高（160g），改为 30/30/40（120g/53g/160g，更适合长期维持）
    - `lib/calories.ts` — `calculateMacros` 公式更新
    - `lib/diet211.ts` — 211 评估比例同步

21. **战役模式（绝对克数锚定法）**
    - 与和平模式不同的算法：蛋白 2.2g/kg + 碳水 1.4g/kg + 脂肪 0.9g/kg
    - 以 60kg 计：132g 蛋白 / 84g 碳水 / 54g 脂肪，总热量自动收敛 ~1350 kcal
    - 供能比 39/36/25，由绝对克数反推
    - `lib/types.ts` — 新增 `DietMode` 类型 + `UserSettings.dietMode`
    - `lib/calories.ts` — 新增 `calculateCampaignMacros()`、`getMacroTargets()` 分派函数
    - `lib/diet211.ts` — 战役比例常量 `CAMPAIGN_RATIOS`，`evaluate211` 加 `dietMode` 参数
    - UI：`app/onboarding/page.tsx` 新增第 6 步选择模式，`app/profile/page.tsx` 可切换模式
    - 所有显示页（首页、进度、资料）改用 `getMacroTargets(settings)` 实时适配双模式

22. **211 容差改为绝对值 ±5pp**
    - 旧：相对 ±10%（如 30%×0.9~1.1 = 27~33%）
    - 新：绝对值 ±5 个百分点（如 30%±5 = 25~35%），范围更宽、更灵活
    - 220 模式蛋白:脂肪比率保持相对 ±10%

23. **蛋白锚定系数调整**：战役模式 2.0 → 2.2 g/kg

### Bug 修复

24. **资料页编辑后宏量不刷新**
    - `app/profile/page.tsx` — 新增 `calorieManuallySet` 标志位，不手动改热量字段时自动用新计算值

25. **Progress 页潜藏引用错误**
    - `app/progress/page.tsx:69` — `log.meals` → `l.meals`（回调变量名错误）

### 工程

26. **全局 memory 体系启用**
    - Plan 模式纪律：多文件跨层改动进 Plan，小改直接做
    - Memory 提醒：主动提示用户将跨项目偏好写入全局 memory

## 2026-05-27

### 用餐时间可编辑

27. **点击时间标签直接修改进餐时间**
    - `components/MealSection.tsx` — 已记录的时间标签改为按钮，点击弹出 `time` 输入框
    - 失焦/回车确认，Esc 取消；时钟按钮保留（覆盖为当前时间）

### 饮食模式 UI 梳理

28. **战役模式下弱化不相关字段**
    - `app/profile/page.tsx` — 编辑态选战役模式时，目标和活动水平置灰禁用
    - 小字说明：「由体重直接锚定，切回和平模式时保留此设置」
    - 逻辑关系：和平模式 = 目标驱动（TDEE），战役模式 = 体重驱动（g/kg）

### 空腹统计优化

29. **16:8 达成率改为达成次数**
    - `app/progress/page.tsx` — 显示从 `50%` 改为 `3/30天`
    - 分母固定为 30（与「近30天」标题一致）
    - `calcOvernightFasting` 新增 `hit16` 返回值

### AI 搜索强化

30. **Prompt 重写：中餐营养估算**
    - `app/api/food/route.ts` — 去掉「不知道就返回 null」
    - 加入中餐烹饪常识：炒/烧/炸/蒸/拌的脂肪范围，肉部位差异，食堂/外卖油量上浮
    - AI 必须给出估算值，即使不完全确定

31. **搜索结果来源标记**
    - `components/FoodCard.tsx` — 新增 `source` prop，`source='ai'` 时显示紫色 `AI估算` 标签
    - `app/search/page.tsx` — 传递 `source` 给 FoodCard

### Git 备份体系

32. **GitHub 远程仓库 + 两层备份策略**
    - 远端：https://github.com/shatongjulia/juliacal
    - 本地 commit：高频小步快照（功能跑通/切换 AI 前）
    - GitHub push：阶段性推送（收工前/里程碑节点）
    - 不影响 Vercel 部署（CLI 直连，不走 GitHub）

## 2026-05-28

### 夜宵餐段

33. **新增夜宵（nightsnack）餐段**
    - `lib/types.ts` — MealType 新增 `'nightsnack'`
    - 餐段排序：早餐 → 午餐 → 零食 → 晚餐 → 夜宵
    - `lib/storage.ts` — emptyMeals/emptyMealTimes 补全 5 个餐段
    - 夜宵不参与 211 评估（仅午/晚餐），不显示达标/未达标标签

34. **空腹计算重写：全餐段时间窗**
    - 旧：只取前一天晚餐 → 今天早餐
    - 新：前一天所有餐段最晚时间 → 今天所有餐段最早时间
    - 场景覆盖：有夜宵取夜宵，没早餐取午餐
    - `app/progress/page.tsx` — `calcOvernightFasting` 用 `Math.max/min` 扫描全部 `mealTimes`

### 体重 & 腰围趋势

35. **体重/腰围趋势图**
    - `app/progress/page.tsx` — SVG `TrendLine` 组件（折线+数据点+网格线+Y轴标签+变化方向）
    - 体重（teal #0d9488）、腰围（indigo #6366f1）
    - 数据不足 2 条时显示占位提示，右上角标注总变化量（↓↑→）

36. **目标快照（targets snapshot）**
    - `weightHistory` 从 `{ date, value }` 扩展为含完整目标快照
    - 每条记录：weight + calorieTarget + carbTarget + proteinTarget + fatTarget + waterTarget
    - 资料页每次保存自动记录，同天覆盖、新天追加
    - 旧数据首次加载自动迁移（回填当前目标值）

37. **资料页新增腰围字段**
    - `app/profile/page.tsx` — 腰围输入框，步长 0.1cm，可选填
    - UserSettings 新增 `waist`、`weightHistory`、`waistHistory`

### 长按移动食物

38. **长按食物条目移动到其他餐段**
    - `components/MealSection.tsx` — 长按 600ms 触发，弹出"移动到"选择器
    - 10px 移动阈值防止手指微抖取消长按
    - haptic feedback（`navigator.vibrate`）
    - 长按后自动屏蔽 click 防止误触

### Bug 修复

39. **getDailyLog 旧数据兼容**
    - `lib/storage.ts` — 旧日志缺少 nightsnack 等新餐段键
    - 加载时 `{ ...emptyMeals(), ...(parsed?.meals) }` 兜底补全
    - 修复移动食物到夜宵时报错

40. **长按移动触控阈值**
    - 旧：`onTouchMove` 直接取消 → 手机上几乎无法触发长按
    - 新：移动超过 10px 才取消，正常微抖不触发取消

41. **空腹统计提示文字更新**
    - "晚餐→次日早餐" → "前一天最晚进餐→次日最早进餐"（与计算逻辑一致）

### 工程

42. **Git 工作流纪律**
    - commit / deploy / push 三道工序节奏分离
    - commit：高频，功能跑通即做
    - deploy：功能可验收时部署
    - push：仅收工/里程碑，等确认

### Skill 生态

43. **办公四件套**
    - 已安装：xlsx（之前），docx / pdf / pptx（本次补装），canvas-design
    - 来源：Anthropic 官方 skills 仓库
    - 场景：财报分析、尽调报告转 PPT 等

## 2026-05-29

### 云端同步

44. **Vercel KV → Upstash Redis 云端数据同步**
    - `app/api/sync/route.ts` — GET/POST 同步 API，6 位同步码鉴权（无注册）
    - `@upstash/redis` SDK（Vercel Marketplace 集成），原 `@vercel/kv` 已废弃
    - 同步码字符集排除 0/O/1/I 免混淆
    - 首页静默自动备份 settings（`useEffect` POST 到 `/api/sync`）
    - 资料页手动备份/恢复卡片：生成同步码 → 备份到云端 → 其他设备输入同步码恢复
    - 环境变量：`KV_REST_API_URL` + `KV_REST_API_TOKEN`（Vercel Integration 自动注入）

### 常吃食物快速添加

45. **搜索页高频食物快捷入口**
    - `app/search/page.tsx` — `getFrequentFoods()` 扫描 30 天日志
    - 按出现次数排序，取最新一条的份量和 per100g，top 12
    - 未输入搜索词时显示 chip 按钮列表，一键添加到当前餐段
    - 添加时自动计算营养（份量 × per100g）

### 月度报告导出

46. **进度页 → 月度报告 Excel 导出**
    - `app/report/page.tsx` — 月份 checkbox 选择器（从 localStorage 扫描可用月份）
    - SheetJS (xlsx) 浏览器端生成三 sheet Excel：每日摘要、体重与腰围、月度汇总
    - 每日摘要含 10 列：日期/热量/碳水/净碳水/蛋白质/脂肪/饮水/餐段数/午餐211/晚餐211
    - 月度汇总含：记录天数/日均热量/日均三大宏量/211达标率
    - `app/progress/page.tsx` 标题栏新增「导出报告」按钮

