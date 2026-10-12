export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'nourish-theme'

export function isTheme(value: string | null): value is Theme {
	return value === 'light' || value === 'dark' || value === 'system'
}

export function getStoredTheme(): Theme {
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY)
		return isTheme(value) ? value : 'system'
	} catch {
		return 'system'
	}
}

export function setStoredTheme(theme: Theme) {
	localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyTheme(theme: Theme) {
	const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
	const isDark = theme === 'dark' || (theme === 'system' && systemDark)
	document.documentElement.classList.toggle('dark', isDark)
	document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

export const themeInitScript = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var theme=stored==='light'||stored==='dark'||stored==='system'?stored:'system';var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=theme==='dark'||(theme==='system'&&systemDark);document.documentElement.classList.toggle('dark',isDark);document.documentElement.style.colorScheme=isDark?'dark':'light';}catch(e){}})();`
