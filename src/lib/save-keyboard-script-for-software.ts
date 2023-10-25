import {type ISectionFromAPI} from './api-types';
import saveAs from './save-as';

export type SupportedSoftware = 'AutoHotkey' | 'Autokey';

type ScriptGen = (sections: ISectionFromAPI[], shortcutKey: string) => string;

const getAutoHotkeyScript: ScriptGen = (sections, shortcutKey) => {
	let script = `!${shortcutKey}::\n`;

	const sectionSends = [];

	for (const section of sections) {
		sectionSends.push(`   Send, ${section.crn}\n`);
	}

	script += sectionSends.join('   Send, %A_Tab%\n');
	script += '   Send, {enter}';

	return script;
};

const getAutokeyScript: ScriptGen = sections => {
	const scriptLines = [];

	for (const section of sections) {
		scriptLines.push(`keyboard.send_keys("${section.crn}")`, 'keyboard.send_key("<tab>")');
	}

	// Remove last tab send
	scriptLines.pop();

	scriptLines.push('keyboard.send_key("<enter>")');

	return scriptLines.join('\n');
};

export const getKeyboardScriptFor = (
	software: SupportedSoftware,
	sections: ISectionFromAPI[],
	shortcutKey: string,
) => {
	switch (software) {
		case 'AutoHotkey': {
			return getAutoHotkeyScript(sections, shortcutKey);
		}

		case 'Autokey': {
			return getAutokeyScript(sections, shortcutKey);
		}

		default: {
			throw new Error('Unknown software.');
		}
	}
};

const saveWithExtension = (data: string, name: string) => {
	saveAs(`data:text/plain;charset=utf-8,${encodeURIComponent(data)}`, name);
};

const saveKeyboardScriptFor = (
	software: SupportedSoftware,
	sections: ISectionFromAPI[],
	name: string,
	shortcutKey: string,
) => {
	switch (software) {
		case 'AutoHotkey': {
			saveWithExtension(getAutoHotkeyScript(sections, shortcutKey), `${name}.ahk`);
			break;
		}

		case 'Autokey': {
			throw new Error('Not yet implemented.');
		}

		default:
	}
};

export default saveKeyboardScriptFor;
