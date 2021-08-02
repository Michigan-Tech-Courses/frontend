declare module 'jest-next-dynamic';

declare module '*.svg' {
	import {ReactElement, SVGProps} from 'react';
	const content: (props: SVGProps<SVGElement>) => ReactElement;
	export default content;
}

interface ClipboardItem {
	readonly types: string[];
	readonly presentationStyle: 'unspecified' | 'inline' | 'attachment';
	getType(): Promise<Blob>;
}

type ClipboardItemData = Record<string, Blob | string | Promise<Blob | string>>;

declare const ClipboardItem: {
	prototype: ClipboardItem;
	new (itemData: ClipboardItemData): ClipboardItem;
};

interface Clipboard {
	read(): Promise<DataTransfer>;
	write(data: ClipboardItem[]): Promise<void>;
}
