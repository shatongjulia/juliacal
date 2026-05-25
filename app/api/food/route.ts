import { NextRequest, NextResponse } from 'next/server'
import { searchLocalFoods } from '@/lib/foodDatabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 20

  if (!q) {
    return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 })
  }

  // 本地中文食物库（优先）
  const localResults = searchLocalFoods(q).map(f => ({
    id: f.id,
    name: f.name,
    calories: f.calories,
    carbs: f.carbs,
    protein: f.protein,
    fat: f.fat,
    imageUrl: null,
    source: 'local',
  }))

  // 并行请求 Open Food Facts
  let offResults: typeof localResults = []
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?` +
      `search_terms=${encodeURIComponent(q)}&json=1&page=${page}&page_size=${pageSize}` +
      `&fields=id,product_name,nutriments,image_front_url`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'JuliaCal/1.0 (calorie tracking app)' },
    })

    if (response.ok) {
      const data = await response.json()
      offResults = (data.products || [])
        .map((p: any) => ({
          id: `off_${p.id || p.code || Math.random().toString(36).slice(2)}`,
          name: p.product_name || '',
          calories: Number(p.nutriments?.['energy-kcal_100g']) || 0,
          carbs: Number(p.nutriments?.['carbohydrates_100g']) || 0,
          protein: Number(p.nutriments?.['proteins_100g']) || 0,
          fat: Number(p.nutriments?.['fat_100g']) || 0,
          imageUrl: p.image_front_url || null,
          source: 'off',
        }))
        .filter((p: any) => p.name && p.name.trim())
    }
  } catch {
    // OFF 失败不影响本地结果
  }

  let products = [...localResults, ...offResults].slice(0, pageSize)

  // AI 兜底搜索：本地和 OFF 都没结果时，用千文查询
  if (products.length === 0) {
    const apiKey = process.env.QWEN_API_KEY
    if (apiKey) {
      try {
        const aiResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen-turbo',
            max_tokens: 200,
            messages: [{
              role: 'user',
              content: `查询食物"${q}"的每100g营养成分。只返回JSON：{"name":"食物名","calories":每100g的kcal,"carbs":每100g的g,"protein":每100g的g,"fat":每100g的g}。如果不知道就直接返回null。`,
            }],
            stream: false,
          }),
          signal: AbortSignal.timeout(5000),
        })

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          const content = aiData.choices?.[0]?.message?.content || ''
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const result = JSON.parse(jsonMatch[0])
              if (result && result.name) {
                products = [{
                  id: `ai_${q.replace(/[^a-zA-Z0-9一-鿿]/g, '_')}`,
                  name: result.name,
                  calories: Number(result.calories) || 0,
                  carbs: Number(result.carbs) || 0,
                  protein: Number(result.protein) || 0,
                  fat: Number(result.fat) || 0,
                  imageUrl: null,
                  source: 'ai',
                }]
              }
            }
          } catch { /* AI 解析失败，返回空 */ }
        }
      } catch { /* AI 调用失败，返回空 */ }
    }
  }

  return NextResponse.json(
    { products, total: products.length, page },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
