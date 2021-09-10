import React from 'react';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import {Box, BoxProps, ChakraProvider, extendTheme} from '@chakra-ui/react';
import {createBreakpoints} from '@chakra-ui/theme-tools';
import useStore, {Provider as StateProvider} from '../lib/state-context';
import Navbar from '../components/navbar';
import RevisionToaster from '../components/revision-toaster';
import useRevalidation from '../lib/hooks/use-revalidation';
import {CustomNextPage} from '../lib/types';

const theme = extendTheme({
	colors: {
		brand: {
			50: '#fffae4',
			100: '#ffeea8',
			200: '#ffdf60',
			300: '#ffcd06',
			400: '#eebe00',
			500: '#d9ae00',
			600: '#c29b00',
			700: '#a78500',
			800: '#836900',
			900: '#4d3e00'
		}
	},
	breakpoints: createBreakpoints({
		sm: '30em',
		md: '48em',
		lg: '62em',
		xl: '80em',
		'2xl': '96em',
		'4xl': '192em'
	}),
	sizes: {
		container: {
			'2xl': '1600px'
		}
	}
});

const MyApp = ({Component, pageProps}: AppProps & {Component: CustomNextPage<any>}) => {
	const state = useStore();

	useRevalidation(true, async () => state.apiState.revalidate());

	const wrapperProps: BoxProps = {};

	if (Component.useStaticHeight) {
		wrapperProps.h = '100vh';
		wrapperProps.display = 'flex';
		wrapperProps.flexDir = 'column';
		wrapperProps.pos = 'relative';
	}

	return (
		<ChakraProvider theme={theme}>
			<Head>
				<title>Michigan Tech Courses</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

				<link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_THUMBOR_ENDPOINT}/>

				{
					process.env.NODE_ENV === 'production' && (
						<script async defer data-domain="michigantechcourses.com" src="https://plause.maxisom.me/js/plausible.js"/>
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

			<RevisionToaster/>
		</ChakraProvider>
	);
};

export default MyApp;
