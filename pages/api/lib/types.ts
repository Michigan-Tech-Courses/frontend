export type FileType = 'png' | 'jpeg';

export interface CoursePreview {
	type: 'COURSE';
	title: string;
}

export type ParsedRequest = {fileType: FileType} & CoursePreview;
