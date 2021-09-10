import {IncomingMessage} from 'http';
import absoluteUrl from 'next-absolute-url';
import {ICourseFromAPI} from './api-types';

const toTitleCase = (string: string): string => string.split(' ').map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');

export const getCoursePreviewUrl = (course: ICourseFromAPI, request: IncomingMessage) => {
	const url = new URL('/api/preview', absoluteUrl(request).origin);
	url.searchParams.set('fileType', 'png');
	url.searchParams.set('type', 'COURSE');
	url.searchParams.set('title', course.title);
	url.searchParams.set('semester', `${toTitleCase(course.semester)} ${course.year}`);

	return url.toString();
};
