'use client'

import {useEffect, useSyncExternalStore} from 'react'
import {applyTheme, getStoredTheme, subscribeTheme} from '@/lib/theme'

export default function ThemeSync() {
	const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => 'system' as const)

	useEffect(() => {
		applyTheme(theme)
		if (theme !== 'system') return

		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const applySystem = () => applyTheme('system')

		media.addEventListener('change', applySystem)
		document.addEventListener('visibilitychange', applySystem)
		window.addEventListener('focus', applySystem)
		return () => {
			media.removeEventListener('change', applySystem)
			document.removeEventListener('visibilitychange', applySystem)
			window.removeEventListener('focus', applySystem)
		}
	}, [theme])

	return null
}
