import axios from 'axios'
import {NextRequest, NextResponse} from 'next/server'
import {toFoodSearchResults} from '@/lib/foodSearch'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'
import fetchFoodsList from '@/services/fetchFoodsList'

function isAbortError(error: unknown) {
	return (
		axios.isCancel(error) ||
		(error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError'))
	)
}

export async function GET(request: NextRequest) {
	const query = sanitizeSearchQuery(request.nextUrl.searchParams.get('q') ?? '').trim()

	if (!query) {
		return NextResponse.json({error: 'Enter a food to search.'}, {status: 400})
	}

	if (
		!process.env.FOOD_DATABASE_APP_ID ||
		!process.env.FOOD_DATABASE_API_KEY
	) {
		return NextResponse.json({error: 'Food search is not configured.'}, {status: 500})
	}

	try {
		const data = await fetchFoodsList(query, request.signal)
		return NextResponse.json({foods: toFoodSearchResults(data)})
	} catch (error) {
		if (request.signal.aborted || isAbortError(error)) {
			return new NextResponse(null, {status: 499})
		}

		return NextResponse.json({error: 'Food search failed. Try again.'}, {status: 502})
	}
}
