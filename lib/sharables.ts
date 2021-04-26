interface ShareCourseStruct {
	type: 'SHARE_COURSE';
	data: {
		year: number;
		semester: string;
		subject: string;
		crse: string;
	};
}

interface ShareSectionStruct {
	type: 'SHARE_SECTION';
	data: {
		year: number;
		semester: string;
		crn: string;
	};
}

export type ShareableStruct = {version: number} & (ShareCourseStruct | ShareSectionStruct);

export const encodeShareable = (data: ShareableStruct) => {
	return Buffer.from(JSON.stringify(data)).toString('base64');
};

export const decodeShareable = (packed: string): ShareableStruct => {
	return JSON.parse(Buffer.from(packed, 'base64').toString()) as ShareableStruct;
};
