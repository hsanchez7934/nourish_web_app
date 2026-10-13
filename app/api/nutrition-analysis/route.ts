import axios from 'axios'
import {NextRequest, NextResponse} from 'next/server'
import {toNutritionAnalysis} from '@/lib/nutritionAnalysis'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'
import fetchNutritionAnalysis from '@/services/fetchNutritionAnalysis'

const MAX_INGREDIENTS = 20
const MAX_LINE_LENGTH = 160

function isAbortError(error: unknown) {
	return (
		axios.isCancel(error) ||
		(error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError'))
	)
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function readIngredients(value: unknown) {
	if (!Array.isArray(value)) return null

	const lines: string[] = []
	for (const item of value) {
		if (typeof item !== 'string') return null
		const line = sanitizeSearchQuery(item).replace(/\s+/g, ' ').trim()
		if (!line || line.length > MAX_LINE_LENGTH) return null
		lines.push(line)
	}

	if (lines.length === 0 || lines.length > MAX_INGREDIENTS) return null
	return lines
}

function analysisErrorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		const body = error.response?.data
		if (error.response?.status === 555 || (isRecord(body) && body.error === 'low_quality')) {
			return 'These ingredients could not be analyzed. Use a quantity with each food, and check the spelling.'
		}
	}

	return 'Nutrition analysis failed. Try again.'
}

export async function POST(request: NextRequest) {
	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({error: 'Add at least one ingredient.'}, {status: 400})
	}

	const ingredients = readIngredients(isRecord(body) ? body.ingredients : null)
	if (!ingredients) {
		return NextResponse.json({error: 'Add at least one ingredient line.'}, {status: 400})
	}

	const titleSource =
		isRecord(body) && typeof body.title === 'string' ? sanitizeSearchQuery(body.title).trim() : ''
	const title = (titleSource || 'Meal').slice(0, 80)

	if (!process.env.NUTRITION_DATA_APP_ID || !process.env.NUTRITION_DATA_API_KEY) {
		return NextResponse.json({error: 'Nutrition analysis is not configured.'}, {status: 500})
	}

	try {
		const data = await fetchNutritionAnalysis(title, ingredients, request.signal)
		const analysis = toNutritionAnalysis(data)

		if (!analysis) {
			return NextResponse.json({error: 'Nutrition analysis could not be read.'}, {status: 502})
		}

		return NextResponse.json({analysis})
	} catch (error) {
		if (request.signal.aborted || isAbortError(error)) {
			return new NextResponse(null, {status: 499})
		}

		return NextResponse.json({error: analysisErrorMessage(error)}, {status: 502})
	}
}
