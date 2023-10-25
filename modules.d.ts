import type {Workbox} from 'workbox-window';

declare module 'jest-next-dynamic'{
	const preloadAll: () => Promise<void>;
	export default preloadAll;
}

declare module '*.svg' {
	import {type ReactElement, type SVGProps} from 'react';

	const content: (props: SVGProps<SVGElement>) => ReactElement;
	export default content;
}

type ClipboardItem = {
	readonly types: string[];
	readonly presentationStyle: 'unspecified' | 'inline' | 'attachment';
	getType(): Promise<Blob>;
};

type ClipboardItemData = Record<string, Blob | string | Promise<Blob | string>>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare const ClipboardItem: {
	prototype: ClipboardItem;
	new (itemData: ClipboardItemData): ClipboardItem;
};

type Clipboard = {
	read(): Promise<DataTransfer>;
	write(data: ClipboardItem[]): Promise<void>;
};

export declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		workbox: Workbox;
	}
}
