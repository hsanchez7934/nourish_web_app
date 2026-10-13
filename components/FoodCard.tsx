import Image from 'next/image'
import type {FoodSearchResult} from '@/lib/foodSearch'

type Nutrient = {
	label: string
	value: string
}

function formatCalories(value: number) {
	return new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(value)
}

function formatGrams(value: number) {
	return new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(value)
}

function getNutrients(food: FoodSearchResult): Nutrient[] {
	const nutrients: Nutrient[] = []

	if (food.calories != null) {
		nutrients.push({label: 'Calories', value: `${formatCalories(food.calories)} kcal`})
	}
	if (food.protein != null) {
		nutrients.push({label: 'Protein', value: `${formatGrams(food.protein)} g`})
	}
	if (food.carbs != null) {
		nutrients.push({label: 'Carbs', value: `${formatGrams(food.carbs)} g`})
	}
	if (food.fat != null) {
		nutrients.push({label: 'Fat', value: `${formatGrams(food.fat)} g`})
	}
	if (food.fiber != null) {
		nutrients.push({label: 'Fiber', value: `${formatGrams(food.fiber)} g`})
	}

	return nutrients
}

export default function FoodCard({
	food,
	onSelect
}: {
	food: FoodSearchResult
	onSelect: (food: FoodSearchResult) => void
}) {
	const nutrients = getNutrients(food)

	return (
		<button
			type="button"
			onClick={() => onSelect(food)}
			className="flex w-full cursor-pointer gap-4 rounded-xl border border-stone-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-emerald-700/40 hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-950/30"
		>
			<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
				{food.imageUrl ? (
					<Image src={food.imageUrl} alt="" fill sizes="80px" className="object-cover" />
				) : null}
			</div>
			<div className="min-w-0">
				<h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">{food.name}</h2>
				{food.brand ? (
					<p className="mt-0.5 text-sm text-stone-600 dark:text-stone-300">{food.brand}</p>
				) : null}
				{food.category ? (
					<p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{food.category}</p>
				) : null}
				{nutrients.length > 0 ? (
					<div className="mt-3">
						<p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
							Per 100 g
						</p>
						<dl className="mt-1.5 flex flex-wrap gap-2">
							{nutrients.map((nutrient) => (
								<div
									key={nutrient.label}
									className="rounded-full bg-stone-100 px-2.5 py-1 text-sm text-stone-700 dark:bg-stone-800 dark:text-stone-200"
								>
									<dt className="sr-only">{nutrient.label}</dt>
									<dd>
										<span className="font-medium">{nutrient.value}</span>{' '}
										<span className="text-stone-500 dark:text-stone-400">{nutrient.label}</span>
									</dd>
								</div>
							))}
						</dl>
					</div>
				) : null}
			</div>
		</button>
	)
}
