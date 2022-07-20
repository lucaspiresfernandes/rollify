/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	i18n: {
		locales: ['en', 'pt-BR'],
		defaultLocale: 'en',
	},
};

module.exports = nextConfig;
