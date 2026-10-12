// Used to auto-complete ingredients in the Food Search screen

import axios from 'axios'

export default async function autoCompleteIngredients(query: string, signal?: AbortSignal): Promise<string[]> {
	const response = await axios.get<unknown>(`https://api.edamam.com/auto-complete`, {
		params: {
			q: query,
			app_id: process.env.FOOD_DATABASE_APP_ID,
			app_key: process.env.FOOD_DATABASE_API_KEY
		},
		signal
	})
	return response.data
}
