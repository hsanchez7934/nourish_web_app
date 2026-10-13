import {PiCaretRight} from 'react-icons/pi'

export type BreadcrumbItem = {
	label: string
	onSelect?: () => void
}

export default function Breadcrumbs({items}: {items: BreadcrumbItem[]}) {
	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			<ol className="flex min-w-0 items-center gap-1.5 text-sm">
				{items.map((item, index) => {
					const isCurrent = index === items.length - 1

					return (
						<li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
							{index > 0 ? (
								<PiCaretRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-stone-400" />
							) : null}
							{item.onSelect && !isCurrent ? (
								<button
									type="button"
									onClick={item.onSelect}
									className="truncate font-medium text-stone-600 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-stone-400 dark:hover:text-emerald-300"
								>
									{item.label}
								</button>
							) : (
								<span
									aria-current={isCurrent ? 'page' : undefined}
									title={item.label}
									className="truncate font-medium text-stone-900 dark:text-stone-100"
								>
									{item.label}
								</span>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
