'use client'

import {useRef, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import FoodCard from '@/components/FoodCard'
import FoodCardSkeleton from '@/components/FoodCardSkeleton'
import FoodResultsPlaceholder from '@/components/FoodResultsPlaceholder'
import FoodSearchInput from '@/components/FoodSearchInput'
import type {FoodSearchResult} from '@/lib/foodSearch'
import {fade, rise, riseInList, stagger} from '@/lib/motion'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'

type SearchStatus = 'idle' | 'loading' | 'error' | 'success'

export default function FoodSearch() {
	const [foods, setFoods] = useState<FoodSearchResult[]>([])
	const [status, setStatus] = useState<SearchStatus>('idle')
	const [message, setMessage] = useState('')
	const [submittedQuery, setSubmittedQuery] = useState('')
	const searchRequest = useRef<AbortController | null>(null)

	async function handleSearch(query: string) {
		const trimmedQuery = sanitizeSearchQuery(query).trim()
		if (!trimmedQuery) return

		searchRequest.current?.abort()
		const controller = new AbortController()
		searchRequest.current = controller

		setStatus('loading')
		setMessage('')
		setFoods([])
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
			setFoods(nextFoods)
			setStatus('success')
			setMessage(
				nextFoods.length === 0
					? `No foods found for “${trimmedQuery}”.`
					: `${nextFoods.length} foods`
			)
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
		setFoods([])
		setStatus('idle')
		setMessage('')
		setSubmittedQuery('')
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:mx-0 lg:grid lg:h-full lg:max-w-none lg:min-h-0 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-stretch lg:gap-10 lg:overflow-hidden">
			<motion.div initial="hidden" animate="show" variants={fade}>
				<p className="text-stone-600 dark:text-stone-400">
					Search for a food to look up its nutrition.
				</p>
				<div className="mt-8">
					<FoodSearchInput
						onSearch={handleSearch}
						onClear={handleClear}
						isSearching={status === 'loading'}
						hasResults={foods.length > 0}
					/>
				</div>
			</motion.div>
			<div className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
				<AnimatePresence mode="wait" initial={false}>
					{status === 'loading' || message ? (
						<motion.p
							key={status === 'loading' ? `loading-${submittedQuery}` : message}
							role="status"
							variants={fade}
							initial="hidden"
							animate="show"
							exit="exit"
							className="mb-2 min-h-6 text-sm text-stone-600 dark:text-stone-400"
						>
							{status === 'loading' ? `Searching for “${submittedQuery}”…` : message}
						</motion.p>
					) : null}
				</AnimatePresence>
				<AnimatePresence mode="wait">
					{status === 'loading' ? (
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
							key={submittedQuery}
							initial="hidden"
							animate="show"
							exit="exit"
							className="flex flex-col gap-3"
						>
							{foods.map((food, index) => (
								<motion.li key={`${food.id}-${index}`} custom={index} variants={riseInList}>
									<FoodCard food={food} />
								</motion.li>
							))}
						</motion.ul>
					) : status !== 'error' ? (
						<motion.div
							key={status === 'idle' ? 'idle' : `empty-${submittedQuery}`}
							variants={rise}
							initial="hidden"
							animate="show"
							exit="exit"
						>
							<FoodResultsPlaceholder
								title={status === 'idle' ? 'Results will appear here' : 'No foods found'}
								description={
									status === 'idle'
										? 'Search for a food, such as apple or chicken breast, and its calories and nutrients will show up in this space.'
										: `Nothing matched “${submittedQuery}”. Try a different food name.`
								}
							/>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</div>
	)
}
