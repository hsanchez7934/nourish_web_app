'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useRef, useState} from 'react'
import {PiUser} from 'react-icons/pi'
import ThemeControl from '@/components/ThemeControl'
import {fadeTransition} from '@/lib/motion'

export default function UserMenu() {
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		function onPointerDown(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={containerRef}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls="user-menu"
				aria-label={open ? 'Close user menu' : 'Open user menu'}
				onClick={() => setOpen((current) => !current)}
				className={[
					'flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-stone-200 dark:hover:bg-stone-800',
					open ? 'bg-stone-100 dark:bg-stone-800' : ''
				].join(' ')}
			>
				<PiUser aria-hidden="true" className="h-5 w-5" />
			</button>
			<AnimatePresence>
				{open ? (
					<motion.div
						id="user-menu"
						initial={{opacity: 0, y: -6}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -4}}
						transition={fadeTransition}
						className="absolute right-4 top-full z-50 mt-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-lg dark:border-stone-800 dark:bg-stone-900"
					>
						<p className="mb-2 text-xs font-medium tracking-wide text-stone-500 uppercase dark:text-stone-400">
							Theme
						</p>
						<ThemeControl />
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}
