import { NextRequest, NextResponse } from 'next/server'
import { inferFoodCategory } from '@/lib/diet211'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BASE64_LENGTH = Math.ceil(5 * 1024 * 1024 * (4 / 3)) // 5MB in base64

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

  const prompt = `请分析这张图片中的食物，以JSON格式返回每种食物的营养信息。
返回格式必须是合法的JSON数组，不要有任何其他文字：
[
  {
    "name": "食物名称",
    "estimatedWeight": 估计克数（数字）,
    "calories": 热量（kcal，基于估计克数，数字）,
    "carbs": 碳水化合物（克，数字）,
    "protein": 蛋白质（克，数字）,
    "fat": 脂肪（克��数字）,
    "category": "protein|vegetable|carb|fat|other"
  }
]
如果图中没有食物，返回空数组 []。`

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3-vl-plus',
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
      signal: AbortSignal.timeout(28000),
    })

    if (!response.ok) {
      console.error('Qwen API error:', response.status, await response.text())
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

    const normalized = foods.map((f: any) => ({
      name: String(f.name || '未知食物'),
      estimatedWeight: Number(f.estimatedWeight) || 100,
      calories: Number(f.calories) || 0,
      carbs: Number(f.carbs) || 0,
      protein: Number(f.protein) || 0,
      fat: Number(f.fat) || 0,
      category: f.category || inferFoodCategory(
        Number(f.calories) || 0,
        Number(f.carbs) || 0,
        Number(f.protein) || 0,
        Number(f.fat) || 0,
      ),
    }))

    return NextResponse.json({ foods: normalized })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'AI 识别超时，请重试' }, { status: 500 })
    }
    console.error('Analyze error:', error)
    return NextResponse.json({ error: '识别失败' }, { status: 500 })
  }
}
