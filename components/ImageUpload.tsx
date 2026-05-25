'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { FoodCategory } from '@/lib/types'

export interface AnalyzedFood {
  name: string
  estimatedWeight: number
  calories: number
  carbs: number
  protein: number
  fat: number
  category: FoodCategory
  per100g?: { calories: number; carbs: number; protein: number; fat: number }
}

interface ImageUploadProps {
  onResult: (foods: AnalyzedFood[]) => void
  onError: (msg: string) => void
  disabled?: boolean
}

export default function ImageUpload({ onResult, onError, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // 通过扩展名或 MIME type 判断是否为图片
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const validExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validExts.includes(ext) && file.type && !validTypes.includes(file.type)) {
      onError('请上传 JPEG、PNG 或 WebP 格式的图片')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      onError('图片过大（≤ 15MB）')
      return
    }

    setLoading(true)
    try {
      const base64 = await compressImage(file)
      // 冷启动可能超时，最多尝试 2 次
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          })
          const data = await res.json()
          if (!res.ok) {
            onError(data.error || '识别失败，请手动搜索食物')
            return
          }
          onResult(data.foods)
          return
        } catch (e) {
          if (attempt === 2) throw e
          // 第一次失败，等 2 秒后重试（等冷启动完成）
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    } catch {
      onError('识别失败，请手动搜索食物')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || loading}
        className="p-2 text-gray-400 hover:text-green-500 disabled:opacity-40 transition-colors duration-200"
        title="拍照识别（拳头放食物旁可辅助估测份量）"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
      </button>
    </>
  )
}

const MAX_DIM = 1000
const JPEG_QUALITY = 0.75

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}
