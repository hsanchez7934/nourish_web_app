'use client'

import {useEffect, useRef, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import Breadcrumbs from '@/components/Breadcrumbs'
import FoodCard from '@/components/FoodCard'
import FoodCardSkeleton from '@/components/FoodCardSkeleton'
import FoodNutrients from '@/components/FoodNutrients'
import FoodResultsPlaceholder from '@/components/FoodResultsPlaceholder'
import FoodSearchInput from '@/components/FoodSearchInput'
import {useSessionStorage} from '@/hooks/useSessionStorage'
import type {FoodSearchResult} from '@/lib/foodSearch'
import {fade, rise, riseInList, stagger} from '@/lib/motion'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'

const FOOD_RESULTS_STORAGE_KEY = 'nourishWebAppFoodResults'
const FOOD_QUERY_STORAGE_KEY = 'nourishWebAppFoodQuery'

type SearchStatus = 'idle' | 'loading' | 'error' | 'success'

function toStoredFoods(value: unknown): FoodSearchResult[] {
	if (!Array.isArray(value)) return []

	return value.filter(
		(food): food is FoodSearchResult =>
			typeof food === 'object' &&
			food !== null &&
			typeof food.id === 'string' &&
			typeof food.name === 'string'
	)
}

function resultsSummary(query: string, foods: FoodSearchResult[]) {
	if (!query) return ''
	if (foods.length === 0) return `No foods found for “${query}”.`
	return `${foods.length} foods`
}

export default function FoodSearch() {
	const [storedFoods, setStoredFoods, , foodsHydrated] = useSessionStorage<FoodSearchResult[]>(
		FOOD_RESULTS_STORAGE_KEY,
		[]
	)
	const [submittedQuery, setSubmittedQuery, , queryHydrated] = useSessionStorage(
		FOOD_QUERY_STORAGE_KEY,
		''
	)
	const [status, setStatus] = useState<SearchStatus>('idle')
	const [message, setMessage] = useState('')
	const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null)
	const searchRequest = useRef<AbortController | null>(null)
	const resultsRef = useRef<HTMLDivElement>(null)
	const previousFoodId = useRef<string | null>(null)
	const allowResultsEntrance = useRef(false)
	const isHydrated = foodsHydrated && queryHydrated
	const foods = toStoredFoods(storedFoods)
	const persistedQuery = typeof submittedQuery === 'string' ? submittedQuery : ''

	useEffect(() => {
		if (isHydrated) allowResultsEntrance.current = true
	}, [isHydrated])

	useEffect(() => {
		const nextId = selectedFood?.id ?? null
		const previousId = previousFoodId.current
		previousFoodId.current = nextId
		if (previousId === nextId || (previousId === null && nextId === null)) return

		const panel = resultsRef.current
		if (!panel) return

		if (window.matchMedia('(min-width: 1024px)').matches) {
			panel.scrollTo({top: 0})
			return
		}

		panel.scrollIntoView({block: 'start'})
	}, [selectedFood])
	const statusText =
		status === 'loading'
			? `Searching for “${persistedQuery}”…`
			: status === 'error'
				? message
				: resultsSummary(persistedQuery, foods)

	async function handleSearch(query: string) {
		const trimmedQuery = sanitizeSearchQuery(query).trim()
		if (!trimmedQuery) return

		searchRequest.current?.abort()
		const controller = new AbortController()
		searchRequest.current = controller

		setStatus('loading')
		setMessage('')
		setSelectedFood(null)
		setStoredFoods([])
		setSubmittedQuery(trimmedQuery)

		try {
			const response = await fetch(`/api/foods?q=${encodeURIComponent(trimmedQuery)}`, {
				signal: controller.signal
			})
			const data = (await response.json().catch(() => null)) as {
				foods?: FoodSearchResult[]
				error?: string
			} | null

			if (controller.signal.aborted) return

			if (!response.ok) {
				setStatus('error')
				setMessage(data?.error ?? 'Food search failed. Try again.')
				return
			}

			const nextFoods = data?.foods ?? []
			setStoredFoods(nextFoods)
			setSubmittedQuery(trimmedQuery)
			setStatus('success')
		} catch (error) {
			if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
				return
			}

			setStatus('error')
			setMessage('Food search failed. Try again.')
		}
	}

	function handleClear() {
		searchRequest.current?.abort()
		searchRequest.current = null
		setStoredFoods([])
		setSubmittedQuery('')
		setSelectedFood(null)
		setStatus('idle')
		setMessage('')
	}

	function handleShowResults() {
		setSelectedFood(null)
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:mx-0 lg:grid lg:h-full lg:max-w-none lg:min-h-0 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-stretch lg:gap-10 lg:overflow-hidden">
			<motion.div initial="hidden" animate="show" variants={fade}>
				<header className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-4 dark:border-emerald-900/70 dark:from-emerald-950/80 dark:via-stone-900 dark:to-amber-950/30">
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
						Food search
					</p>
					<h1 className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-tight">
						<span className="text-emerald-700 dark:text-emerald-400">Search.</span>{' '}
						<span className="text-amber-700 dark:text-amber-300">See.</span>{' '}
						<span className="text-stone-900 dark:text-stone-50">Understand.</span>
					</h1>
					<p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
						Every food you look up becomes a clearer picture of the meal.
					</p>
				</header>
				<div className="mt-5">
					<FoodSearchInput
						onSearch={handleSearch}
						onClear={handleClear}
						isSearching={status === 'loading'}
						hasResults={foods.length > 0}
						submittedQuery={persistedQuery}
					/>
				</div>
			</motion.div>
			<div
				id="food-search-results"
				ref={resultsRef}
				className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1"
			>
				<AnimatePresence mode="wait">
					{selectedFood ? (
						<motion.div
							key={`nutrients-${selectedFood.id}`}
							variants={rise}
							initial={allowResultsEntrance.current ? 'hidden' : false}
							animate="show"
							exit="exit"
						>
							<Breadcrumbs
								items={[
									{label: persistedQuery || 'Results', onSelect: handleShowResults},
									{label: selectedFood.name}
								]}
							/>
							<FoodNutrients
								embedded
								foodId={selectedFood.id}
								measureURI={selectedFood.gramMeasureUri ?? ''}
								imageUrl={selectedFood.imageUrl ?? ''}
							/>
						</motion.div>
					) : (
						<motion.div key="search-results" variants={fade} initial={false} animate="show" exit="exit">
							<AnimatePresence mode="wait" initial={false}>
								{statusText ? (
									<motion.p
										key={status === 'loading' ? `loading-${persistedQuery}` : statusText}
										role="status"
										variants={fade}
										initial={allowResultsEntrance.current ? 'hidden' : false}
										animate="show"
										exit="exit"
										className="mb-2 min-h-6 text-sm text-stone-600 dark:text-stone-400"
									>
										{statusText}
									</motion.p>
								) : null}
							</AnimatePresence>
							<AnimatePresence mode="wait">
								{!isHydrated ? null : status === 'loading' ? (
									<motion.ul
										key="loading"
										variants={stagger}
										initial="hidden"
										animate="show"
										exit="exit"
										className="flex flex-col gap-3"
									>
										{Array.from({length: 4}, (_, index) => (
											<motion.li key={index} variants={rise}>
												<FoodCardSkeleton />
											</motion.li>
										))}
									</motion.ul>
								) : foods.length > 0 ? (
									<motion.ul
										key={persistedQuery}
										initial={allowResultsEntrance.current ? 'hidden' : false}
										animate="show"
										exit="exit"
										className="flex flex-col gap-3"
									>
										{foods.map((food, index) => (
											<motion.li key={`${food.id}-${index}`} custom={index} variants={riseInList}>
												<FoodCard food={food} onSelect={setSelectedFood} />
											</motion.li>
										))}
									</motion.ul>
								) : status !== 'error' ? (
									<motion.div
										key={persistedQuery ? `empty-${persistedQuery}` : 'idle'}
										variants={rise}
										initial="hidden"
										animate="show"
										exit="exit"
									>
										<FoodResultsPlaceholder
											title={persistedQuery ? 'No foods found' : 'Results will appear here'}
											description={
												persistedQuery
													? `Nothing matched “${persistedQuery}”. Try a different food name.`
													: 'Search for a food, such as apple or chicken breast, and its calories and nutrients will show up in this space.'
											}
										/>
									</motion.div>
								) : null}
							</AnimatePresence>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
