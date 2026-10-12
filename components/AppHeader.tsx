'use client'

import {motion} from 'framer-motion'
import MobileNav from '@/components/MobileNav'
import UserMenu from '@/components/UserMenu'
import {fadeTransition} from '@/lib/motion'

export default function AppHeader() {
	return (
		<motion.header
			initial={{opacity: 0, y: -8}}
			animate={{opacity: 1, y: 0}}
			transition={fadeTransition}
			className="fixed inset-x-0 top-0 z-50 flex h-[56px] items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 dark:border-stone-800 dark:bg-stone-900"
		>
			<div className="flex min-w-0 items-center gap-2">
				<MobileNav />
				<span className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
					Nourish
				</span>
			</div>
			<UserMenu />
		</motion.header>
	)
}
