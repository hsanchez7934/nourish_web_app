import {PiChartPie, PiHouse, PiMagnifyingGlass} from 'react-icons/pi'

export const primaryNavLinks = [
	{href: '/', label: 'Home', icon: PiHouse},
	{href: '/food-search', label: 'Food Search', icon: PiMagnifyingGlass},
	{href: '/nutrition-analysis', label: 'Nutrition Analysis', icon: PiChartPie}
]

export function isPrimaryNavActive(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}
