interface FoodCardProps {
  name: string
  calories: number
  carbs?: number
  protein?: number
  fat?: number
  imageUrl?: string | null
  source?: string
  onClick?: () => void
}

export default function FoodCard({ name, calories, carbs, protein, fat, imageUrl, source, onClick }: FoodCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm text-left transition-all duration-200 hover:shadow-md active:scale-98"
    >
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-gray-900 truncate">{name}</p>
            {source === 'ai' && (
              <span className="text-[10px] bg-purple-50 text-purple-500 px-1 py-0.5 rounded flex-shrink-0">AI估算</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{Math.round(calories)} kcal/100g</p>
        </div>
        {(carbs !== undefined || protein !== undefined || fat !== undefined) && (
          <div className="text-right text-xs text-gray-400 flex-shrink-0">
            {carbs !== undefined && <div>碳水 {Math.round(carbs)}g</div>}
            {protein !== undefined && <div>蛋白 {Math.round(protein)}g</div>}
            {fat !== undefined && <div>脂肪 {Math.round(fat)}g</div>}
          </div>
        )}
      </div>
    </button>
  )
}
