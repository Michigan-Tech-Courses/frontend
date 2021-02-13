const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

module.exports = withPlugins([
	[withBundleAnalyzer]
], {
	webpack: config => {
		config.module.rules.push({
			test: /react-spring/,
			sideEffects: true
		});

		return config;
	}
});
