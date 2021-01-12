import type {AppProps} from 'next/app';
import Head from 'next/head';
import {ChakraProvider} from '@chakra-ui/react';
import Navbar from '../components/navbar';

function MyApp({Component, pageProps}: AppProps) {
	return (
		<ChakraProvider>
			<Head>
				<title>Michigan Tech Courses</title>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</Head>
			<Navbar/>

			<Component {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
