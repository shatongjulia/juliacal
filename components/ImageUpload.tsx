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
    const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp']
    if (!SUPPORTED.includes(file.type)) {
      onError('请上传 JPEG、PNG 或 WebP 格式的图片')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onError('图片过大，请压缩后重试（≤ 5MB）')
      return
    }

    setLoading(true)
    try {
      const base64 = await fileToBase64(file)
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
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || loading}
        className="p-2 text-gray-400 hover:text-green-500 disabled:opacity-40 transition-colors duration-200"
        title="拍照识别"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
      </button>
    </>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
