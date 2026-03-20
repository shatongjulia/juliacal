'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, BarChart2, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/search', icon: Search, label: '搜索' },
  { href: '/progress', icon: BarChart2, label: '进度' },
  { href: '/profile', icon: User, label: '我的' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // 隐藏 onboarding 页面的导航
  if (pathname === '/onboarding') return null

  return (
    <>
      {/* 移动端底部 tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-50">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 transition-colors duration-200 ${
                active ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* 桌面端左侧导航栏 */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 flex-col pt-8 pb-4 z-50">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold text-green-500">JuliaCal</h1>
          <p className="text-xs text-gray-400">饮食热量追踪</p>
        </div>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-green-50 text-green-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
