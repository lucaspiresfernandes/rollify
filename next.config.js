const shouldAnalyzeBundles = process.env.ANALYZE === 'true';

const withBundleAnalyzer = shouldAnalyzeBundles
	? require('@next/bundle-analyzer')({ enabled: true })
	: (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		locales: ['en', 'pt-BR'],
		defaultLocale: 'en',
	},
	images: {
		domains: ['media.discordapp.net', 'i.imgur.com'],
	},
};

module.exports = withBundleAnalyzer(nextConfig);
