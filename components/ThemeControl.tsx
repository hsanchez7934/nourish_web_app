'use client'

import {useEffect, useSyncExternalStore} from 'react'
import {motion} from 'framer-motion'
import {applyTheme, getStoredTheme, setStoredTheme, type Theme} from '@/lib/theme'
import {layoutTransition} from '@/lib/motion'

const options: {value: Theme; label: string}[] = [
	{value: 'light', label: 'Light'},
	{value: 'dark', label: 'Dark'},
	{value: 'system', label: 'System'}
]

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function notify() {
	listeners.forEach((listener) => listener())
}

export default function ThemeControl() {
	const theme = useSyncExternalStore(subscribe, getStoredTheme, () => 'system' as const)

	useEffect(() => {
		applyTheme(theme)

		if (theme !== 'system') return

		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const onChange = () => applyTheme('system')
		media.addEventListener('change', onChange)
		return () => media.removeEventListener('change', onChange)
	}, [theme])

	function selectTheme(nextTheme: Theme) {
		setStoredTheme(nextTheme)
		applyTheme(nextTheme)
		notify()
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
