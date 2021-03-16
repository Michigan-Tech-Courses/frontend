/* eslint-disable camelcase */
const {PHASE_DEVELOPMENT_SERVER} = require('next/constants');
const withPlugins = require('next-compose-plugins');
const withOffline = require('next-offline');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

module.exports = withPlugins([
	[withBundleAnalyzer],
	[withOffline, ['!', PHASE_DEVELOPMENT_SERVER]]
], {
	webpack: config => {
		config.module.rules.push({
			test: /react-spring/,
			sideEffects: true
		}, {
			test: /\.svg$/,
			use: ['@svgr/webpack']
		});

		if (process.env.PROFILE === 'true') {
			config.resolve.alias = {
				...config.resolve.alias,
				'react-dom$': 'react-dom/profiling',
				'scheduler/tracing': 'scheduler/tracing-profiling'
			};

			const terser = config.optimization.minimizer.find(plugin => plugin.options && plugin.options.terserOptions);

			if (terser) {
				terser.options.terserOptions = {
					...terser.options.terserOptions,
					keep_classnames: true,
					keep_fnames: true
				};
			}
		}

		return config;
	}
});
