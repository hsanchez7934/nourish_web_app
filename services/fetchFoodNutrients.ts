// Used to fetch the nutrients of a food item, used in the Food Details screen
// food nutrients are fetched using the food id and the measure uri

import axios from 'axios'

export default async function fetchFoodNutrients(
	foodId: string,
	quantity: number = 1,
	measureURI: string
): Promise<any> {
	const response = await axios.post(
		`https://api.edamam.com/api/food-database/v2/nutrients`,
		{
			ingredients: [
				{
					quantity,
					measureURI,
					foodId,
				},
			],
		},
		{
			params: {
				app_id: process.env.EXPO_PUBLIC_FOOD_DATABASE_APP_ID,
				app_key: process.env.EXPO_PUBLIC_FOOD_DATABASE_API_KEY,
			},
		}
	)
	return response.data
}
