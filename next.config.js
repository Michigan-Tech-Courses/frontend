/* eslint-disable camelcase */
const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins([
	[withBundleAnalyzer],
	[withPWA, {
		pwa: {
			dest: 'public',
			disable: process.env.NODE_ENV !== 'production',
			dynamicStartUrl: false,
			register: false,
			skipWaiting: false,
		},
	}],
], {
	productionBrowserSourceMaps: true,
	webpack: config => {
		config.module.rules.push(
			{
				test: /react-spring/,
				sideEffects: true,
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack'],
			},
		);

		if (process.env.PROFILE === 'true') {
			config.resolve.alias = {
				...config.resolve.alias,
				'react-dom$': 'react-dom/profiling',
				'scheduler/tracing': 'scheduler/tracing-profiling',
			};

			const terser = config.optimization.minimizer.find(plugin => plugin.options && plugin.options.terserOptions);

			if (terser) {
				terser.options.terserOptions = {
					...terser.options.terserOptions,
					keep_classnames: true,
					keep_fnames: true,
				};
			}
		}

		config.resolve.fallback = {
			fs: false,
			path: false,
			process: require.resolve('process/browser'),
		};

		return config;
	},
});
