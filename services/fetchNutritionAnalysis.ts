// Used to fetch the nutrition analysis of a recipe
// used in the Recipe Analyzer screen

import axios from 'axios'

export default async function fetchNutritionAnalysis(title: string, ingr: string) {
	const response = await axios.get('https://api.edamam.com/api/nutrition-data', {
		params: {
			title,
			ingr,
			app_id: process.env.NUTRITION_DATA_APP_ID,
			app_key: process.env.NUTRITION_DATA_API_KEY,
			'nutrition-type': 'analysis',
		},
	})
	return response.data
}
