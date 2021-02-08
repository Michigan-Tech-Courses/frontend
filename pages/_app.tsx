import type {AppProps} from 'next/app';
import Head from 'next/head';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';
import Navbar from '../components/navbar';

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
			<Head>
				<title>Michigan Tech Courses</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</Head>

			<Navbar/>

			<main>
				<Component {...pageProps}/>
			</main>
		</ChakraProvider>
	);
}

export default MyApp;
