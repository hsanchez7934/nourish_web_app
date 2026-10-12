'use client'

import {motion} from 'framer-motion'
import type {FoodNutrientDetails, NutritionRow} from '@/lib/foodNutrients'
import {easeOut, rise} from '@/lib/motion'

const HIGHLIGHT_MACROS = [
	{id: 'PROCNT', label: 'Protein'},
	{id: 'CHOCDF', label: 'Carbs'},
	{id: 'FAT', label: 'Fat'},
	{id: 'FIBTG', label: 'Fiber'}
] as const

function formatQuantity(quantity: number, unit: string) {
	if (quantity === 0) return '0'

	const normalized = unit.toLowerCase()
	let digits = 1
	if (normalized === 'kcal' || normalized === '%') digits = 0
	else if (Math.abs(quantity) < 1) digits = 2

	return new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(quantity)
}

function formatPercent(value: number) {
	return `${new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(value)}%`
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
			<h2 className="border-b border-stone-100 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:text-stone-400">
				{title}
			</h2>
			<motion.dl initial="hidden" animate="show">
				{rows.map((row, index) => (
					<NutrientRow key={row.id} row={row} index={index} />
				))}
			</motion.dl>
		</section>
	)
}

export default function NutritionFacts({food}: {food: FoodNutrientDetails}) {
	const highlights = HIGHLIGHT_MACROS.flatMap((macro) => {
		const row = food.mainRows.find((item) => item.id === macro.id)
		return row ? [{...row, label: macro.label}] : []
	})

	return (
		<div className="mt-8 flex flex-col gap-6">
			<section aria-label="Calories and macros">
				<p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
					Per 100 g
				</p>
				<div className="mt-3 grid gap-3 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
					{food.calories ? (
						<motion.div
							variants={rise}
							initial="hidden"
							animate="show"
							className="flex flex-col justify-between rounded-2xl bg-emerald-700 px-5 py-5 text-white shadow-sm dark:bg-emerald-600"
						>
							<p className="text-sm font-medium text-emerald-100">Calories</p>
							<p className="mt-3 text-5xl font-semibold tracking-tight tabular-nums">
								{formatQuantity(food.calories.quantity, food.calories.unit)}
							</p>
							<p className="mt-1 text-sm text-emerald-100">{food.calories.unit}</p>
						</motion.div>
					) : null}
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
							</motion.div>
						))}
					</motion.dl>
				</div>
			</section>
			<NutrientGroup title="Nutrients" rows={food.mainRows} />
			<NutrientGroup title="Vitamins & minerals" rows={food.microRows} />
		</div>
	)
}
