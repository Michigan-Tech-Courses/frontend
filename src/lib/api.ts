import {IFullCourseFromAPI, IPassFailDropFromAPI} from './api-types';

const API = {
	findFirstCourse: async (options: {semester: string; year: number; subject: string; crse: string}): Promise<IFullCourseFromAPI | null> => {
		const url = new URL('/courses/first', process.env.NEXT_PUBLIC_API_ENDPOINT);

		url.searchParams.set('semester', options.semester);
		url.searchParams.set('year', options.year.toString());
		url.searchParams.set('subject', options.subject);
		url.searchParams.set('crse', options.crse);

		return (await fetch(url.toString())).json() as Promise<IFullCourseFromAPI>;
	},

	getStats: async (options: {crse: string; subject: string}): Promise<IPassFailDropFromAPI> => {
		const url = new URL('/passfaildrop', process.env.NEXT_PUBLIC_API_ENDPOINT);

		url.searchParams.set('courseSubject', options.subject);
		url.searchParams.set('courseCrse', options.crse);

		return (await fetch(url.toString())).json() as Promise<IPassFailDropFromAPI>;
	},
};

export default API;
