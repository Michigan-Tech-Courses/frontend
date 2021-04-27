import {IncomingMessage} from 'http';
import absoluteUrl from 'next-absolute-url';

export const getCoursePreviewUrl = ({title}: {title: string}, request: IncomingMessage) => {
	const url = new URL('/api/preview', absoluteUrl(request).origin);
	url.searchParams.set('fileType', 'png');
	url.searchParams.set('type', 'COURSE');
	url.searchParams.set('title', title);

	return url.toString();
};
