'use client'

import {useEffect, useRef, useState, type FormEvent} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import {
	PiArrowCounterClockwise,
	PiBowlFoodDuotone,
	PiCaretDown,
	PiChartPie,
	PiLightbulbDuotone,
	PiPlus,
	PiX
} from 'react-icons/pi'
import {useSessionStorage} from '@/hooks/useSessionStorage'
import FoodResultsPlaceholder from '@/components/FoodResultsPlaceholder'
import NutritionAnalysisResults, {
	NutritionAnalysisSkeleton
} from '@/components/NutritionAnalysisResults'
import type {NutritionAnalysis} from '@/lib/nutritionAnalysis'
import {easeOut, fade, rise} from '@/lib/motion'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'

type AnalysisStatus = 'idle' | 'loading' | 'error' | 'success'

type IngredientItem = {
	id: string
	text: string
}

const MAX_INGREDIENTS = 20
const MAX_LINE_LENGTH = 160
const INGREDIENTS_STORAGE_KEY = 'nourishWebAppAnalysisIngredients'
const ANALYSIS_STORAGE_KEY = 'nourishWebAppAnalysisResult'

type StoredAnalysis = {
	analysis: NutritionAnalysis
	submittedLines: string[]
}

function linesMatch(left: string[], right: string[]) {
	return left.length === right.length && left.every((line, index) => line === right[index])
}

function toStoredIngredients(value: unknown): IngredientItem[] {
	if (!Array.isArray(value)) return []

	return value
		.filter(
			(item): item is IngredientItem =>
				typeof item === 'object' &&
				item !== null &&
				typeof item.id === 'string' &&
				typeof item.text === 'string' &&
				item.text.trim().length > 0
		)
		.slice(0, MAX_INGREDIENTS)
}

function isNutritionAnalysis(value: unknown): value is NutritionAnalysis {
	if (typeof value !== 'object' || value === null) return false

	const analysis = value as NutritionAnalysis
	return (
		typeof analysis.calories === 'number' &&
		typeof analysis.calorieUnit === 'string' &&
		Array.isArray(analysis.mainRows) &&
		Array.isArray(analysis.ingredients)
	)
}

function toStoredAnalysis(value: unknown): StoredAnalysis | null {
	if (typeof value !== 'object' || value === null) return null

	const stored = value as StoredAnalysis
	if (!isNutritionAnalysis(stored.analysis)) return null

	const submittedLines = Array.isArray(stored.submittedLines)
		? stored.submittedLines.filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
		: []

	return {analysis: stored.analysis, submittedLines}
}

