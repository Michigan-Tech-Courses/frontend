import doSchedulesConflict from './do-schedules-conflict';
import {Schedule} from './rschedule';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const ONE_WEEK_IN_MS = 7 * 24 * ONE_HOUR_IN_MS;

const startOfSemester = new Date('07/01/2021 10:00 AM');

const THRICE_WEEKLY = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const THRICE_WEEKLY_LATER_IN_DAY = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() + (2 * ONE_HOUR_IN_MS)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const THRICE_WEEKLY_BEGINNING_OF_SEMESTER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (13 * ONE_WEEK_IN_MS)),
		},
	],
});

const THRICE_WEEKLY_END_OF_SEMESTER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() + (13 * ONE_WEEK_IN_MS)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const THRICE_WEEKLY_SLIGHTLY_BEFORE = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() - (ONE_HOUR_IN_MS / 2)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const THRICE_WEEKLY_SLIGHTLY_LATER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['MO', 'WE', 'FR'],
			start: new Date(startOfSemester.getTime() + (ONE_HOUR_IN_MS / 2)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const TWICE_WEEKLY = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['TU', 'TH'],
			start: startOfSemester,
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

const ONCE_WEEKLY_SLIGHTLY_BEFORE_END_OF_SEMESTER = new Schedule({
	rrules: [
		{
			frequency: 'WEEKLY',
			duration: ONE_HOUR_IN_MS,
			byDayOfWeek: ['FR'],
			start: new Date(startOfSemester.getTime() + (13 * ONE_WEEK_IN_MS)),
			end: new Date(startOfSemester.getTime() + (26 * ONE_WEEK_IN_MS)),
		},
	],
});

test('true if identical schedules', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, THRICE_WEEKLY)).toBe(true);
});

test('false if different schedules', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, TWICE_WEEKLY)).toBe(false);
});

test('false if schedules are on same day but later', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, THRICE_WEEKLY_LATER_IN_DAY)).toBe(false);
});

test('true if schedules slightly overlap (1)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, THRICE_WEEKLY_SLIGHTLY_BEFORE)).toBe(true);
});

test('true if schedules slightly overlap (2)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, THRICE_WEEKLY_SLIGHTLY_LATER)).toBe(true);
});

test('false if schedules are identical but occur different calendar periods (1)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY_BEGINNING_OF_SEMESTER, THRICE_WEEKLY_END_OF_SEMESTER)).toBe(false);
});

test('false if schedules are identical but occur different calendar periods (2)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY_END_OF_SEMESTER, THRICE_WEEKLY_BEGINNING_OF_SEMESTER)).toBe(false);
});

test('true if schedules overlap at beginning of semester', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY_BEGINNING_OF_SEMESTER, THRICE_WEEKLY_SLIGHTLY_BEFORE)).toBe(true);
});

test('true if schedules overlap at end of semester (1)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY_END_OF_SEMESTER, THRICE_WEEKLY_SLIGHTLY_LATER)).toBe(true);
});

test('true if schedules overlap at end of semester (2)', () => {
	expect(doSchedulesConflict(THRICE_WEEKLY, ONCE_WEEKLY_SLIGHTLY_BEFORE_END_OF_SEMESTER)).toBe(true);
});
