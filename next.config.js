/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		dirs: ['app', 'components', 'lib', 'services']
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.edamam.com',
				pathname: '/food-img/**'
			}
		]
	}
}

module.exports = nextConfig
