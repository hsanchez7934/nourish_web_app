import axios from 'axios'
import {NextRequest, NextResponse} from 'next/server'
import {toFoodNutrientDetails} from '@/lib/foodNutrients'
import fetchFoodNutrients from '@/services/fetchFoodNutrients'

const QUANTITY_GRAMS = 100

function isAbortError(error: unknown) {
	return (
		axios.isCancel(error) ||
		(error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError'))
	)
}

export async function GET(request: NextRequest) {
	const foodId = request.nextUrl.searchParams.get('foodId')?.trim() ?? ''
	const measureURI = request.nextUrl.searchParams.get('measureURI')?.trim() ?? ''

	if (!foodId || !measureURI) {
		return NextResponse.json({error: 'A food and gram measure are required.'}, {status: 400})
	}

	if (!/^https?:\/\//i.test(measureURI)) {
		return NextResponse.json({error: 'The gram measure is invalid.'}, {status: 400})
	}

	if (!process.env.FOOD_DATABASE_APP_ID || !process.env.FOOD_DATABASE_API_KEY) {
		return NextResponse.json({error: 'Food nutrients are not configured.'}, {status: 500})
	}

	try {
		const data = await fetchFoodNutrients(foodId, QUANTITY_GRAMS, measureURI, request.signal)
		const food = toFoodNutrientDetails(data, foodId)

		if (!food) {
			return NextResponse.json({error: 'Food nutrients could not be read.'}, {status: 502})
		}

		return NextResponse.json({food})
	} catch (error) {
		if (request.signal.aborted || isAbortError(error)) {
			return new NextResponse(null, {status: 499})
		}

		return NextResponse.json({error: 'Food nutrients failed to load. Try again.'}, {status: 502})
	}
}
