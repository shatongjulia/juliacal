import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 20

  if (!q) {
    return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 })
  }

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?` +
      `search_terms=${encodeURIComponent(q)}&json=1&page=${page}&page_size=${pageSize}` +
      `&fields=id,product_name,nutriments,image_front_url`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'JuliaCal/1.0 (calorie tracking app)' },
    })

    if (!response.ok) {
      return NextResponse.json({ error: '食物搜索服务暂时不可用' }, { status: 503 })
    }

    const data = await response.json()
    const products = (data.products || []).map((p: any) => ({
      id: `off_${p.id || p.code || Math.random().toString(36).slice(2)}`,
      name: p.product_name || '未知食品',
      calories: Number(p.nutriments?.['energy-kcal_100g']) || 0,
      carbs: Number(p.nutriments?.['carbohydrates_100g']) || 0,
      protein: Number(p.nutriments?.['proteins_100g']) || 0,
      fat: Number(p.nutriments?.['fat_100g']) || 0,
      imageUrl: p.image_front_url || null,
    })).filter((p: any) => p.name && p.name !== '未知食品')

    return NextResponse.json(
      { products, total: data.count || 0, page },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: '食物搜索超时' }, { status: 503 })
    }
    console.error('Food search error:', error)
    return NextResponse.json({ error: '食物搜索服务暂时不可用' }, { status: 503 })
  }
}
