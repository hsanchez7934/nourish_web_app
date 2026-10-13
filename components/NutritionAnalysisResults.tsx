'use client'

import {useState} from 'react'
import {motion} from 'framer-motion'
import type {CalorieSource, NutritionAnalysis, ParsedFood} from '@/lib/nutritionAnalysis'
import type {NutritionRow} from '@/lib/foodNutrients'
import {easeOut, rise} from '@/lib/motion'

const HIGHLIGHT_MACROS = [
	{id: 'PROCNT', label: 'Protein'},
	{id: 'CHOCDF', label: 'Carbs'},
	{id: 'FAT', label: 'Fat'},
	{id: 'FIBTG', label: 'Fiber'}
] as const

const SOURCE_COLORS: Record<string, string> = {
	protein: 'bg-emerald-600',
	carbs: 'bg-sky-500',
	fat: 'bg-amber-500'
}

const VISIBLE_HEALTH_LABELS = 8

function formatQuantity(quantity: number, unit: string) {
	if (quantity === 0) return '0'

	const normalized = unit.toLowerCase()
	let digits = 1
	if (normalized === 'kcal' || normalized === '%' || normalized === '')
		digits = quantity % 1 === 0 ? 0 : 2
	else if (Math.abs(quantity) < 1) digits = 2

	return new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(quantity)
}

function formatPercent(value: number) {
	const digits = value > 0 && value < 10 ? 1 : 0
	return `${new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(value)}%`
}

function formatWeight(grams: number) {
	const digits = grams >= 100 ? 0 : 1
	return `${new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(grams)} g`
}

function formatTag(value: string) {
	if (value.toUpperCase() === 'FODMAP') return 'FODMAP'
	if (value === 'LOW_FAT_ABS') return 'Low fat'

	return value
		.split('_')
		.filter(Boolean)
		.map((word) => {
			if (word.toUpperCase() === 'FODMAP') return 'FODMAP'
			const lower = word.toLowerCase()
			return lower.charAt(0).toUpperCase() + lower.slice(1)
		})
		.join(' ')
}

function displayName(name: string) {
	return name.charAt(0).toUpperCase() + name.slice(1)
}

function rowMotion(index: number) {
	return {
		hidden: {opacity: 0, y: 6},
		show: {
			opacity: 1,
			y: 0,
			transition: {duration: 0.22, ease: easeOut, delay: Math.min(index, 8) * 0.025}
		}
	}
}

function sourceShares(sources: CalorieSource[]) {
	const total = sources.reduce((sum, source) => sum + Math.max(source.quantity, 0), 0)
	return sources.map((source) => ({
		...source,
		share: total > 0 ? (Math.max(source.quantity, 0) / total) * 100 : 0
	}))
}

function NutrientRow({row, index}: {row: NutritionRow; index: number}) {
	const indent = row.indent === 2 ? 'pl-8' : row.indent === 1 ? 'pl-4' : ''
	const weight =
		row.indent === 0
			? 'font-semibold text-stone-900 dark:text-stone-50'
			: 'font-normal text-stone-600 dark:text-stone-300'

	return (
		<motion.div
			variants={rowMotion(index)}
			className={`border-b border-stone-100 py-2.5 last:border-b-0 dark:border-stone-800 ${indent}`}
		>
			<div className="flex items-baseline justify-between gap-3">
				<dt className={weight}>{row.label}</dt>
				<dd className="flex shrink-0 items-baseline gap-2 tabular-nums">
					<span className="text-stone-800 dark:text-stone-100">
						{formatQuantity(row.quantity, row.unit)} {row.unit}
					</span>
					{row.dailyPercent == null ? null : (
						<span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
							{formatPercent(row.dailyPercent)}
						</span>
					)}
				</dd>
			</div>
		</motion.div>
	)
}

