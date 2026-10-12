// Used to fetch the list of food items matching a query
// used in the Food Search screen

import axios from 'axios'

export type FoodNutrients = {
	ENERC_KCAL?: number
	PROCNT?: number
	FAT?: number
	CHOCDF?: number
	FIBTG?: number
}

export type EdamamFood = {
	foodId: string
	label: string
	knownAs?: string
	nutrients?: FoodNutrients
	category?: string
	categoryLabel?: string
	image?: string
	brand?: string
}

export type EdamamMeasure = {
	uri?: string
	label?: string
	weight?: number
}

export type EdamamFoodItem = {
	food?: EdamamFood
	measures?: EdamamMeasure[]
}

export type FoodsParserResponse = {
	text?: string
	count?: number
	hints?: EdamamFoodItem[]
	parsed?: EdamamFoodItem[]
}

export default async function fetchFoodsList(query: string, signal: AbortSignal) {
	const response = await axios.get<FoodsParserResponse>(
		'https://api.edamam.com/api/food-database/v2/parser',
		{
			params: {
				ingr: query,
				app_id: process.env.FOOD_DATABASE_APP_ID,
				app_key: process.env.FOOD_DATABASE_API_KEY
			},
			signal
		}
	)
	return response.data
}
