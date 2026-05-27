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

  const products = [...localResults]

  // 本地库无结果 → 尝试 Open Food Facts
  if (products.length === 0) {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?` +
        `search_terms=${encodeURIComponent(q)}&json=1&page=${page}&page_size=${pageSize}` +
        `&fields=id,product_name,nutriments,image_front_url`

      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'JuliaCal/1.0 (calorie tracking app)' },
      })

      if (response.ok) {
        const data = await response.json()
        const offResults = (data.products || [])
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
        products.push(...offResults)
      }
    } catch { /* OFF 不可用 */ }
  }

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
              content: `你是一个专业营养师。请估算食物"${q}"每100g的营养成分。

中餐烹饪常识：
- 炒菜（炒肉、炒蛋等）：脂肪 8-15g，因用油量而异
- 红烧/焖炖（红烧排骨、红烧肉等）：脂肪 10-20g，肥肉更高
- 油炸（炸鸡、糖醋里脊等）：脂肪 15-25g
- 清蒸/水煮（清蒸鱼、白灼菜等）：脂肪 1-5g
- 凉拌：脂肪 3-8g（取决于酱料）
- 猪肉（肥瘦）脂肪约19g，纯瘦猪肉脂肪约6g，五花肉脂肪约30g
- 鸡胸肉脂肪约2g，鸡腿肉脂肪约10g，鸭肉脂肪约20g
- 食堂/外卖通常比家常多用30-50%油

请一定给出估算值，即使不完全确定也要给出合理估计。只返回JSON：
{"name":"食物名","calories":每100g的kcal,"carbs":每100g的g,"protein":每100g的g,"fat":每100g的g}`,
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
                products.push({
                  id: `ai_${q.replace(/[^a-zA-Z0-9一-鿿]/g, '_')}`,
                  name: result.name,
                  calories: Number(result.calories) || 0,
                  carbs: Number(result.carbs) || 0,
                  protein: Number(result.protein) || 0,
                  fat: Number(result.fat) || 0,
                  imageUrl: null,
                  source: 'ai',
                })
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
