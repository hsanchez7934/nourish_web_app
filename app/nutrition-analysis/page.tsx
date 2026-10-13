import NutritionAnalysis from '@/components/NutritionAnalysis'

export default function NutritionAnalysisPage() {
	return (
		<main className="nutrition-analysis-frame min-h-screen bg-stone-50 px-4 pb-16 pt-[120px] dark:bg-stone-950 lg:fixed lg:bottom-0 lg:right-0 lg:top-[56px] lg:min-h-0 lg:overflow-hidden lg:px-8 lg:pb-8 lg:pt-8">
			<NutritionAnalysis />
		</main>
	)
}
