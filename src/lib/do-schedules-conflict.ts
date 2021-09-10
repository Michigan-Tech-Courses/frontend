import compareTimes from './compare-times';
import {Schedule} from './rschedule';

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
			if (!currentFirstRuleSetRule.firstDate?.date || !currentFirstRuleSetRule.lastDate?.date) {
				continue;
			}

			if (!currentSecondRuleSetRule.firstDate?.date || !currentSecondRuleSetRule.lastDate?.date) {
				continue;
			}

			// If rules occur during completely separate calendar periods
			if (currentFirstRuleSetRule.lastDate.date < currentSecondRuleSetRule.firstDate.date
          || currentSecondRuleSetRule.lastDate.date < currentFirstRuleSetRule.firstDate.date) {
				continue;
			}

			const firstByDayOfWeek = currentFirstRuleSetRule.options.byDayOfWeek;
			const secondByDayOfWeek = currentSecondRuleSetRule.options.byDayOfWeek;

			if (!firstByDayOfWeek || !secondByDayOfWeek) {
				continue;
			}

			const firstStart = currentFirstRuleSetRule.firstDate.date;
			const firstEnd = addDuration(firstStart, currentFirstRuleSetRule.duration!);
			const secondStart = currentSecondRuleSetRule.firstDate.date;
			const secondEnd = addDuration(secondStart, currentSecondRuleSetRule.duration!);

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
		}
	}

	return false;
};

export default doSchedulesConflict;
