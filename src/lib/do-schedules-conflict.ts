import compareTimes from './compare-times';
import {type Schedule, type Rule} from './rschedule';

const getCommonElementsInArrays = <T>(array1: T[], array2: T[]) => {
	const common: T[] = [];

	for (const element of array1) {
		if (array2.includes(element)) {
			common.push(element);
		}
	}

	return common;
};

const addDuration = (date: Date, ms: number) => new Date(date.getTime() + ms);

const doTwoRulesConflict = (firstRule: Rule, secondRule: Rule) => {
	if (!firstRule.firstDate?.date || !firstRule.lastDate?.date) {
		return false;
	}

	if (!secondRule.firstDate?.date || !secondRule.lastDate?.date) {
		return false;
	}

	// If rules occur during completely separate calendar periods
	if (firstRule.lastDate.date < secondRule.firstDate.date
			|| secondRule.lastDate.date < firstRule.firstDate.date) {
		return false;
	}

	const firstByDayOfWeek = firstRule.options.byDayOfWeek;
	const secondByDayOfWeek = secondRule.options.byDayOfWeek;

	if (!firstByDayOfWeek || !secondByDayOfWeek) {
		return false;
	}

	const firstStart = firstRule.firstDate.date;
	const firstEnd = addDuration(firstStart, firstRule.duration!);
	const secondStart = secondRule.firstDate.date;
	const secondEnd = addDuration(secondStart, secondRule.duration!);

	if (getCommonElementsInArrays(firstByDayOfWeek, secondByDayOfWeek).length > 0) {
		const compareStartResult = compareTimes(firstStart, secondStart);

		if (compareStartResult === 0) {
			return true;
		}

		if (compareStartResult === -1) { // Check if first starts before second
			// Check if end overlaps
			if (compareTimes(firstEnd, secondStart) === 1) {
				return true;
			}
		} else if (compareStartResult === 1 // Check if first starts after second
			// Check if start overlaps
			&& compareTimes(firstStart, secondEnd) === -1) {
			return true;
		}
	}
};

const doSchedulesConflict = (firstSchedule: Schedule, secondSchedule: Schedule) => {
	// There's a much more elegant solution to this using the intersection operator from rSchedule.
	// However, static analysis is far faster.
	// See: https://gitlab.com/john.carroll.p/rschedule/-/issues/61

	// Quick & cheap check
	if (firstSchedule.firstDate?.date.getTime() === secondSchedule.firstDate?.date.getTime()) {
		return true;
	}

	const firstRuleSet = firstSchedule.rrules;
	const secondRuleSet = secondSchedule.rrules;

	// In the vast majority of cases there will be a single rule in each set,
	// so O(n^2) shouldn't matter too much. (Famous last words...)
	for (const currentFirstRuleSetRule of firstRuleSet) {
		for (const currentSecondRuleSetRule of secondRuleSet) {
			if (doTwoRulesConflict(currentFirstRuleSetRule, currentSecondRuleSetRule)) {
				return true;
			}
		}
	}

	return false;
};

export default doSchedulesConflict;
