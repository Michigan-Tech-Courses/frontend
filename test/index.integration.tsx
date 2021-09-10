import React from 'react';
import {render, screen} from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';
import {ChakraProvider} from '@chakra-ui/react';
import IndexPage from '../src/pages/index';

beforeAll(async () => {
	await preloadAll();
});

test('basic render test', async () => {
	window.scrollTo = jest.fn();

	render(
		<ChakraProvider>
			<IndexPage/>
		</ChakraProvider>,
	);

	const noDataLoadedText = await screen.findByText('out of 0 courses');

	expect(noDataLoadedText).toBeDefined();
});
