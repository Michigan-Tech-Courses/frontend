import {type IncomingMessage} from 'node:http';
import {type FileType, type ParsedRequest} from './types';

export const parseRequest = (request: IncomingMessage): ParsedRequest => {
	const {searchParams} = new URL(request.url!, 'https://fake.com');

	switch (searchParams.get('type')) {
		case 'COURSE': {
			return {
				type: 'COURSE',
				fileType: (searchParams.get('fileType') ?? 'png') as FileType,
				title: searchParams.get('title') ?? '',
				semester: searchParams.get('semester') ?? '',
			};
		}

		default: {
			break;
		}
	}

	throw new Error('Bad input.');
};
