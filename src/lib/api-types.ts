import {type Except} from 'type-fest';
import {type Schedule} from './rschedule';

export enum ESemester {
	SPRING = 'SPRING',
	FALL = 'FALL',
	SUMMER = 'SUMMER',
}

export enum ELocationType {
	PHYSICAL = 'PHYSICAL',
	ONLINE = 'ONLINE',
	REMOTE = 'REMOTE',
	UNKNOWN = 'UNKNOWN',
}

export type IInstructorFromAPI = {
	id: number;
	fullName: string;
	departments: string[];
	email: string | undefined;
	phone: string | undefined;
	office: string | undefined;
	websiteURL: string | undefined;
	photoURL: string | undefined;
	thumbnailURL: string | undefined;
	interests: string[];
	occupations: string[];
	averageDifficultyRating: number | undefined;
	averageRating: number | undefined;
	numRatings: number | undefined;
	rmpId: string | undefined;
	updatedAt: string;
	deletedAt: string | undefined;
};

export type IPassFailDropRecord = {
	year: number;
	dropped: number;
	failed: number;
	total: number;
	semester: ESemester;
};

export type IPassFailDropFromAPI = Record<string, IPassFailDropRecord[]>;

export type IBuildingFromAPI = {
	name: string;
	shortName: string;
	lat: number;
	lon: number;
};

export type ISectionFromAPI = {
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
	locationType: ELocationType;
	buildingName: string | undefined;
	room: string | undefined;
	updatedAt: string;
	deletedAt: string | undefined;
};

export type ISectionFromAPIWithSchedule = ISectionFromAPI & {
	parsedTime: Schedule | undefined;
};

export type ICourseFromAPI = {
	id: string;
	year: number;
	semester: ESemester;
	subject: string;
	crse: string;
	title: string;
	description: string | undefined;
	prereqs: string | undefined;
	updatedAt: string;
	deletedAt: string | undefined;
	offered: string[] | undefined;
	minCredits: number;
	maxCredits: number;
};
export type ITransferCourseFromAPI = {
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
};

export type IFullCourseFromAPI = ICourseFromAPI & {
	sections: Array<Except<ISectionFromAPI, 'instructors'> &
	{instructors: Array<Except<IInstructorFromAPI, 'thumbnailURL'>>}>;
};
