'use client'

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ChangeEvent,
	type FormEvent,
	type KeyboardEvent
} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import {PiBowlFoodDuotone, PiMagnifyingGlass, PiTrash} from 'react-icons/pi'
import {easeOut, fade} from '@/lib/motion'
import {sanitizeSearchQuery} from '@/lib/sanitizeSearchQuery'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type FoodSearchInputProps = {
	onSearch: (query: string) => void
	onClear: () => void
	isSearching: boolean
	hasResults: boolean
	submittedQuery: string
}

function highlightMatch(suggestion: string, query: string) {
	const needle = query.trim()
	const matchIndex = needle ? suggestion.toLowerCase().indexOf(needle.toLowerCase()) : -1

	if (matchIndex < 0) return suggestion

	const before = suggestion.slice(0, matchIndex)
	const match = suggestion.slice(matchIndex, matchIndex + needle.length)
	const after = suggestion.slice(matchIndex + needle.length)

	return (
		<>
			{before}
			<span className="font-semibold text-emerald-800 dark:text-emerald-300">{match}</span>
			{after}
		</>
	)
}

export default function FoodSearchInput({
	onSearch,
	onClear,
	isSearching,
	hasResults,
	submittedQuery
}: FoodSearchInputProps) {
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const ignoreQueryChange = useRef(false)
	const queryRef = useRef(query)
	const hasEditedQuery = useRef(false)
	queryRef.current = query
	const canSearch = query.trim().length > 0 && !isSearching
	const canClear = query.length > 0 || hasResults || isSearching
	const suggestionsOpen = isOpen && suggestions.length > 0

	useIsomorphicLayoutEffect(() => {
		if (hasEditedQuery.current || queryRef.current === submittedQuery) return

		ignoreQueryChange.current = true
		setQuery(submittedQuery)
	}, [submittedQuery])

	useEffect(() => {
		if (ignoreQueryChange.current) {
			ignoreQueryChange.current = false
			return
		}

		const trimmedQuery = sanitizeSearchQuery(query).trim()
		if (trimmedQuery.length < 2) {
			setSuggestions([])
			setIsOpen(false)
			setActiveIndex(-1)
			return
		}

		const controller = new AbortController()
		const timer = window.setTimeout(async () => {
			try {
				const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(trimmedQuery)}`, {
					signal: controller.signal
				})
				const data = (await response.json().catch(() => null)) as {
					suggestions?: string[]
				} | null

				if (controller.signal.aborted || !response.ok) return

				const nextSuggestions = Array.isArray(data?.suggestions)
					? data.suggestions.filter((item): item is string => typeof item === 'string')
					: []

				setSuggestions(nextSuggestions)
				setIsOpen(nextSuggestions.length > 0)
				setActiveIndex(-1)
			} catch (error) {
				if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
					return
				}
			}
		}, 200)

		return () => {
			window.clearTimeout(timer)
			controller.abort()
		}
	}, [query])

	useEffect(() => {
		if (!suggestionsOpen) return

		function handlePointerDown(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [suggestionsOpen])

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		hasEditedQuery.current = true
		setQuery(sanitizeSearchQuery(event.target.value))
	}

	function handleClearText() {
		setQuery('')
		setSuggestions([])
		setIsOpen(false)
		setActiveIndex(-1)
	}

	function handleClearSearch() {
		setQuery('')
		setSuggestions([])
		setIsOpen(false)
		setActiveIndex(-1)
		onClear()
	}

	function handleSelect(suggestion: string) {
		const nextQuery = sanitizeSearchQuery(suggestion).trim()
		if (!nextQuery) return

		ignoreQueryChange.current = true
		setQuery(nextQuery)
		setSuggestions([])
		setIsOpen(false)
		setActiveIndex(-1)
		onSearch(nextQuery)
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const sanitizedQuery = sanitizeSearchQuery(query).trim()
		if (!sanitizedQuery || isSearching) return
		setIsOpen(false)
		onSearch(sanitizedQuery)
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Escape') {
			setIsOpen(false)
			return
		}

		if (!suggestionsOpen) return

		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setActiveIndex((current) => (current + 1) % suggestions.length)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
		} else if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault()
			handleSelect(suggestions[activeIndex])
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<div ref={containerRef} className="flex flex-col gap-3">
				<div className="relative">
					<PiBowlFoodDuotone
						aria-hidden="true"
						className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 dark:text-stone-500"
					/>
					<input
						type="text"
						value={query}
						onChange={handleChange}
						onFocus={() => {
							if (suggestions.length > 0) setIsOpen(true)
						}}
						onKeyDown={handleKeyDown}
						placeholder="Search for a food"
						aria-label="Search for a food"
						role="combobox"
						aria-expanded={suggestionsOpen}
						aria-controls="food-suggestions"
						aria-autocomplete="list"
						aria-activedescendant={activeIndex >= 0 ? `food-suggestion-${activeIndex}` : undefined}
						autoComplete="off"
						className="h-12 w-full rounded-full border border-stone-300 bg-white pl-11 pr-11 text-base text-stone-900 shadow-sm outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
					/>
					<AnimatePresence initial={false}>
						{query.length > 0 ? (
							<motion.button
								key="clear-text"
								type="button"
								aria-label="Clear text"
								onClick={handleClearText}
								initial={{opacity: 0, scale: 0.85, y: '-50%'}}
								animate={{opacity: 1, scale: 1, y: '-50%'}}
								exit={{opacity: 0, scale: 0.85, y: '-50%'}}
								transition={{duration: 0.15, ease: easeOut}}
								className="absolute right-2 top-1/2 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
							>
								<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
									<path
										d="M5 5l10 10M15 5L5 15"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									/>
								</svg>
							</motion.button>
						) : null}
					</AnimatePresence>
				</div>
				<AnimatePresence initial={false}>
					{suggestionsOpen ? (
						<motion.div
							key="suggestions"
							variants={fade}
							initial="hidden"
							animate="show"
							exit="exit"
						>
							<p
								id="food-suggestions-label"
								className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400"
							>
								Suggestions
							</p>
							<ul
								id="food-suggestions"
								role="listbox"
								aria-labelledby="food-suggestions-label"
								className="flex flex-wrap gap-2"
							>
								<AnimatePresence initial={false} mode="popLayout">
									{suggestions.map((suggestion, index) => {
										const isActive = index === activeIndex

										return (
											<motion.li
												key={suggestion}
												role="presentation"
												layout
												initial={{opacity: 0, y: 6}}
												animate={{opacity: 1, y: 0}}
												exit={{opacity: 0, scale: 0.96}}
												transition={{
													duration: 0.18,
													ease: easeOut,
													delay: Math.min(index, 8) * 0.025
												}}
											>
												<motion.button
													id={`food-suggestion-${index}`}
													type="button"
													role="option"
													aria-selected={isActive}
													onMouseEnter={() => setActiveIndex(index)}
													onClick={() => handleSelect(suggestion)}
													whileTap={{scale: 0.98}}
													className={[
														'rounded-full border px-3 py-1.5 text-left text-sm shadow-sm transition-colors',
														isActive
															? 'border-emerald-700 bg-emerald-50 text-stone-900 dark:border-emerald-400 dark:bg-emerald-950/70 dark:text-stone-50'
															: 'border-stone-200 bg-white text-stone-700 hover:border-emerald-700 hover:bg-emerald-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/40'
													].join(' ')}
												>
													{highlightMatch(suggestion, query)}
												</motion.button>
											</motion.li>
										)
									})}
								</AnimatePresence>
							</ul>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
			<div className="flex flex-col items-start gap-2">
				<motion.button
					type="submit"
					disabled={!canSearch}
					whileTap={canSearch ? {scale: 0.985} : undefined}
					className={[
						'flex justify-center h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4',
						'text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed',
						'disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500',
						'w-full'
					].join(' ')}
				>
					<PiMagnifyingGlass aria-hidden="true" className="h-4 w-4 shrink-0" />
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={isSearching ? 'searching' : 'search'}
							initial={{opacity: 0, y: 4}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: -4}}
							transition={{duration: 0.15, ease: easeOut}}
						>
							{isSearching ? 'Searching…' : 'Search'}
						</motion.span>
					</AnimatePresence>
				</motion.button>
				<motion.button
					type="button"
					disabled={!canClear}
					onClick={handleClearSearch}
					whileTap={canClear ? {scale: 0.985} : undefined}
					className={[
						'flex items-center justify-center h-11 gap-2 rounded-xl border border-stone-300 bg-white px-4',
						'text-sm font-semibold text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed',
						'disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800',
						'w-full'
					].join(' ')}
				>
					<PiTrash aria-hidden="true" className="h-4 w-4 shrink-0" />
					Clear Search
				</motion.button>
			</div>
		</form>
	)
}
