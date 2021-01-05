import React from 'react';
import {render, screen} from '@testing-library/react';
import IndexPage from '../pages/index';

test('simple test', async () => {
	render(<IndexPage/>);

	const elements = await screen.findAllByText('Hello earth.');

	expect(elements.length).toBe(1);
});
