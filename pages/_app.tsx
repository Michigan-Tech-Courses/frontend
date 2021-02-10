import type {AppProps} from 'next/app';
import Head from 'next/head';
import {ChakraProvider, extendTheme} from '@chakra-ui/react';
import Navbar from '../components/navbar';
import {APIProvider} from '../lib/api-context';

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
			<APIProvider>
				<Head>
					<title>Michigan Tech Courses</title>
					<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

					<link rel="preload" href="https://api.michigantechcourses.com/courses" as="fetch" crossOrigin="anonymous"/>
					<link rel="preload" href="https://api.michigantechcourses.com/instructors" as="fetch" crossOrigin="anonymous"/>
					<link rel="preload" href="https://api.michigantechcourses.com/passfaildrop" as="fetch" crossOrigin="anonymous"/>
					<link rel="preload" href="https://api.michigantechcourses.com/sections" as="fetch" crossOrigin="anonymous"/>
				</Head>

				<Navbar/>

				<main>
					<Component {...pageProps}/>
				</main>
			</APIProvider>
		</ChakraProvider>
	);
}

export default MyApp;
