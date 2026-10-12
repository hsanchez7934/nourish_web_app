// Used to auto-complete ingredients in the Food Search screen

import axios from 'axios'

export default async function autoCompleteIngredients(query: string) {
	const response = await axios.get(`https://api.edamam.com/auto-complete`, {
		params: {
			q: query,
			app_id: process.env.EXPO_PUBLIC_FOOD_DATABASE_APP_ID,
			app_key: process.env.EXPO_PUBLIC_FOOD_DATABASE_API_KEY,
		},
	})
	return response.data
}
