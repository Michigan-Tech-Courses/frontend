import {filterSection} from './search-filters';
import {ISectionFromAPIWithSchedule} from './types';
import {Schedule} from './rschedule';

const time = new Schedule();

const section: ISectionFromAPIWithSchedule = {
	id: 'sample-section',
	courseId: 'sample-course',
	crn: 'sample-crn',
	section: '0A',
	cmp: 'sample-cmp',
	minCredits: 3,
	maxCredits: 3,
	time: time.toJSON(),
	parsedTime: time,
	totalSeats: 60,
	takenSeats: 50,
	availableSeats: 10,
	fee: 0,
	instructors: [],
	updatedAt: new Date().toString(),
	deletedAt: null
};

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_WEEK_IN_MS = 7 * 24 * ONE_HOUR_IN_MS;

const startOfSemester = new Date();

const THRICE_WEEKLY = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS))
		}
	]
});

const THRICE_WEEKLY_BEGINNING_OF_SEMESTER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (13 * ONE_WEEK_IN_MS))
		}
	]
});

const THRICE_WEEKLY_END_OF_SEMESTER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() + (13 * ONE_WEEK_IN_MS)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS))
		}
	]
});

const THRICE_WEEKLY_SLIGHTLY_BEFORE = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() - (ONE_HOUR_IN_MS / 2)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS))
		}
	]
});

const THRICE_WEEKLY_SLIGHTLY_LATER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() + (ONE_HOUR_IN_MS / 2)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS))
		}
	]
});

const TWICE_WEEKLY = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['TU', 'TH'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS))
		}
	]
});

test('include when basket is empty', () => {
	expect(filterSection([['is', 'compatible']], section)).toBe('MATCHED');
});

test('remove if schedules are identical', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY
			},
			[
				{
					parsedTime: THRICE_WEEKLY
				}
			]))
		.toBe('REMOVE');
});

test('include if schedules are different', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY
			},
			[
				{
					parsedTime: TWICE_WEEKLY
				}
			]))
		.toBe('MATCHED');
});

test('remove if schedules slightly overlap (basket section is before)', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY
			},
			[
				{
					parsedTime: THRICE_WEEKLY_SLIGHTLY_BEFORE
				}
			]
		)
	).toBe('REMOVE');
});

test('remove if schedules slightly overlap (basket section is later)', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY
			},
			[
				{
					parsedTime: THRICE_WEEKLY_SLIGHTLY_LATER
				}
			]
		)
	).toBe('REMOVE');
});

test('include if schedules are identical but occur during different calendar periods (1)', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY_BEGINNING_OF_SEMESTER
			},
			[
				{
					parsedTime: THRICE_WEEKLY_END_OF_SEMESTER
				}
			]
		)
	).toBe('MATCHED');
});

test('include if schedules are identical but occur during different calendar periods (2)', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY_END_OF_SEMESTER
			},
			[
				{
					parsedTime: THRICE_WEEKLY_BEGINNING_OF_SEMESTER
				}
			]
		)
	).toBe('MATCHED');
});

test('remove if schedules overlap at begining of semester', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY_BEGINNING_OF_SEMESTER
			},
			[
				{
					parsedTime: THRICE_WEEKLY_SLIGHTLY_BEFORE
				}
			]
		)
	).toBe('REMOVE');
});

test('remove if schedules overlap at end of semester', () => {
	expect(
		filterSection(
			[['is', 'compatible']],
			{
				...section,
				parsedTime: THRICE_WEEKLY_END_OF_SEMESTER
			},
			[
				{
					parsedTime: THRICE_WEEKLY_SLIGHTLY_LATER
				}
			]
		)
	);
});
