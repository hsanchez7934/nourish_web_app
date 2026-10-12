import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from 'next/script'
import AppHeader from '@/components/AppHeader'
import AppNav from '@/components/AppNav'
import MotionProvider from '@/components/MotionProvider'
import {navInitScript} from '@/lib/nav'
import {themeInitScript} from '@/lib/theme'
import './globals.css'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
	title: 'Nourish',
	description: 'Search foods and track calories.'
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.className} bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100`}
			>
				<Script id="nourish-theme" strategy="beforeInteractive">
					{themeInitScript}
				</Script>
				<Script id="nourish-nav" strategy="beforeInteractive">
					{navInitScript}
				</Script>
				<MotionProvider>
					<AppHeader />
					<AppNav />
					<div className="app-shell min-h-screen">{children}</div>
				</MotionProvider>
			</body>
		</html>
	)
}
