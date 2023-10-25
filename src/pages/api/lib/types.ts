export type FileType = 'png' | 'jpeg';

export type CoursePreview = {
	type: 'COURSE';
	title: string;
	semester: string;
};

export type ParsedRequest = {fileType: FileType} & CoursePreview;