export default function NutritionAnalysis() {
	const [draft, setDraft] = useState('')
	const [storedIngredients, setStoredIngredients, , ingredientsHydrated] = useSessionStorage<
		IngredientItem[]
	>(INGREDIENTS_STORAGE_KEY, [])
	const [storedResult, setStoredResult, , resultHydrated] = useSessionStorage<StoredAnalysis | null>(
		ANALYSIS_STORAGE_KEY,
		null
	)
	const [highlightedId, setHighlightedId] = useState<string | null>(null)
	const [helpOpen, setHelpOpen] = useState(false)
	const [feedback, setFeedback] = useState('')
	const [status, setStatus] = useState<AnalysisStatus>('idle')
	const [message, setMessage] = useState('')
	const analysisRequest = useRef<AbortController | null>(null)
	const allowResultsEntrance = useRef(false)
	const ingredients = toStoredIngredients(storedIngredients)
	const persistedAnalysis = toStoredAnalysis(storedResult)
	const analysis = persistedAnalysis?.analysis ?? null
	const submittedLines = persistedAnalysis?.submittedLines ?? []
	const isHydrated = ingredientsHydrated && resultHydrated
	const canAdd = draft.trim().length > 0 && ingredients.length < MAX_INGREDIENTS
	const canAnalyze = ingredients.length > 0 && status !== 'loading'
	const currentLines = ingredients.map((item) => item.text)
	const viewStatus: AnalysisStatus =
		status === 'loading' || status === 'error' ? status : analysis ? 'success' : 'idle'
	const isStale = viewStatus === 'success' && !linesMatch(currentLines, submittedLines)
	const canReset =
		draft.length > 0 || ingredients.length > 0 || analysis !== null || status !== 'idle'

	useEffect(() => {
		if (isHydrated) allowResultsEntrance.current = true
	}, [isHydrated])

	useEffect(() => {
		return () => analysisRequest.current?.abort()
	}, [])

	useEffect(() => {
		if (!highlightedId) return
		const timer = window.setTimeout(() => setHighlightedId(null), 1200)
		return () => window.clearTimeout(timer)
	}, [highlightedId])

	function handleAdd(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const line = sanitizeSearchQuery(draft).replace(/\s+/g, ' ').trim()

		if (!line) return

		if (line.length > MAX_LINE_LENGTH) {
			setFeedback('Keep each ingredient line under 160 characters.')
			return
		}

		if (ingredients.length >= MAX_INGREDIENTS) {
			setFeedback(`You can analyze up to ${MAX_INGREDIENTS} ingredients.`)
			return
		}

		const item = {id: crypto.randomUUID(), text: line}
		setStoredIngredients((current) => [...toStoredIngredients(current), item])
		setHighlightedId(item.id)
		setDraft('')
		setFeedback(`Added “${line}”.`)
	}

	function handleRemove(item: IngredientItem) {
		setStoredIngredients((current) =>
			toStoredIngredients(current).filter((ingredient) => ingredient.id !== item.id)
		)
		setFeedback(`Removed “${item.text}”.`)
	}

	function handleClearAll() {
		if (ingredients.length === 0) return
		setStoredIngredients([])
		setHighlightedId(null)
		setFeedback('Cleared all ingredients.')
	}

	function handleResetRecipe() {
		analysisRequest.current?.abort()
		analysisRequest.current = null
		setStoredIngredients([])
		setStoredResult(null)
		setStatus('idle')
		setMessage('')
		setFeedback('')
		setDraft('')
		setHighlightedId(null)
	}

	async function handleAnalyze() {
		if (ingredients.length === 0 || status === 'loading') return

		const lines = ingredients.map((item) => item.text)
		analysisRequest.current?.abort()
		const controller = new AbortController()
		analysisRequest.current = controller

		setStatus('loading')
		setMessage('')
		setStoredResult(null)

		try {
			const response = await fetch('/api/nutrition-analysis', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({title: 'Meal', ingredients: lines}),
				signal: controller.signal
			})
			const data = (await response.json().catch(() => null)) as {
				analysis?: NutritionAnalysis
				error?: string
			} | null

			if (controller.signal.aborted) return

			if (!response.ok || !data?.analysis) {
				setStatus('error')
				setMessage(data?.error ?? 'Nutrition analysis failed. Try again.')
				return
			}

			setStoredResult({analysis: data.analysis, submittedLines: lines})
			setStatus('success')
		} catch (error) {
			if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
				return
			}

			setStatus('error')
			setMessage('Nutrition analysis failed. Try again.')
		}
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:mx-0 lg:grid lg:h-full lg:max-w-none lg:min-h-0 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-stretch lg:gap-10 lg:overflow-hidden">
			<motion.div
				initial="hidden"
				animate="show"
				variants={fade}
				className="flex flex-col lg:h-full lg:min-h-0"
			>
				<div id="nutrition-analysis-search-actions-header" className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
					<header className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-4 dark:border-emerald-900/70 dark:from-emerald-950/80 dark:via-stone-900 dark:to-amber-950/30">
						<p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
							Nutrition analysis
						</p>
						<h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-tight">
							<span className="text-emerald-700 dark:text-emerald-400">List.</span>{' '}
							<span className="text-amber-700 dark:text-amber-300">Combine.</span>{' '}
							<span className="text-stone-900 dark:text-stone-50">Understand.</span>
						</h1>
						<p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
							The ingredients you add turn into a clear picture of the whole meal.
						</p>
						{/* <p className="mt-3 rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
							<span className="font-medium text-stone-800 dark:text-stone-100">Example. </span>
							100 grams turkey sausage, 2 eggs over easy, 1 English muffin, 30 grams cream cheese.
						</p> */}
					</header>
					<div className="mt-4">
						<button
							type="button"
							aria-expanded={helpOpen}
							aria-controls="ingredient-help"
							onClick={() => setHelpOpen((current) => !current)}
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
						>
							<PiCaretDown
								aria-hidden="true"
								className={`h-4 w-4 transition-transform motion-reduce:transition-none ${helpOpen ? 'rotate-180' : ''}`}
							/>
							{helpOpen ? 'Hide ingredient tips' : 'Show ingredient tips'}
						</button>
						<AnimatePresence initial={false}>
							{helpOpen ? (
								<motion.div
									id="ingredient-help"
									key="ingredient-help"
									initial={{height: 0, opacity: 0}}
									animate={{height: 'auto', opacity: 1}}
									exit={{height: 0, opacity: 0}}
									transition={{duration: 0.24, ease: easeOut}}
									className="overflow-hidden"
								>
									<div className="mt-3 flex gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-3 dark:border-emerald-900/70 dark:bg-emerald-950/40">
										<PiLightbulbDuotone
											aria-hidden="true"
											className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300"
										/>
										<div className="min-w-0 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
											<p>
												Ingredient lines are recognized most reliably when each one includes a
												quantity, a measure, and the food. For example:
											</p>
											<ul className="mt-2 list-disc space-y-1 pl-4">
												<li>1/2 avocado</li>
												<li>2 slices sourdough bread</li>
												<li>8 oz steak</li>
											</ul>
											<p className="mt-2">
												Check spelling before you analyze, so each food can be matched.
											</p>
										</div>
									</div>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>
					<form onSubmit={handleAdd} className="mt-8 flex flex-col gap-3">
						<div className="relative">
							<PiBowlFoodDuotone
								aria-hidden="true"
								className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-stone-500"
							/>
							<input
								id="nutrition-analysis-add-ingredient-input"
								type="text"
								value={draft}
								onChange={(event) => setDraft(sanitizeSearchQuery(event.target.value))}
								placeholder="1 cup brown rice"
								aria-label="Ingredient line"
								maxLength={MAX_LINE_LENGTH}
								autoComplete="off"
								className="h-12 w-full rounded-full border border-stone-300 bg-white pl-11 pr-11 text-base text-stone-900 shadow-sm outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
							/>
							<AnimatePresence initial={false}>
								{draft.length > 0 ? (
									<motion.button
										key="clear-ingredient"
										type="button"
										aria-label="Clear text"
										onClick={() => setDraft('')}
										initial={{opacity: 0, scale: 0.85, y: '-50%'}}
										animate={{opacity: 1, scale: 1, y: '-50%'}}
										exit={{opacity: 0, scale: 0.85, y: '-50%'}}
										transition={{duration: 0.15, ease: easeOut}}
										className="absolute right-2 top-1/2 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
									>
										<PiX aria-hidden="true" className="h-4 w-4" />
									</motion.button>
								) : null}
							</AnimatePresence>
						</div>
						<motion.button
							type="submit"
							disabled={!canAdd}
							whileTap={canAdd ? {scale: 0.985} : undefined}
							className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
						>
							<PiPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
							Add ingredient
						</motion.button>
					</form>
					<div className="mt-6">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
								Ingredient list
							</h2>
							<div className="flex items-center gap-2">
								<p className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
									{ingredients.length}
								</p>
								<button
									type="button"
									onClick={handleClearAll}
									disabled={ingredients.length === 0}
									className="rounded-full px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"
								>
									Clear all
								</button>
							</div>
						</div>
						{feedback ? (
							<p role="status" className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
								{feedback}
							</p>
						) : null}
						<div className="mt-3">
							{!ingredientsHydrated ? null : ingredients.length === 0 ? (
								<p className="rounded-xl border border-dashed border-stone-300 px-4 py-5 text-sm leading-6 text-stone-500 dark:border-stone-700 dark:text-stone-400">
									Added ingredients show up here, ready to submit for analysis.
								</p>
							) : (
								<ul aria-label="Ingredients ready to analyze" className="flex flex-col gap-2">
									<AnimatePresence initial={false}>
										{ingredients.map((item) => {
											const isHighlighted = item.id === highlightedId

											return (
												<motion.li
													key={item.id}
													layout
													initial={{opacity: 0, y: 8}}
													animate={{opacity: 1, y: 0}}
													exit={{opacity: 0, y: -4}}
													transition={{duration: 0.2, ease: easeOut}}
													className={[
														'flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm dark:bg-stone-900',
														isHighlighted
															? 'border-emerald-600 ring-2 ring-emerald-600/20 dark:border-emerald-400 dark:ring-emerald-400/20'
															: 'border-stone-200 dark:border-stone-800'
													].join(' ')}
												>
													<span className="min-w-0 flex-1 text-sm text-stone-800 dark:text-stone-100">
														{item.text}
													</span>
													<button
														type="button"
														aria-label={`Remove ${item.text}`}
														onClick={() => handleRemove(item)}
														className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
													>
														<PiX aria-hidden="true" className="h-4 w-4" />
													</button>
												</motion.li>
											)
										})}
									</AnimatePresence>
								</ul>
							)}
						</div>
					</div>
				</div>
				<div className="mt-4 flex shrink-0 flex-col gap-2">
				<motion.button
					type="button"
					disabled={!canAnalyze}
					onClick={handleAnalyze}
					whileTap={canAnalyze ? {scale: 0.985} : undefined}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
				>
					<PiChartPie aria-hidden="true" className="h-4 w-4 shrink-0" />
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={status === 'loading' ? 'analyzing' : 'analyze'}
							initial={{opacity: 0, y: 4}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: -4}}
							transition={{duration: 0.15, ease: easeOut}}
						>
							{status === 'loading' ? 'Analyzing…' : 'Analyze'}
						</motion.span>
					</AnimatePresence>
				</motion.button>
				<motion.button
					type="button"
					disabled={!canReset}
					onClick={handleResetRecipe}
					whileTap={canReset ? {scale: 0.985} : undefined}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
				>
					<PiArrowCounterClockwise aria-hidden="true" className="h-4 w-4 shrink-0" />
					Reset recipe
				</motion.button>
				</div>
			</motion.div>
			<div className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
				<AnimatePresence mode="wait">
					{!resultHydrated ? null : viewStatus === 'loading' ? (
						<motion.div key="loading" variants={fade} initial="hidden" animate="show" exit="exit">
							<p role="status" className="mb-3 text-sm text-stone-600 dark:text-stone-400">
								Analyzing your meal…
							</p>
							<NutritionAnalysisSkeleton />
						</motion.div>
					) : viewStatus === 'error' ? (
						<motion.div
							key="error"
							role="alert"
							variants={rise}
							initial="hidden"
							animate="show"
							exit="exit"
							className="rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm dark:border-stone-800 dark:bg-stone-900"
						>
							<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
								Analysis failed
							</h2>
							<p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{message}</p>
						</motion.div>
					) : analysis ? (
						<motion.div
							key={submittedLines.join('\n')}
							variants={rise}
							initial={allowResultsEntrance.current ? 'hidden' : false}
							animate="show"
							exit="exit"
						>
							<NutritionAnalysisResults analysis={analysis} isStale={isStale} />
						</motion.div>
					) : (
						<motion.div key="idle" variants={rise} initial="hidden" animate="show" exit="exit">
							<FoodResultsPlaceholder
								title="Nutrition details will appear here"
								description="Add at least one ingredient, then analyze the meal. Calories, macros, and nutrients will show up in this space."
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
