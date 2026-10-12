'use client'

import {useEffect, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {PiArrowLeft} from 'react-icons/pi'
import NutritionFacts from '@/components/NutritionFacts'
import {edamamFoodImage, type FoodNutrientDetails} from '@/lib/foodNutrients'
import {fade, rise} from '@/lib/motion'

type FoodNutrientsProps = {
	foodId: string
	measureURI: string
	imageUrl: string
}

type LoadStatus = 'loading' | 'error' | 'success'

function displayName(name: string) {
	return name.charAt(0).toUpperCase() + name.slice(1)
}

export default function FoodNutrients({foodId, measureURI, imageUrl}: FoodNutrientsProps) {
	const thumbnail = edamamFoodImage(imageUrl)
	const [status, setStatus] = useState<LoadStatus>('loading')
	const [food, setFood] = useState<FoodNutrientDetails | null>(null)
	const [message, setMessage] = useState('')

	useEffect(() => {
		if (!measureURI) {
			setStatus('error')
			setFood(null)
			setMessage('This food does not include a gram measure.')
			return
		}

		const controller = new AbortController()
		setStatus('loading')
		setMessage('')
		setFood(null)

		const params = new URLSearchParams({foodId, measureURI})

		fetch(`/api/food-nutrients?${params.toString()}`, {signal: controller.signal})
			.then(async (response) => {
				const data = (await response.json().catch(() => null)) as {
					food?: FoodNutrientDetails
					error?: string
				} | null

				if (controller.signal.aborted) return

				if (!response.ok || !data?.food) {
					setStatus('error')
					setMessage(data?.error ?? 'Food nutrients failed to load. Try again.')
					return
				}

				setFood(data.food)
				setStatus('success')
			})
			.catch((error: unknown) => {
				if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
					return
				}

				setStatus('error')
				setMessage('Food nutrients failed to load. Try again.')
			})

		return () => controller.abort()
	}, [foodId, measureURI])

	return (
		<div className="mx-auto w-full max-w-screen-2xl">
			<Link
				href="/food-search"
				className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-emerald-800 dark:text-stone-400 dark:hover:text-emerald-300"
			>
				<PiArrowLeft aria-hidden="true" className="h-4 w-4" />
				Back to search
			</Link>
			<AnimatePresence mode="wait">
				{status === 'loading' ? (
					<motion.div
						key="loading"
						variants={fade}
						initial="hidden"
						animate="show"
						exit="exit"
						aria-hidden="true"
						className="mt-8"
					>
						<div className="flex items-center gap-5">
							<div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
							<div>
								<div className="h-8 w-40 animate-pulse rounded bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
								<div className="mt-3 h-4 w-56 animate-pulse rounded bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
							</div>
						</div>
						<div className="mt-8 grid gap-3 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
							<div className="h-36 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
							<div className="grid grid-cols-2 gap-3">
								{Array.from({length: 4}, (_, index) => (
									<div
										key={index}
										className="h-24 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800"
									/>
								))}
							</div>
						</div>
						<div className="mt-6 h-72 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none dark:bg-stone-800" />
					</motion.div>
				) : status === 'error' ? (
					<motion.p
						key="error"
						role="alert"
						variants={rise}
						initial="hidden"
						animate="show"
						exit="exit"
						className="mt-8 text-sm text-stone-600 dark:text-stone-400"
					>
						{message}
					</motion.p>
				) : food ? (
					<motion.article
						key={food.id}
						variants={rise}
						initial="hidden"
						animate="show"
						exit="exit"
						className="mt-8"
					>
						<div className="flex items-center gap-5">
							{thumbnail ? (
								<motion.div
									initial={{opacity: 0, scale: 0.96}}
									animate={{opacity: 1, scale: 1}}
									transition={{duration: 0.28}}
									className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800"
								>
									<Image src={thumbnail} alt="" fill sizes="96px" className="object-cover" />
								</motion.div>
							) : null}
							<div className="min-w-0">
								<h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
									{displayName(food.name)}
								</h1>
							</div>
						</div>
						<NutritionFacts food={food} />
					</motion.article>
				) : null}
			</AnimatePresence>
		</div>
	)
}
