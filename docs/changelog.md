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

