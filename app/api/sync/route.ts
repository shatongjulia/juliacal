import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function POST(req: NextRequest) {
  try {
    const { code, type, data } = await req.json()
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: '同步码无效' }, { status: 400 })
    }
    const key = `juliacal:${code}:${type}`
    await redis.set(key, data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    const type = req.nextUrl.searchParams.get('type')
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: '同步码无效' }, { status: 400 })
    }

    if (type === 'settings') {
      const data = await redis.get(`juliacal:${code}:settings`)
      return NextResponse.json({ data })
    }

    if (type === 'logs') {
      const keys = await redis.keys(`juliacal:${code}:log_*`)
      const results: Record<string, unknown> = {}
      for (const key of keys) {
        const date = (key as string).split(':log_')[1]
        const data = await redis.get(key as string)
        if (data) results[date] = data
      }
      return NextResponse.json({ data: results })
    }

    return NextResponse.json({ error: 'type 参数无效' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: '拉取失败' }, { status: 500 })
  }
}
