// Used to fetch the list of food items matching a query
// used in the Food Search screen

import axios from 'axios'

export default async function fetchFoodsList(query: string, signal: AbortSignal) {
	const response = await axios.get(`https://api.edamam.com/api/food-database/v2/parser`, {
		params: {
			ingr: query,
			app_id: process.env.EXPO_PUBLIC_FOOD_DATABASE_APP_ID,
			app_key: process.env.EXPO_PUBLIC_FOOD_DATABASE_API_KEY,
		},
		signal,
	})
	return response.data
}
