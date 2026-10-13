'use client'

import {motion} from 'framer-motion'
import {useState, type FormEvent} from 'react'
import {PiEye, PiEyeSlash, PiForkKnife, PiMoonStars, PiSunHorizon} from 'react-icons/pi'
import {fade, rise} from '@/lib/motion'

const dayMeals = [
	{
		meal: 'Breakfast',
		detail: '2 eggs, sourdough',
		energy: '340 kcal',
		icon: PiSunHorizon
	},
	{
		meal: 'Midday',
		detail: 'Brown rice, avocado',
		energy: '520 kcal',
		icon: PiForkKnife
	},
	{
		meal: 'Evening',
		detail: 'Steak, greens',
		energy: '610 kcal',
		icon: PiMoonStars
	}
]

const fieldClassName =
	'h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 shadow-sm outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20'

export default function SignIn() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
	}

	return (
		<div className="mx-auto flex w-full max-w-lg flex-col gap-4 md:mx-0 md:grid md:max-w-none md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,24rem)] md:items-stretch md:gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,26rem)] lg:gap-10 lg:overflow-hidden">
			<motion.section
				aria-label="Welcome"
				initial="hidden"
				animate="show"
				variants={fade}
				className="relative flex flex-col overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:border-emerald-900/70 dark:from-emerald-950/80 dark:via-stone-900 dark:to-amber-950/30 lg:min-h-0"
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-600/20"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl dark:bg-amber-600/15"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-8 top-8 hidden h-36 w-36 rounded-full border border-emerald-700/10 dark:border-emerald-300/10 md:block"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-14 top-14 hidden h-24 w-24 rounded-full border border-amber-700/15 dark:border-amber-300/10 md:block"
				/>

				<div className="relative flex min-h-0 w-full max-w-2xl flex-1 flex-col p-5 sm:p-7 lg:overflow-y-auto lg:p-10">
				<div className="relative">
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
						Welcome back
					</p>
					<h1 className="mt-3 max-w-md text-[1.85rem] font-semibold leading-tight tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl lg:text-5xl">
						Come back to the meal.
					</h1>
					<p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
						The foods you look up and the recipes you combine stay with you, ready for the next
						meal.
					</p>
				</div>

				<div className="relative mt-6 lg:mt-8">
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
						A day, in one place
					</p>
					<ul className="mt-3 space-y-2">
						{dayMeals.map((item) => {
							const Icon = item.icon
							return (
								<li
									key={item.meal}
									className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-950/50"
								>
									<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
										<Icon aria-hidden="true" className="h-5 w-5" />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block text-sm font-semibold text-stone-900 dark:text-stone-50">
											{item.meal}
										</span>
										<span className="block truncate text-sm text-stone-500 dark:text-stone-400">
											{item.detail}
										</span>
									</span>
									<span className="shrink-0 text-sm font-medium text-amber-800 dark:text-amber-300">
										{item.energy}
									</span>
								</li>
							)
						})}
					</ul>
				</div>

				<p className="relative mt-6 text-sm font-semibold tracking-tight lg:mt-auto lg:pt-8">
					<span className="text-emerald-700 dark:text-emerald-400">Search.</span>{' '}
					<span className="text-amber-700 dark:text-amber-300">See.</span>{' '}
					<span className="text-stone-900 dark:text-stone-50">Understand.</span>
				</p>
				</div>
			</motion.section>

			<motion.section
				aria-labelledby="sign-in-heading"
				initial="hidden"
				animate="show"
				variants={rise}
				className="flex rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-7 md:items-center lg:min-h-0 lg:overflow-y-auto lg:p-10"
			>
				<form className="w-full" onSubmit={handleSubmit}>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
						Account
					</p>
					<h2
						id="sign-in-heading"
						className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50"
					>
						Sign in
					</h2>
					<p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
						Use the email and password for your Nourish account.
					</p>

					<div className="mt-6 space-y-4">
						<div>
							<label
								htmlFor="sign-in-email"
								className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-200"
							>
								Email
							</label>
							<input
								id="sign-in-email"
								name="email"
								type="email"
								autoComplete="email"
								inputMode="email"
								autoCapitalize="none"
								spellCheck={false}
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								className={fieldClassName}
							/>
						</div>
						<div>
							<label
								htmlFor="sign-in-password"
								className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-200"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="sign-in-password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									required
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									placeholder="Your password"
									className={`${fieldClassName} pr-12`}
								/>
								<button
									type="button"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									aria-pressed={showPassword}
									onClick={() => setShowPassword((current) => !current)}
									className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
								>
									{showPassword ? (
										<PiEyeSlash aria-hidden="true" className="h-5 w-5" />
									) : (
										<PiEye aria-hidden="true" className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>
					</div>

					<button
						type="submit"
						className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
					>
						Sign in
					</button>
				</form>
			</motion.section>
		</div>
	)
}
