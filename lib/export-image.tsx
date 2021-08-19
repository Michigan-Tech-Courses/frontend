import {RefObject} from 'react';
import domToImage from 'dom-to-image';

export const captureToBlob = async (node: RefObject<HTMLElement>) => {
	if (!node.current) {
		throw new Error('Could not find element by ref.');
	}

	const blob = await domToImage.toBlob(node.current, {
		bgcolor: 'transparent'
	});

	return blob;
};
