import SignIn from '@/components/SignIn'

export default function SignInPage() {
	return (
		<main className="sign-in-frame min-h-screen bg-stone-50 px-4 pb-16 pt-[120px] dark:bg-stone-950 md:px-6 lg:fixed lg:bottom-0 lg:right-0 lg:top-[56px] lg:min-h-0 lg:overflow-hidden lg:px-8 lg:pb-8 lg:pt-8">
			<SignIn />
		</main>
	)
}
