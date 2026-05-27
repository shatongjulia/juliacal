import { NextRequest, NextResponse } from 'next/server'
import { inferFoodCategory } from '@/lib/diet211'
import { LOCAL_FOODS, LocalFood } from '@/lib/foodDatabase'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BASE64_LENGTH = Math.ceil(5 * 1024 * 1024 * (4 / 3)) // 5MB in base64

function matchLocalFood(qwenName: string): LocalFood | null {
  const q = qwenName.toLowerCase()
  let best: LocalFood | null = null
  let bestLen = 0
  for (const food of LOCAL_FOODS) {
    const fn = food.name.toLowerCase()
    if (q.includes(fn) || fn.includes(q)) {
      if (fn.length > bestLen) {
        best = food
        bestLen = fn.length
      }
    }
  }
  return best
}

export const maxDuration = 10

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.image || typeof body.image !== 'string') {
    return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
  }

  const image: string = body.image

  // 校验格式：data:image/jpeg;base64,...
  const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (!match) {
    return NextResponse.json({ error: '图片格式无效' }, { status: 400 })
  }

  const mimeType = match[1]
  const base64Data = match[2]

  if (!SUPPORTED_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: '不支持的图片格式，请使用 JPEG、PNG 或 WebP' }, { status: 400 })
  }

  if (base64Data.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: '图片超过 5MB 限制' }, { status: 400 })
  }

  const apiKey = process.env.QWEN_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 })
  }

  const prompt = `分析图中所有食物（包括混合菜肴、汤羹、主食、配菜）。逐项列出。

**营养数据请按每100g的标准营养表格式提供**（不是整份的值）。

重量估测指南（按优先级）：
1. 如果图中食物旁边有拳头，以拳头为参照：成年女性拳头≈直径8cm/体积250ml，男性≈10cm/350ml。拳头大小食物≈80-100g，半拳≈40-50g
2. 参考餐具尺寸：标准餐盘直径约26cm，碗直径约12cm
3. 常见份量：1碗米饭≈150g，1份炒菜≈150-200g，1碗汤≈300g
4. 中式食堂常规：荤菜1份≈150g，素菜≈120g，米饭≈150g
5. 不确定时偏保守，取偏小值

name字段要具体描述菜品（如"红烧肉"、"西红柿炒鸡蛋"、"蒜蓉西兰花"、"白米饭"）。
即使菜品复杂、混合汤汁，也请尽力估测每项成分的营养。

只返回JSON数组，无其他文字：
[{"name":"菜品名","estimatedWeight":克数,"calories":每100g的kcal,"carbs":每100g的g,"protein":每100g的g,"fat":每100g的g,"category":"protein|vegetable|carb|fat|other"}]
图中无食物则返回 []`

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3-vl-plus',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: image } },
              { type: 'text', text: prompt },
            ],
          },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(9500),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Qwen API error:', response.status, errText)
      return NextResponse.json({ error: 'AI 识别服务暂时不可用' }, { status: 500 })
    }

    const data = await response.json()
    const content: string = data.choices?.[0]?.message?.content || ''

    // 提取 JSON（可能被 markdown 代码块包裹）
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\[[\s\S]*\])/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : content.trim()

    let foods: unknown[]
    try {
      foods = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: '未能识别食物' }, { status: 422 })
    }

    if (!Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json({ error: '图片中未识别到食物' }, { status: 422 })
    }

    const normalized = foods.map((f: any) => {
      const qwenName = String(f.name || '未知食物')
      const matched = matchLocalFood(qwenName)

      if (matched) {
        // 匹配到本地数据库：用标准份量 + 数据库营养密度
        const weight = matched.servingWeight
        const factor = weight / 100
        return {
          name: matched.name,
          estimatedWeight: weight,
          calories: Math.round(matched.calories * factor),
          carbs: Math.round(matched.carbs * factor * 10) / 10,
          protein: Math.round(matched.protein * factor * 10) / 10,
          fat: Math.round(matched.fat * factor * 10) / 10,
          category: matched.category,
          per100g: {
            calories: matched.calories,
            carbs: matched.carbs,
            protein: matched.protein,
            fat: matched.fat,
          },
        }
      }

      const weight = Number(f.estimatedWeight) || 100
      const factor = weight / 100
      return {
        name: qwenName,
        estimatedWeight: weight,
        calories: Math.round((Number(f.calories) || 0) * factor),
        carbs: Math.round((Number(f.carbs) || 0) * factor * 10) / 10,
        protein: Math.round((Number(f.protein) || 0) * factor * 10) / 10,
        fat: Math.round((Number(f.fat) || 0) * factor * 10) / 10,
        category: f.category || inferFoodCategory(
          Number(f.calories) || 0,
          Number(f.carbs) || 0,
          Number(f.protein) || 0,
          Number(f.fat) || 0,
        ),
        per100g: {
          calories: Number(f.calories) || 0,
          carbs: Number(f.carbs) || 0,
          protein: Number(f.protein) || 0,
          fat: Number(f.fat) || 0,
        },
      }
    })

    return NextResponse.json({ foods: normalized })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'AI 识别超时，请重试' }, { status: 500 })
    }
    console.error('Analyze error:', error)
    return NextResponse.json({ error: '识别失败' }, { status: 500 })
  }
}
