import type {AppProps} from 'next/app';
import {ChakraProvider} from '@chakra-ui/react';
import Navbar from '../components/navbar';

function MyApp({Component, pageProps}: AppProps) {
	return (
		<ChakraProvider>
			<Navbar/>

			<Component {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
