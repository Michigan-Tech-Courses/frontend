import {RefObject, ReactInstance} from 'react';
import ReactDOM from 'react-dom';
import domToImage from 'dom-to-image';

export const captureToBlob = async (node: RefObject<ReactInstance>) => {
	const element = ReactDOM.findDOMNode(node.current);

	if (!element) {
		throw new Error('Could not find element by ref.');
	}

	const blob = await domToImage.toBlob(element, {
		bgcolor: 'transparent'
	});

	return blob;
};
