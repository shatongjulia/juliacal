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

  const products = [...localResults, ...offResults].slice(0, pageSize)

  return NextResponse.json(
    { products, total: products.length, page },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
