import {type ESemester, type IFullCourseFromAPI, type IPassFailDropFromAPI} from './api-types';

export type IFindFirstCourseParameters = {
	semester?: ESemester;
	year?: number;
	subject: string;
	crse: string;
};

const API = {
	async findFirstCourse(options: IFindFirstCourseParameters): Promise<IFullCourseFromAPI | undefined> {
		const url = new URL('/courses/first', process.env.NEXT_PUBLIC_API_ENDPOINT);

		if (options.semester) {
			url.searchParams.set('semester', options.semester);
		}

		if (options.year) {
			url.searchParams.set('year', options.year.toString());
		}

		url.searchParams.set('subject', options.subject);
		url.searchParams.set('crse', options.crse);

		return (await fetch(url.toString())).json() as Promise<IFullCourseFromAPI>;
	},

	async getStats(options: {crse: string; subject: string}): Promise<IPassFailDropFromAPI> {
		const url = new URL('/passfaildrop', process.env.NEXT_PUBLIC_API_ENDPOINT);

		url.searchParams.set('courseSubject', options.subject);
		url.searchParams.set('courseCrse', options.crse);

		return (await fetch(url.toString())).json() as Promise<IPassFailDropFromAPI>;
	},
};

export default API;
