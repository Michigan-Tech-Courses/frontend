import {Except} from 'type-fest';
import {Schedule} from './rschedule';

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
	photoURL: string | null;
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

export type IPassFailDropRecord = {
	year: number;
	dropped: number;
	failed: number;
	total: number;
	semester: ESemester;
};

export type IPassFailDropFromAPI = Record<string, IPassFailDropRecord[]>;

export interface ISectionFromAPI {
	id: string;
	courseId: string;
	crn: string;
	section: string;
	cmp: string;
	minCredits: number;
	maxCredits: number;
	time: Schedule.JSON;
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

export type ISectionFromAPIWithSchedule = ISectionFromAPI & {
	parsedTime: Schedule | null;
};

export interface ICourseFromAPI {
	id: string;
	year: number;
	semester: ESemester;
	subject: string;
	crse: string;
	title: string;
	description: string | null;
	prereqs: string | null;
	updatedAt: string;
	deletedAt: string | null;
}
export interface ITransferCourseFromAPI {
	id: string;
	fromCollege: string;
	fromCollegeState: string;
	fromCRSE: string;
	fromCredits: number;
	fromSubject: string;
	toCRSE: string;
	toCredits: number;
	toSubject: string;
	title: string;
	updatedAt: string;
}

export type IFullCourseFromAPI = ICourseFromAPI & {
	sections: Array<Except<ISectionFromAPI, 'instructors'> &
	{instructors: Array<Except<IInstructorFromAPI, 'thumbnailURL'>>}>;
};
