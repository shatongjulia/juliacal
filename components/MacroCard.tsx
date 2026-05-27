interface MacroCardProps {
  label: string
  current: number
  target: number
  unit?: string
  color?: string
  subtitle?: string
}

export default function MacroCard({ label, current, target, unit = 'g', color = '#22c55e', subtitle }: MacroCardProps) {
  const ratio = target > 0 ? Math.min(current / target, 1) : 0

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(current)}<span className="text-gray-400 font-normal">/{Math.round(target)}{unit}</span>
        </span>
      </div>
      {subtitle && (
        <p className="text-[10px] text-gray-400 mb-1">{subtitle}</p>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
