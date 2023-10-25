import {type IncomingMessage, type ServerResponse} from 'node:http';
import {parseRequest} from './lib/parser';
import {getScreenshot} from './lib/chromium';
import {getHtml} from './lib/template';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export default async function handler(request: IncomingMessage, response: ServerResponse) {
	try {
		const parsedRequest = parseRequest(request);
		const html = getHtml(parsedRequest);
		if (isHtmlDebug) {
			response.setHeader('Content-Type', 'text/html');
			response.end(html);
			return;
		}

		const {fileType} = parsedRequest;
		const file = await getScreenshot(html, fileType, isDev);
		response.statusCode = 200;
		response.setHeader('Content-Type', `image/${fileType}`);
		response.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000');
		response.end(file);
	} catch (error: unknown) {
		response.statusCode = 500;
		response.setHeader('Content-Type', 'text/html');
		response.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
		console.error(error);
	}
}
