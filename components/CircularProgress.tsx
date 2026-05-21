'use client'

interface CircularProgressProps {
  current: number
  target: number
  size?: number
}

export default function CircularProgress({ current, target, size = 180 }: CircularProgressProps) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const actualRatio = target > 0 ? current / target : 0
  const clampedRatio = Math.min(actualRatio, 1)
  const offset = circumference * (1 - clampedRatio)

  const color =
    actualRatio > 1 ? '#ef4444' :
    actualRatio >= 0.8 ? '#f59e0b' :
    '#22c55e'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{Math.round(current)}</span>
        <span className="text-xs text-gray-500">/ {Math.round(target)} kcal</span>
      </div>
    </div>
  )
}
