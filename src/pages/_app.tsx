import React, {useMemo} from 'react';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {Box, BoxProps, ChakraProvider} from '@chakra-ui/react';
import useStore, {Provider as StateProvider} from 'src/lib/state/context';
import Navbar from 'src/components/navbar';
import RegisterPWA from 'src/components/register-pwa';
import useRevalidation from 'src/lib/hooks/use-revalidation';
import {CustomNextPage} from 'src/lib/types';
import MobileDeviceWarning from 'src/components/mobile-device-warning';
import theme from 'src/lib/theme';

const MyApp = ({Component, pageProps}: AppProps & {Component: CustomNextPage<any>}) => {
	const state = useStore();

	useRevalidation(true, async () => {
		await state.apiState.revalidate();
	});

	const wrapperProps: BoxProps = useMemo(() => {
		if (Component.useStaticHeight) {
			return {
				h: '100vh',
				display: 'flex',
				flexDir: 'column',
				pos: 'relative',
				overflow: 'hidden',
			};
		}

		return {};
	}, [Component.useStaticHeight]);

	return (
		<ChakraProvider theme={theme}>
			<Head>
				<title>Michigan Tech Courses</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

				<link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_THUMBOR_ENDPOINT}/>

				{
					process.env.NODE_ENV === 'production' && (
						<script async defer data-domain="michigantechcourses.com" src="https://plause.maxisom.me/js/plause.js"/>
					)
				}

				<link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png"/>
				<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png"/>
				<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png"/>
				<link rel="mask-icon" href="/images/favicon/safari-pinned-tab.svg" color="#ffcc01"/>
				<link rel="shortcut icon" href="/images/favicon/favicon.ico"/>
				<meta name="msapplication-TileColor" content="#000000"/>
				<meta name="msapplication-config" content="/images/favicon/browserconfig.xml"/>
				<meta name="theme-color" content="#000000"/>

				<link rel="manifest" href="/manifest.json"/>
			</Head>

			<StateProvider>
				<Box as="main" {...wrapperProps}>
					<Navbar/>

					<Component {...pageProps}/>
				</Box>
			</StateProvider>

			<MobileDeviceWarning/>

			<RegisterPWA/>
		</ChakraProvider>
	);
};

export default MyApp;
