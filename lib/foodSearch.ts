import type {EdamamFood, EdamamMeasure, FoodsParserResponse} from '@/services/fetchFoodsList'

export type FoodSearchResult = {
	id: string
	name: string
	brand?: string
	category?: string
	imageUrl?: string
	calories?: number
	protein?: number
	fat?: number
	carbs?: number
	fiber?: number
	gramMeasureUri?: string
}

function gramMeasureUri(measures: EdamamMeasure[] | undefined) {
	const gram = measures?.find(
		(measure) => measure.uri && /^grams?$/i.test(measure.label?.trim() ?? '')
	)
	return gram?.uri
}

function toFoodSearchResult(
	food: EdamamFood,
	measures: EdamamMeasure[] | undefined
): FoodSearchResult {
	return {
		id: food.foodId,
		name: food.label,
		brand: food.brand,
		category: food.category,
		imageUrl: food.image,
		calories: food.nutrients?.ENERC_KCAL,
		protein: food.nutrients?.PROCNT,
		fat: food.nutrients?.FAT,
		carbs: food.nutrients?.CHOCDF,
		fiber: food.nutrients?.FIBTG,
		gramMeasureUri: gramMeasureUri(measures)
	}
}

export function toFoodSearchResults(data: FoodsParserResponse): FoodSearchResult[] {
	const foods = [...(data.parsed ?? []), ...(data.hints ?? [])]
	const resultsByKey = new Map<string, FoodSearchResult>()

	for (const item of foods) {
		const food = item.food
		if (!food?.foodId || !food.label) continue

		const key = `${food.foodId}:${food.label}`
		const next = toFoodSearchResult(food, item.measures)
		const existing = resultsByKey.get(key)

		if (!existing) {
			resultsByKey.set(key, next)
			continue
		}

		if (!existing.gramMeasureUri && next.gramMeasureUri) {
			existing.gramMeasureUri = next.gramMeasureUri
		}
	}

	return [...resultsByKey.values()]
}
