'use client'

import {useSyncExternalStore} from 'react'
import {motion} from 'framer-motion'
import {
	applyTheme,
	getStoredTheme,
	notifyTheme,
	setStoredTheme,
	subscribeTheme,
	type Theme
} from '@/lib/theme'
import {layoutTransition} from '@/lib/motion'

const options: {value: Theme; label: string}[] = [
	{value: 'light', label: 'Light'},
	{value: 'dark', label: 'Dark'},
	{value: 'system', label: 'System'}
]

export default function ThemeControl() {
	const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => 'system' as const)

	function selectTheme(nextTheme: Theme) {
		setStoredTheme(nextTheme)
		applyTheme(nextTheme)
		notifyTheme()
	}

	return (
		<div
			role="group"
			aria-label="Theme"
			className="flex h-8 items-center rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800"
		>
			{options.map((option) => {
				const selected = theme === option.value

				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={selected}
						onClick={() => selectTheme(option.value)}
						className={`relative rounded-md px-2.5 text-sm font-medium whitespace-nowrap ${
							selected
								? 'text-stone-900 dark:text-stone-50'
								: 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
						}`}
					>
						{selected ? (
							<motion.span
								layoutId="theme-selection"
								className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-stone-950"
								transition={layoutTransition}
							/>
						) : null}
						<span className="relative">{option.label}</span>
					</button>
				)
			})}
		</div>
	)
}
