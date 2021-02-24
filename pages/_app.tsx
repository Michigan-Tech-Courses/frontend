import type {AppProps} from 'next/app';
import Head from 'next/head';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';
import Navbar from '../components/navbar';
import * as APIState from '../lib/state-context';

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
	}
});

function MyApp({Component, pageProps}: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<APIState.Provider>
				<Head>
					<title>Michigan Tech Courses</title>
					<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

					<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/instructors`} as="fetch" crossOrigin="anonymous"/>
					<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/passfaildrop`} as="fetch" crossOrigin="anonymous"/>
					<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/semesters`} as="fetch" crossOrigin="anonymous"/>
				</Head>

				<Navbar/>

				<main>
					<Component {...pageProps}/>
				</main>
			</APIState.Provider>
		</ChakraProvider>
	);
}

export default MyApp;
