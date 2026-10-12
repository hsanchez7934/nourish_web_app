'use client'

import {AnimatePresence, motion} from 'framer-motion'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'
import {PiList, PiX} from 'react-icons/pi'
import {isPrimaryNavActive, primaryNavLinks} from '@/lib/primaryNav'
import {fadeTransition} from '@/lib/motion'

export default function MobileNav() {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		setOpen(false)
	}, [pathname])

	useEffect(() => {
		if (!open) return

		function onPointerDown(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false)
		}

		const desktop = window.matchMedia('(min-width: 1024px)')
		const onDesktop = () => {
			if (desktop.matches) setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		desktop.addEventListener('change', onDesktop)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
			desktop.removeEventListener('change', onDesktop)
		}
	}, [open])

	return (
		<div ref={containerRef} className="lg:hidden">
			<button
				type="button"
				aria-expanded={open}
				aria-controls="mobile-nav"
				aria-label={open ? 'Close menu' : 'Open menu'}
				onClick={() => setOpen((current) => !current)}
				className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-stone-200 dark:hover:bg-stone-800"
			>
				{open ? (
					<PiX aria-hidden="true" className="h-5 w-5" />
				) : (
					<PiList aria-hidden="true" className="h-5 w-5" />
				)}
			</button>
			<AnimatePresence>
				{open ? (
					<motion.nav
						id="mobile-nav"
						aria-label="Primary"
						initial={{opacity: 0, y: -6}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -4}}
						transition={fadeTransition}
						className="absolute left-4 top-full z-50 mt-2 w-60 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg dark:border-stone-800 dark:bg-stone-900"
					>
						<ul className="flex flex-col gap-1">
							{primaryNavLinks.map((link) => {
								const Icon = link.icon
								const active = isPrimaryNavActive(pathname, link.href)
								return (
									<li key={link.href}>
										<Link
											href={link.href}
											aria-current={active ? 'page' : undefined}
											className={[
												'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30',
												active
													? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100'
													: 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800'
											].join(' ')}
										>
											<Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
											{link.label}
										</Link>
									</li>
								)
							})}
						</ul>
					</motion.nav>
				) : null}
			</AnimatePresence>
		</div>
	)
}
