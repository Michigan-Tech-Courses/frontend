import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SocialPreviewCourse from 'src/components/social-previews/course';
import Wrapper from 'src/components/social-previews/wrapper';
import {ParsedRequest} from './types';

export const getHtml = (request: ParsedRequest): string => {
	switch (request.type) {
		case 'COURSE': {
			return ReactDOMServer.renderToStaticMarkup(
				<Wrapper>
					<SocialPreviewCourse title={request.title} semester={request.semester}/>
				</Wrapper>,
			);
		}

		default:
			break;
	}

	throw new Error('Unknown type');
};
