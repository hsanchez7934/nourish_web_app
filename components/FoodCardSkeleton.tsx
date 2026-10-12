export default function FoodCardSkeleton() {
	return (
		<div
			aria-hidden="true"
			className="flex animate-pulse gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm motion-reduce:animate-none dark:border-stone-800 dark:bg-stone-900"
		>
			<div className="h-20 w-20 shrink-0 rounded-lg bg-stone-200 dark:bg-stone-800" />
			<div className="min-w-0 flex-1">
				<div className="h-4 w-36 rounded bg-stone-200 dark:bg-stone-800" />
				<div className="mt-2 h-3 w-24 rounded bg-stone-200 dark:bg-stone-800" />
				<div className="mt-4 flex flex-wrap gap-2">
					<div className="h-7 w-24 rounded-full bg-stone-200 dark:bg-stone-800" />
					<div className="h-7 w-20 rounded-full bg-stone-200 dark:bg-stone-800" />
					<div className="h-7 w-20 rounded-full bg-stone-200 dark:bg-stone-800" />
				</div>
			</div>
		</div>
	)
}
