import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

const schema = a.schema({
	User: a
		.model({
			id: a.id().required(),
			email: a.string().required(),
			name: a.string(),
			onboardingCompleted: a.boolean().required(),
			nutritionGoals: a.json(),
			preferences: a.json(),

			stripeCustomerId: a.string(),
			subscriptionStatus: a.enum(['active', 'trialing', 'past_due', 'canceled', 'none']),
			subscriptionPlan: a.enum(['monthly', 'yearly', 'premium']),
			subscriptionCurrentPeriodEnd: a.string(),
		})
		.identifier(['id'])
		.authorization((allow) => [allow.owner()]),

	FoodLogEntry: a
		.model({
			foodId: a.string(),
			foodLabel: a.string().required(),
			foodImage: a.string(),

			mealType: a.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),

			loggedDate: a.date().required(),
			loggedAt: a.datetime().required(),

			quantity: a.float().required(),
			servingUnit: a.string(),

			calories: a.float(),
			protein: a.float(),
			totalFat: a.float(),
			netCarbs: a.float(),

			source: a.enum(['FOOD_SEARCH', 'MEAL_ANALYZER', 'UPC_SCAN']),

			ingredientBreakdown: a.json(),
			notes: a.string(),
		})
		.authorization((allow) => [allow.owner()]),

	FavoriteFoodItem: a
		.model({
			foodId: a.string(),
			foodLabel: a.string().required(),
			foodImage: a.string(),

			quantity: a.float().required(),
			servingUnit: a.string(),

			calories: a.float(),
			protein: a.float(),
			totalFat: a.float(),
			netCarbs: a.float(),

			source: a.enum(['FOOD_SEARCH', 'MEAL_ANALYZER', 'UPC_SCAN']),
			tag: a.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),

			ingredientBreakdown: a.json(),
			notes: a.string(),
			favoritedAt: a.datetime().required(),
		})
		.authorization((allow) => [allow.owner()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: 'userPool',
	},
})
