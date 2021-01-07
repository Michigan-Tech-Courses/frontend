import type {AppProps} from 'next/app';
import {ChakraProvider} from '@chakra-ui/react';
import ColorModeToggle from '../components/color-mode-toggle';

function MyApp({Component, pageProps}: AppProps) {
	return (
		<ChakraProvider>
			<ColorModeToggle/>

			<Component {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
