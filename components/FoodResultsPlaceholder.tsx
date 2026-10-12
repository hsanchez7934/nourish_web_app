import {PiBowlFoodDuotone} from 'react-icons/pi'

type FoodResultsPlaceholderProps = {
	title: string
	description: string
}

export default function FoodResultsPlaceholder({title, description}: FoodResultsPlaceholderProps) {
	return (
		<div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900 lg:min-h-[28rem]">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
				<PiBowlFoodDuotone aria-hidden="true" className="h-8 w-8" />
			</div>
			<h2 className="mt-5 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
			<p className="mt-2 max-w-sm text-sm leading-6 text-stone-600 dark:text-stone-400">
				{description}
			</p>
		</div>
	)
}
