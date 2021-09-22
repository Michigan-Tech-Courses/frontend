import {ISectionFromAPI} from './api-types';
import saveAs from './save-as';

export type SupportedSoftware = 'AutoHotkey' | 'Autokey';

type ScriptGen = (sections: ISectionFromAPI[], name: string, shortcutKey: string) => void;

const getAutoHotkeyScript: ScriptGen = (sections, name, shortcutKey) => {
	let script = `!${shortcutKey}::\n`;

	const sectionSends = [];

	for (const section of sections) {
		sectionSends.push(`   Send, ${section.crn}\n`);
	}

	script += sectionSends.join('   Send, %A_Tab%\n');
	script += 'Return';

	saveAs(`data:text/plain;charset=utf-8,${encodeURIComponent(script)}`, `${name}.ahk`);
};

const saveKeyboardScriptFor = (
	software: SupportedSoftware,
	sections: ISectionFromAPI[],
	name: string,
	shortcutKey: string,
) => {
	switch (software) {
		case 'AutoHotkey':
			getAutoHotkeyScript(sections, name, shortcutKey);
			break;
		case 'Autokey':
			throw new Error('Not yet implemented.');
		default:
	}
};

export default saveKeyboardScriptFor;
