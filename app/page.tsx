import Link from 'next/link'
import {PiMagnifyingGlass} from 'react-icons/pi'

export default function HomePage() {
	return (
		<main className="min-h-screen bg-stone-50 px-4 pb-16 pt-24 dark:bg-stone-950 lg:px-8">
			<div className="mx-auto flex w-full max-w-xl flex-col items-start pt-6">
				<p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Nourish</p>
				<h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
					Home
				</h1>
				<p className="mt-3 text-base leading-relaxed text-stone-600 dark:text-stone-400">
					Look up a food to see its calories and nutrients. A fuller home view is coming later.
				</p>
				<Link
					href="/food-search"
					className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
				>
					<PiMagnifyingGlass aria-hidden="true" className="h-5 w-5" />
					Search foods
				</Link>
			</div>
		</main>
	)
}
