import {ISectionFromAPI, ICourseFromAPI, ESemester, ELocationType} from './api-types';
import {THRICE_WEEKLY} from './do-schedules-conflict.test';
import sectionsToICS from './sections-to-ics';

const COURSE: ICourseFromAPI = {
	id: 'test-course-id',
	year: 2020,
	semester: ESemester.FALL,
	subject: 'CS',
	crse: '1000',
	title: 'Intro to Programming',
	description: '',
	prereqs: null,
	updatedAt: new Date().toISOString(),
	deletedAt: null,
	minCredits: 3,
	maxCredits: 3,
	offered: [],
};

const SECTION: ISectionFromAPI & {course: ICourseFromAPI} = {
	course: COURSE,

	id: 'test-section-id',
	courseId: COURSE.id,
	crn: 'test-crn',
	section: '1A',
	cmp: '1',
	minCredits: 3,
	maxCredits: 3,
	totalSeats: 20,
	takenSeats: 10,
	availableSeats: 10,
	fee: 0,
	instructors: [],
	locationType: ELocationType.PHYSICAL,
	buildingName: null,
	room: null,
	updatedAt: new Date().toISOString(),
	deletedAt: null,

	time: THRICE_WEEKLY.toJSON(),
};

test('snapshot', () => {
	let calendarString = sectionsToICS([SECTION], []);

	// Remove non-deterministic timestamp
	calendarString = calendarString.replace(/DTSTAMP:[^\n]+\n/, '');
	// Remove rrule, slightly different depending on timezone but
	// we don't care because the day is important, not the time
	calendarString = calendarString.replaceAll(/RRULE:[^\n]+\n/g, '');
	expect(calendarString).toMatchSnapshot();
});
