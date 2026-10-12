import FoodNutrients from '@/components/FoodNutrients'

type FoodNutrientsPageProps = {
	params: {foodId: string}
	searchParams: {measureURI?: string | string[]; image?: string | string[]}
}

function firstParam(value: string | string[] | undefined) {
	if (Array.isArray(value)) return value[0] ?? ''
	return value ?? ''
}

export default function FoodNutrientsPage({params, searchParams}: FoodNutrientsPageProps) {
	return (
		<main className="min-h-screen bg-stone-50 px-4 pb-16 pt-24 dark:bg-stone-950 lg:px-8">
			<FoodNutrients
				foodId={params.foodId}
				measureURI={firstParam(searchParams.measureURI)}
				imageUrl={firstParam(searchParams.image)}
			/>
		</main>
	)
}
