export type NutritionRow = {
	id: string
	label: string
	quantity: number
	unit: string
	dailyPercent?: number
	indent: 0 | 1 | 2
}

export type FoodNutrientDetails = {
	id: string
	name: string
	calories: {
		quantity: number
		unit: string
		dailyPercent?: number
	} | null
	mainRows: NutritionRow[]
	microRows: NutritionRow[]
}

type NutrientAmount = {
	label?: string
	quantity?: number
	unit?: string
}

type NutrientsResponse = {
	totalNutrients?: Record<string, NutrientAmount>
	totalDaily?: Record<string, NutrientAmount>
	ingredients?: {
		parsed?: {
			food?: string
			foodId?: string
		}[]
	}[]
}

const NUTRIENT_ROWS: {
	key: string
	label: string
	indent: 0 | 1 | 2
	section: 'main' | 'micro'
}[] = [
	{key: 'FAT', label: 'Total Fat', indent: 0, section: 'main'},
	{key: 'FASAT', label: 'Saturated Fat', indent: 1, section: 'main'},
	{key: 'FATRN', label: 'Trans Fat', indent: 1, section: 'main'},
	{key: 'FAMS', label: 'Monounsaturated Fat', indent: 1, section: 'main'},
	{key: 'FAPU', label: 'Polyunsaturated Fat', indent: 1, section: 'main'},
	{key: 'CHOLE', label: 'Cholesterol', indent: 0, section: 'main'},
	{key: 'NA', label: 'Sodium', indent: 0, section: 'main'},
	{key: 'CHOCDF', label: 'Total Carbohydrate', indent: 0, section: 'main'},
	{key: 'FIBTG', label: 'Dietary Fiber', indent: 1, section: 'main'},
	{key: 'SUGAR', label: 'Total Sugars', indent: 1, section: 'main'},
	{key: 'SUGAR.added', label: 'Includes Added Sugars', indent: 2, section: 'main'},
	{key: 'Sugar.alcohol', label: 'Sugar Alcohol', indent: 1, section: 'main'},
	{key: 'CHOCDF.net', label: 'Net Carbs', indent: 1, section: 'main'},
	{key: 'PROCNT', label: 'Protein', indent: 0, section: 'main'},
	{key: 'VITD', label: 'Vitamin D', indent: 0, section: 'micro'},
	{key: 'CA', label: 'Calcium', indent: 0, section: 'micro'},
	{key: 'FE', label: 'Iron', indent: 0, section: 'micro'},
	{key: 'K', label: 'Potassium', indent: 0, section: 'micro'},
	{key: 'VITA_RAE', label: 'Vitamin A', indent: 0, section: 'micro'},
	{key: 'VITC', label: 'Vitamin C', indent: 0, section: 'micro'},
	{key: 'TOCPHA', label: 'Vitamin E', indent: 0, section: 'micro'},
	{key: 'VITK1', label: 'Vitamin K', indent: 0, section: 'micro'},
	{key: 'THIA', label: 'Thiamin (B1)', indent: 0, section: 'micro'},
	{key: 'RIBF', label: 'Riboflavin (B2)', indent: 0, section: 'micro'},
	{key: 'NIA', label: 'Niacin (B3)', indent: 0, section: 'micro'},
	{key: 'VITB6A', label: 'Vitamin B6', indent: 0, section: 'micro'},
	{key: 'FOLDFE', label: 'Folate', indent: 0, section: 'micro'},
	{key: 'FOLFD', label: 'Folate (food)', indent: 1, section: 'micro'},
	{key: 'FOLAC', label: 'Folic Acid', indent: 1, section: 'micro'},
	{key: 'VITB12', label: 'Vitamin B12', indent: 0, section: 'micro'},
	{key: 'MG', label: 'Magnesium', indent: 0, section: 'micro'},
	{key: 'P', label: 'Phosphorus', indent: 0, section: 'micro'},
	{key: 'ZN', label: 'Zinc', indent: 0, section: 'micro'},
	{key: 'WATER', label: 'Water', indent: 0, section: 'micro'}
]

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function dailyPercent(daily: Record<string, NutrientAmount> | undefined, key: string) {
	const value = daily?.[key]
	if (typeof value?.quantity !== 'number' || value.unit !== '%') return undefined
	return value.quantity
}

function toRow(
	nutrients: Record<string, NutrientAmount>,
	daily: Record<string, NutrientAmount> | undefined,
	field: (typeof NUTRIENT_ROWS)[number]
): NutritionRow | null {
	const nutrient = nutrients[field.key]
	if (typeof nutrient?.quantity !== 'number' || typeof nutrient.unit !== 'string') return null

	return {
		id: field.key,
		label: field.label,
		quantity: nutrient.quantity,
		unit: nutrient.unit,
		dailyPercent: dailyPercent(daily, field.key),
		indent: field.indent
	}
}

export function edamamFoodImage(value: string) {
	try {
		const url = new URL(value)
		if (url.protocol !== 'https:' || url.hostname !== 'www.edamam.com') return undefined
		if (!url.pathname.startsWith('/food-img/')) return undefined
		return url.toString()
	} catch {
		return undefined
	}
}

export function toFoodNutrientDetails(data: unknown, foodId: string): FoodNutrientDetails | null {
	if (!isRecord(data)) return null

	const response = data as NutrientsResponse
	const parsed = response.ingredients?.[0]?.parsed?.[0]
	const nutrients = response.totalNutrients
	if (!nutrients) return null

	const calories = nutrients.ENERC_KCAL
	const mainRows: NutritionRow[] = []
	const microRows: NutritionRow[] = []

	for (const field of NUTRIENT_ROWS) {
		const row = toRow(nutrients, response.totalDaily, field)
		if (!row) continue
		if (field.section === 'main') mainRows.push(row)
		else microRows.push(row)
	}

	return {
		id: parsed?.foodId?.trim() || foodId,
		name: parsed?.food?.trim() || 'Selected food',
		calories:
			typeof calories?.quantity === 'number' && typeof calories.unit === 'string'
				? {
						quantity: calories.quantity,
						unit: calories.unit,
						dailyPercent: dailyPercent(response.totalDaily, 'ENERC_KCAL')
					}
				: null,
		mainRows,
		microRows
	}
}
