'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

let deferredPrompt: any = null

// 暴露给全局，让外部也能触发
if (typeof window !== 'undefined') {
  (window as any).__pwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => { deferredPrompt = null })
    }
  }
}

export default function PwaRegister() {
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null
      setShowInstall(false)
    })

    // 如果已安装为 PWA，不显示按钮
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  if (!showInstall) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center">
      <button
        onClick={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then(() => {
              deferredPrompt = null
              setShowInstall(false)
            })
          }
        }}
        className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all font-medium text-sm"
      >
        <Download size={18} />
        安装到桌面（免备案弹窗）
      </button>
    </div>
  )
}
