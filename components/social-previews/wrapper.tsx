import React from 'react';
import {ChakraProvider} from '@chakra-ui/react';
import {readFileSync} from 'fs';
import path from 'path';

const bold = readFileSync(`${path.resolve()}/pages/api/lib/fonts/georgia-bold.ttf`).toString('base64');

const css = `
	@font-face {
		font-family: 'Georgia';
		font-style: normal;
		font-weight: bold;
		src: url(data:font/ttf;charset=utf-8;base64,${bold}) format('ttf');
	}
`;

const Wrapper = ({children}: {children: React.ReactElement}) => (
	<ChakraProvider>
		{children}
		<style>
			{css}
		</style>
	</ChakraProvider>
);

export default Wrapper;