function NutrientGroup({title, rows}: {title: string; rows: NutritionRow[]}) {
	if (rows.length === 0) return null

	return (
		<section className="rounded-2xl border border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:px-5">
			<h3 className="border-b border-stone-100 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:text-stone-400">
				{title}
			</h3>
			<motion.dl initial="hidden" animate="show">
				{rows.map((row, index) => (
					<NutrientRow key={row.id} row={row} index={index} />
				))}
			</motion.dl>
		</section>
	)
}

function LabelGroup({
	title,
	labels,
	tone
}: {
	title: string
	labels: string[]
	tone: 'emerald' | 'amber' | 'stone'
}) {
	if (labels.length === 0) return null

	const chip =
		tone === 'emerald'
			? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
			: tone === 'amber'
				? 'bg-amber-50 text-amber-950 dark:bg-amber-950/70 dark:text-amber-100'
				: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200'

	return (
		<div>
			<h3 className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
				{title}
			</h3>
			<ul className="mt-2 flex flex-wrap gap-2">
				{labels.map((label) => (
					<li key={label} className={`rounded-full px-2.5 py-1 text-xs font-medium ${chip}`}>
						{formatTag(label)}
					</li>
				))}
			</ul>
		</div>
	)
}

function FoodMatch({food}: {food: ParsedFood}) {
	const amount = [formatQuantity(food.quantity, ''), food.measure].filter(Boolean).join(' ')

	return (
		<div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
			<p className="min-w-0 text-stone-700 dark:text-stone-200">
				{amount ? <span className="text-stone-500 dark:text-stone-400">{amount} </span> : null}
				{displayName(food.food)}
			</p>
			{food.weight > 0 ? (
				<p className="shrink-0 tabular-nums text-stone-500 dark:text-stone-400">
					{formatWeight(food.weight)}
				</p>
			) : null}
		</div>
	)
}

export function NutritionAnalysisSkeleton() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-4">
			<div className="h-36 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
			<div className="grid grid-cols-2 gap-3">
				{Array.from({length: 4}, (_, index) => (
					<div
						key={index}
						className="h-24 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800"
					/>
				))}
			</div>
			<div className="h-28 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
			<div className="h-40 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
		</div>
	)
}

