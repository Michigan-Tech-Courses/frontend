import core from 'puppeteer-core';
import {getOptions} from './options';
import {type FileType} from './types';

let _page: core.Page | undefined;

async function getPage(isDev: boolean) {
	if (_page) {
		return _page;
	}

	const options = await getOptions(isDev);
	const browser = await core.launch(options);
	_page = await browser.newPage();
	return _page;
}

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
	const page = await getPage(isDev);
	await page.setViewport({width: 2048, height: 1170});
	await page.setContent(html);
	const file = await page.screenshot({type});
	return file;
}
