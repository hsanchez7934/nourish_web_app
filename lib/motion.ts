import type {Transition, Variants} from 'framer-motion'

export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1]

export const fadeTransition: Transition = {
	duration: 0.24,
	ease: easeOut
}

export const layoutTransition: Transition = {
	type: 'tween',
	duration: 0.2,
	ease: easeOut
}

export const fade: Variants = {
	hidden: {opacity: 0},
	show: {opacity: 1, transition: fadeTransition},
	exit: {opacity: 0, transition: {duration: 0.14, ease: easeOut}}
}

export const rise: Variants = {
	hidden: {opacity: 0, y: 8},
	show: {opacity: 1, y: 0, transition: {duration: 0.28, ease: easeOut}},
	exit: {opacity: 0, y: 4, transition: {duration: 0.14, ease: easeOut}}
}

export const riseInList: Variants = {
	hidden: {opacity: 0, y: 8},
	show: (index: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.28,
			ease: easeOut,
			delay: Math.min(index, 6) * 0.035
		}
	}),
	exit: {opacity: 0, transition: {duration: 0.12, ease: easeOut}}
}

export const stagger: Variants = {
	hidden: {},
	show: {
		transition: {staggerChildren: 0.05, delayChildren: 0.02}
	}
}
