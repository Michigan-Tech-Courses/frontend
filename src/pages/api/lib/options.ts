import path from 'node:path';
import chrome from 'chrome-aws-lambda';

const exePath = process.platform === 'win32'
	? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
	: (process.platform === 'linux'
		? '/usr/bin/google-chrome'
		: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

type Options = {
	args: string[];
	executablePath: string;
	headless: boolean;
};

export async function getOptions(isDev: boolean) {
	let options: Options;
	if (isDev) {
		options = {
			args: [],
			executablePath: exePath,
			headless: true,
		};
	} else {
		options = {
			args: chrome.args,
			executablePath: await chrome.executablePath,
			headless: chrome.headless,
		};
	}

	await chrome.font(`${path.resolve()}/pages/api/lib/fonts/georgia-bold.ttf`);

	return options;
}
