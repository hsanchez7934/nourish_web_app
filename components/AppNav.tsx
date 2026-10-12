'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'
import {PiCaretLeft, PiCaretRight} from 'react-icons/pi'
import {NAV_STORAGE_KEY} from '@/lib/nav'
import {isPrimaryNavActive, primaryNavLinks} from '@/lib/primaryNav'

function writeExpanded(expanded: boolean) {
	document.documentElement.dataset.nav = expanded ? 'expanded' : 'collapsed'
	try {
		localStorage.setItem(NAV_STORAGE_KEY, expanded ? 'expanded' : 'collapsed')
	} catch {
		/* storage can be unavailable in private browsing */
	}
}

export default function AppNav() {
	const pathname = usePathname()
	const [expanded, setExpanded] = useState(false)

	useEffect(() => {
		setExpanded(document.documentElement.dataset.nav === 'expanded')
	}, [])

	function toggle() {
		const next = document.documentElement.dataset.nav !== 'expanded'
		writeExpanded(next)
		setExpanded(next)
	}

	return (
		<nav
			id="app-nav"
			aria-label="Primary"
			className="app-nav fixed bottom-0 left-0 top-[56px] z-40 hidden flex-col overflow-hidden border-r border-stone-200 bg-white px-3 py-3 lg:flex dark:border-stone-800 dark:bg-stone-900"
		>
			<button
				type="button"
				className="nav-link flex h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-stone-600 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-stone-300 dark:hover:bg-stone-800"
				aria-expanded={expanded}
				aria-controls="app-nav"
				aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
				onClick={toggle}
			>
				<PiCaretRight aria-hidden="true" className="nav-icon-collapsed h-5 w-5 shrink-0" />
				<PiCaretLeft aria-hidden="true" className="nav-icon-expanded h-5 w-5 shrink-0" />
				<span className="nav-label">Collapse</span>
			</button>
			<ul className="mt-2 flex flex-col gap-1">
				{primaryNavLinks.map((link) => {
					const Icon = link.icon
					const active = isPrimaryNavActive(pathname, link.href)
					return (
						<li key={link.href}>
							<Link
								href={link.href}
								aria-current={active ? 'page' : undefined}
								className={[
									'nav-link flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30',
									active
										? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100'
										: 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
								].join(' ')}
							>
								<Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
								<span className="nav-label">{link.label}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
