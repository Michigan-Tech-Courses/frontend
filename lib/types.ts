export enum ESemester {
	SPRING = 'SPRING',
	FALL = 'FALL',
	SUMMER = 'SUMMER'
}

export interface IInstructorFromAPI {
	id: number;
	fullName: string;
	departments: string[];
	email: string | null;
	phone: string | null;
	office: string | null;
	websiteURL: string | null;
	thumbnailURL: string | null;
	interests: string[];
	occupations: string[];
	averageDifficultyRating: number | null;
	averageRating: number | null;
	numRatings: number | null;
	rmpId: string | null;
	updatedAt: string;
	deletedAt: string | null;
}

export type IPassFailDropFromAPI = Record<string, {
	year: number;
	dropped: number;
	failed: number;
	total: number;
	semester: ESemester;
}>;

export interface ISectionFromAPI {
	id: string;
	courseId: string;
	crn: string;
	section: string;
	cmp: string;
	minCredits: number;
	maxCredits: number;
	time: Record<string, unknown>;
	totalSeats: number;
	takenSeats: number;
	availableSeats: number;
	fee: number;
	instructors: Array<{
		id: number;
	}>;
	updatedAt: string;
	deletedAt: string | null;
}

export interface ICourseFromAPI {
	id: string;
	year: number;
	semester: ESemester;
	subject: string;
	crse: string;
	title: string;
	description: string | null;
	updatedAt: string;
	deletedAt: string | null;
}
