function revealHiddenBrackets(value: string) {
	let current = value

	for (let pass = 0; pass < 3; pass += 1) {
		const next = current
			.replace(/&amp;/gi, '&')
			.replace(/&lt;|&#0*60;|&#x0*3c;/gi, '<')
			.replace(/&gt;|&#0*62;|&#x0*3e;/gi, '>')

		if (next === current) break
		current = next
	}

	return current
}

function stripMarkup(value: string) {
	return value
		.replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\s*>|$)/gi, '')
		.replace(/<style\b[^>]*>[\s\S]*?(?:<\/style\s*>|$)/gi, '')
		.replace(/<\/?[a-z][\s\S]*?>/gi, '')
		.replace(/<[^>]*$/g, '')
}

export function sanitizeSearchQuery(value: string) {
	let sanitized = revealHiddenBrackets(value.replace(/\0/g, ''))
	let previous = ''

	while (sanitized !== previous) {
		previous = sanitized
		sanitized = stripMarkup(sanitized)
	}

	return sanitized.replace(/[<>]/g, '').replace(/javascript\s*:/gi, '')
}
