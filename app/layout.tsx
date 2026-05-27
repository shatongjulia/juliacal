import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import PwaRegister from '@/components/PwaRegister'

export const metadata: Metadata = {
  title: 'JuliaCal - 饮食热量追踪',
  description: '记录每日饮食，追踪热量与营养',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JuliaCal',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#22c55e',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <PwaRegister />
        <BottomNav />
        {/* 移动端底部 padding，桌面端左侧 padding */}
        <main className="pb-20 md:pb-0 md:ml-60 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
