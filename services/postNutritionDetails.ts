// Used to post the nutrition details of a recipe
// used in the Recipe Analyzer screen

import axios from 'axios'

export default async function postNutritionDetails(title: string, ingr: string[]) {
	// add request body, I need to add title and ingr to the request body
	const requestBody = {
		title,
		ingr,
	}

	const response = await axios.post('https://api.edamam.com/api/nutrition-details', requestBody, {
		params: {
			app_id: process.env.NUTRITION_DATA_APP_ID,
			app_key: process.env.NUTRITION_DATA_API_KEY,
		},
	})
	return response.data
}
