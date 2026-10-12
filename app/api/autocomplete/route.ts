import axios from 'axios'
import {NextRequest, NextResponse} from 'next/server'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'
import autoCompleteIngredients from '@/services/autoCompleteIngredients'

function isAbortError(error: unknown) {
	return (
		axios.isCancel(error) ||
		(error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError'))
	)
}

function toSuggestions(data: unknown) {
	if (!Array.isArray(data)) return []

	const suggestions: string[] = []
	const seen = new Set<string>()

	for (const item of data) {
		if (typeof item !== 'string') continue
		const suggestion = sanitizeSearchQuery(item).trim()
		const key = suggestion.toLowerCase()
		if (!suggestion || seen.has(key)) continue
		seen.add(key)
		suggestions.push(suggestion)
	}

	return suggestions.slice(0, 10)
}

export async function GET(request: NextRequest) {
	const query = sanitizeSearchQuery(request.nextUrl.searchParams.get('q') ?? '').trim()

	if (query.length < 2) {
		return NextResponse.json({suggestions: []})
	}

	if (
		!process.env.FOOD_DATABASE_APP_ID ||
		!process.env.FOOD_DATABASE_API_KEY
	) {
		return NextResponse.json({error: 'Food search is not configured.'}, {status: 500})
	}

	try {
		const data = await autoCompleteIngredients(query, request.signal)
		return NextResponse.json({suggestions: toSuggestions(data)})
	} catch (error) {
		if (request.signal.aborted || isAbortError(error)) {
			return new NextResponse(null, {status: 499})
		}

		return NextResponse.json({error: 'Suggestions are unavailable right now.'}, {status: 502})
	}
}