export default function NutritionAnalysisResults({
	analysis,
	isStale
}: {
	analysis: NutritionAnalysis
	isStale: boolean
}) {
	const [showAllHealth, setShowAllHealth] = useState(false)
	const highlights = HIGHLIGHT_MACROS.flatMap((macro) => {
		const row = analysis.mainRows.find((item) => item.id === macro.id)
		return row ? [{...row, label: macro.label}] : []
	})
	const sources = sourceShares(analysis.calorieSources)
	const healthLabels = showAllHealth
		? analysis.healthLabels
		: analysis.healthLabels.slice(0, VISIBLE_HEALTH_LABELS)
	const hiddenHealthCount = analysis.healthLabels.length - healthLabels.length

	return (
		<article className="flex flex-col gap-6">
			{isStale ? (
				<p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-100">
					The ingredient list has changed. Analyze again to refresh these results.
				</p>
			) : null}
			<section aria-label="Calories and macros">
				<div className="flex items-end justify-between gap-3">
					<p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
						Whole meal
					</p>
					{analysis.totalWeight > 0 ? (
						<p className="text-sm tabular-nums text-stone-500 dark:text-stone-400">
							{formatWeight(analysis.totalWeight)}
						</p>
					) : null}
				</div>
				<div className="mt-3 grid gap-3 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
					<motion.div
						variants={rise}
						initial="hidden"
						animate="show"
						className="flex flex-col justify-between rounded-2xl bg-emerald-700 px-5 py-5 text-white shadow-sm dark:bg-emerald-600"
					>
						<p className="text-sm font-medium text-emerald-100">Calories</p>
						<p className="mt-3 text-5xl font-semibold tracking-tight tabular-nums">
							{formatQuantity(analysis.calories, analysis.calorieUnit)}
						</p>
						<p className="mt-1 text-sm text-emerald-100">
							{analysis.calorieUnit}
							{analysis.calorieDailyPercent == null
								? ''
								: ` · ${formatPercent(analysis.calorieDailyPercent)} daily`}
						</p>
					</motion.div>
					<motion.dl initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
						{highlights.map((macro, index) => (
							<motion.div
								key={macro.id}
								variants={rowMotion(index)}
								className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
							>
								<dt className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
									{macro.label}
								</dt>
								<dd className="mt-2 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">
									{formatQuantity(macro.quantity, macro.unit)}
									<span className="ml-1 text-sm font-medium text-stone-500 dark:text-stone-400">
										{macro.unit}
									</span>
								</dd>
								{macro.dailyPercent == null ? null : (
									<dd className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
										{formatPercent(macro.dailyPercent)} daily
									</dd>
								)}
							</motion.div>
						))}
					</motion.dl>
				</div>
			</section>
			{sources.length > 0 ? (
				<section className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:px-5">
					<h3 className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
						Calories from
					</h3>
					<div className="mt-3 flex h-3 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
						{sources.map((source) => (
							<motion.div
								key={source.id}
								initial={{width: 0}}
								animate={{width: `${source.share}%`}}
								transition={{duration: 0.45, ease: easeOut}}
								className={SOURCE_COLORS[source.id] ?? 'bg-stone-400'}
							/>
						))}
					</div>
					<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
						{sources.map((source) => (
							<li
								key={source.id}
								className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200"
							>
								<span
									aria-hidden="true"
									className={`h-2.5 w-2.5 rounded-full ${SOURCE_COLORS[source.id] ?? 'bg-stone-400'}`}
								/>
								<span>
									{source.label}{' '}
									<span className="tabular-nums text-stone-500 dark:text-stone-400">
										{formatQuantity(source.quantity, source.unit)} {source.unit}
									</span>
								</span>
							</li>
						))}
					</ul>
				</section>
			) : null}
			{analysis.dietLabels.length > 0 ||
			analysis.cautions.length > 0 ||
			analysis.healthLabels.length > 0 ? (
				<section className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:px-5">
					<div className="flex flex-col gap-4">
						<LabelGroup title="Diet" labels={analysis.dietLabels} tone="emerald" />
						<LabelGroup title="Cautions" labels={analysis.cautions} tone="amber" />
						<LabelGroup title="Health" labels={healthLabels} tone="stone" />
						{hiddenHealthCount > 0 ||
						(showAllHealth && analysis.healthLabels.length > VISIBLE_HEALTH_LABELS) ? (
							<button
								type="button"
								onClick={() => setShowAllHealth((current) => !current)}
								className="self-start text-sm font-semibold text-emerald-800 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
							>
								{showAllHealth ? 'Show fewer health labels' : `Show ${hiddenHealthCount} more`}
							</button>
						) : null}
					</div>
				</section>
			) : null}
			{analysis.ingredients.length > 0 ? (
				<section>
					<h3 className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
						Recognized ingredients
					</h3>
					<ul className="mt-3 flex flex-col gap-2">
						{analysis.ingredients.map((ingredient, index) => (
							<motion.li
								key={`${ingredient.text}-${index}`}
								custom={index}
								variants={rowMotion(index)}
								initial="hidden"
								animate="show"
								className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm dark:border-stone-800 dark:bg-stone-900"
							>
								<p className="text-sm font-medium text-stone-900 dark:text-stone-50">
									{ingredient.text}
								</p>
								{ingredient.foods.length > 0 ? (
									ingredient.foods.map((food) => (
										<FoodMatch key={`${food.food}-${food.weight}`} food={food} />
									))
								) : (
									<p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
										This line was not recognized. Check the spelling and quantity.
									</p>
								)}
							</motion.li>
						))}
					</ul>
				</section>
			) : null}
			<NutrientGroup title="Nutrients" rows={analysis.mainRows} />
			<NutrientGroup title="Vitamins & minerals" rows={analysis.microRows} />
		</article>
	)
}
