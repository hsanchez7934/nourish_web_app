// Used to fetch the nutrition analysis of a recipe
// used in the Recipe Analyzer screen

import axios from 'axios'

function ingredientLines(ingr: string | string[]) {
	if (Array.isArray(ingr)) {
		return ingr.map((line) => line.trim()).filter(Boolean)
	}

	const trimmed = ingr.trim()
	if (!trimmed) return []

	if (/\r?\n/.test(trimmed)) {
		return trimmed
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)
	}

	return trimmed
		.split(',')
		.map((line) => line.trim())
		.filter(Boolean)
}

export default async function fetchNutritionAnalysis(
	title: string,
	ingr: string | string[],
	signal?: AbortSignal
) {
	const lines = ingredientLines(ingr)
	const response = await axios.post(
		'https://api.edamam.com/api/nutrition-details',
		{
			title,
			ingr: lines,
			yield: 1
		},
		{
			params: {
				app_id: process.env.NUTRITION_DATA_APP_ID,
				app_key: process.env.NUTRITION_DATA_API_KEY
			},
			signal
		}
	)
	return response.data
}
