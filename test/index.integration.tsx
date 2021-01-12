import React from 'react';
import {render, screen} from '@testing-library/react';
import IndexPage from '../pages/index';

test('course row shows details when button is clicked', async () => {
	render(<IndexPage/>);

	const detailButtons = await screen.findAllByTestId('course-details-button');

	// Open a row's details
	detailButtons[0].click();

	const sectionCRN = await screen.findByText('48939');

	expect(sectionCRN.textContent).toBe('48939');
});
