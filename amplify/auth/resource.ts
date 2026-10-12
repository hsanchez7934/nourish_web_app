import { defineAuth } from '@aws-amplify/backend'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to Nourish - verify your email',
      verificationEmailBody: (createCode) => `
        Hello from Nourish,

        We're happy you're here. Use the confirmation code below to verify your email address and finish setting up your Nourish account.

        Confirmation code: ${createCode()}

        If you did not request this email, you can safely ignore it.

        Warmly,
        The Nourish Team
      `,
    },
  },
})
