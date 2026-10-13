import {toNutritionSections, type NutritionRow} from '@/lib/foodNutrients'

export type ParsedFood = {
	food: string
	quantity: number
	measure: string
	weight: number
}

export type AnalyzedIngredient = {
	text: string
	foods: ParsedFood[]
}

export type CalorieSource = {
	id: string
	label: string
	quantity: number
	unit: string
}

export type NutritionAnalysis = {
	calories: number
	calorieUnit: string
	calorieDailyPercent?: number
	totalWeight: number
	dietLabels: string[]
	healthLabels: string[]
	cautions: string[]
	calorieSources: CalorieSource[]
	mainRows: NutritionRow[]
	microRows: NutritionRow[]
	ingredients: AnalyzedIngredient[]
}

const CALORIE_SOURCES = [
	{key: 'PROCNT_KCAL', id: 'protein', label: 'Protein'},
	{key: 'CHOCDF_KCAL', id: 'carbs', label: 'Carbs'},
	{key: 'FAT_KCAL', id: 'fat', label: 'Fat'}
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function stringList(value: unknown) {
	if (!Array.isArray(value)) return []
	return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function nutrientMap(value: unknown) {
	if (!isRecord(value)) return undefined
	return value as Record<string, {label?: string; quantity?: number; unit?: string}>
}

function toIngredients(value: unknown): AnalyzedIngredient[] {
	if (!Array.isArray(value)) return []

	const ingredients: AnalyzedIngredient[] = []

	for (const item of value) {
		if (!isRecord(item) || typeof item.text !== 'string' || !item.text.trim()) continue

		const foods: ParsedFood[] = []
		if (Array.isArray(item.parsed)) {
			for (const parsed of item.parsed) {
				if (!isRecord(parsed) || typeof parsed.food !== 'string' || !parsed.food.trim()) continue
				foods.push({
					food: parsed.food.trim(),
					quantity: typeof parsed.quantity === 'number' ? parsed.quantity : 0,
					measure: typeof parsed.measure === 'string' ? parsed.measure.trim() : '',
					weight: typeof parsed.weight === 'number' ? parsed.weight : 0
				})
			}
		}

		ingredients.push({text: item.text.trim(), foods})
	}

	return ingredients
}

function toCalorieSources(value: unknown): CalorieSource[] {
	const nutrients = nutrientMap(value)
	if (!nutrients) return []

	const sources: CalorieSource[] = []
	for (const field of CALORIE_SOURCES) {
		const nutrient = nutrients[field.key]
		if (typeof nutrient?.quantity !== 'number' || typeof nutrient.unit !== 'string') continue
		sources.push({
			id: field.id,
			label: field.label,
			quantity: nutrient.quantity,
			unit: nutrient.unit
		})
	}

	return sources
}

export function toNutritionAnalysis(data: unknown): NutritionAnalysis | null {
	if (!isRecord(data) || typeof data.calories !== 'number' || !Number.isFinite(data.calories)) {
		return null
	}

	const nutrients = nutrientMap(data.totalNutrients)
	const daily = nutrientMap(data.totalDaily)
	const energy = nutrients?.ENERC_KCAL
	const dailyEnergy = daily?.ENERC_KCAL
	const {mainRows, microRows} = toNutritionSections(nutrients, daily)

	return {
		calories: data.calories,
		calorieUnit: typeof energy?.unit === 'string' ? energy.unit : 'kcal',
		calorieDailyPercent:
			typeof dailyEnergy?.quantity === 'number' && dailyEnergy.unit === '%'
				? dailyEnergy.quantity
				: undefined,
		totalWeight: typeof data.totalWeight === 'number' ? data.totalWeight : 0,
		dietLabels: stringList(data.dietLabels),
		healthLabels: stringList(data.healthLabels),
		cautions: stringList(data.cautions),
		calorieSources: toCalorieSources(data.totalNutrientsKCal),
		mainRows,
		microRows,
		ingredients: toIngredients(data.ingredients)
	}
}
