import memoizeOne from 'memoize-one';
import {Schedule} from './rschedule';
import {ICourseFromAPI, ISectionFromAPIWithSchedule} from './types';

export const qualifiers = ['subject', 'level', 'has', 'credits', 'id'];

const generateArrayFromRange = memoizeOne((low: number, high: number): number[] => {
	const result = [];

	for (let i = low; i <= high; i++) {
		result.push(i);
	}

	return result;
});

const doRuleSetsOverlap = (firstRuleSet: Schedule['rrules'], secondRuleSet: Schedule['rrules']) => {
	// Same principle as merge sort
	let firstRuleSetI = 0;
	let secondRuleSetI = 0;
	while (firstRuleSetI < firstRuleSet.length && secondRuleSetI < secondRuleSet.length) {
		const currentFirstRuleSetRule = firstRuleSet[firstRuleSetI];
		const currentSecondRuleSetRule = secondRuleSet[secondRuleSetI];

		if (!currentFirstRuleSetRule.firstDate?.date) {
			continue;
		}

		if (!currentSecondRuleSetRule.firstDate?.date) {
			continue;
		}

		if (currentFirstRuleSetRule.firstDate.date < currentSecondRuleSetRule.firstDate.date) {
			// Check if end overlaps
			if (currentFirstRuleSetRule.firstDate.end &&
					currentFirstRuleSetRule.firstDate.end > currentSecondRuleSetRule.firstDate.date) {
				return true;
			}
		} else if (currentFirstRuleSetRule.firstDate.date > currentSecondRuleSetRule.firstDate.date && // Check if start overlaps
			currentSecondRuleSetRule.firstDate.end &&
					currentFirstRuleSetRule.firstDate.date < currentSecondRuleSetRule.firstDate.end) {
			return true;
		}

		if (currentFirstRuleSetRule.firstDate.date < currentSecondRuleSetRule.firstDate.date) {
			firstRuleSetI++;
		} else {
			secondRuleSetI++;
		}
	}

	return false;
};

export const filterCourse = (tokenPairs: Array<[string, string]>, course: ICourseFromAPI) => {
	for (const pair of tokenPairs) {
		const qualifier = pair[0];
		const value = pair[1];

		switch (qualifier) {
			case 'subject': {
				if (!(course.subject.toLowerCase() === value.toLowerCase())) {
					return false;
				}

				break;
			}

			case 'level': {
				let min = 0;
				let max = 0;

				if (value.includes('-')) {
					const fragments = value.split('-');
					min = Number.parseFloat(fragments[0]);
					max = Number.parseFloat(fragments[1]);
				} else if (value.includes('+')) {
					const fragments = value.split('+');
					min = Number.parseFloat(fragments[0]);
					max = Number.MAX_SAFE_INTEGER;
				} else {
					min = Number.parseFloat(value);
					max = (Math.floor((min + 1000) / 1000) * 1000) - 1; // Math.ceil((min + 0.1) / 1000) * 1000;
				}

				const courseLevel = Number.parseInt(course.crse, 10);
				const shouldInclude = min <= courseLevel && courseLevel <= max;

				if (!shouldInclude) {
					return false;
				}

				break;
			}

			default:
				break;
		}
	}

	return true;
};

// 3 states: MATCHED, NOMATCH, REMOVE
export type TQualifierResult = 'MATCHED' | 'NOMATCH' | 'REMOVE';

export const filterSection = (
	tokenPairs: Array<[string, string]>,
	section: ISectionFromAPIWithSchedule,
	basketSections: Array<Pick<ISectionFromAPIWithSchedule, 'parsedTime'>> = []
): TQualifierResult => {
	let result: TQualifierResult = 'NOMATCH';

	for (const pair of tokenPairs) {
		// Short circuit
		if (result === 'REMOVE') {
			return result;
		}

		const qualifier = pair[0];
		const value = pair[1];

		switch (qualifier) {
			case 'id': {
				result = section.id === value ? 'MATCHED' : 'REMOVE';

				break;
			}

			case 'has': {
				if (value === 'seats') {
					result = section.availableSeats <= 0 ? 'REMOVE' : 'MATCHED';
				} else if (value === 'time') {
					result = (section.parsedTime?.firstDate) ? 'MATCHED' : 'REMOVE';
				}

				break;
			}

			case 'is': {
				if (value === 'compatible' && basketSections && section.parsedTime) {
					// There's a much more elegant solution to this using the intersection operator from rSchedule.
					// However, static analysis is far faster.
					// See: https://gitlab.com/john.carroll.p/rschedule/-/issues/61

					for (const {parsedTime} of basketSections) {
						// Quick & cheap check
						if (parsedTime?.firstDate?.date.getTime() === section.parsedTime.firstDate?.date.getTime()) {
							result = 'REMOVE';
							break;
						}

						const basketRules = parsedTime?.rrules ?? [];
						const sectionRules = section.parsedTime.rrules ?? [];

						if (doRuleSetsOverlap(basketRules, sectionRules)) {
							result = 'REMOVE';
						}

						if (result === 'REMOVE') {
							break;
						}
					}

					if (result !== 'REMOVE') {
						result = 'MATCHED';
					}
				}

				break;
			}

			case 'credits': {
				let min = 0;
				let max = 0;

				if (value.includes('-')) {
					const fragments = value.split('-');
					min = Number.parseFloat(fragments[0]);
					max = Number.parseFloat(fragments[1]);
				} else if (value.includes('+')) {
					const fragments = value.split('+');
					min = Number.parseFloat(fragments[0]);
					max = Number.MAX_SAFE_INTEGER;
				} else {
					min = Number.parseFloat(value);
					max = min;
				}

				if (!Number.isNaN(min) && !Number.isNaN(max)) {
					for (const possibleCredit of generateArrayFromRange(section.minCredits, section.maxCredits)) {
						if (min <= possibleCredit && possibleCredit <= max) {
							result = 'MATCHED';
						}
					}

					if (result !== 'MATCHED') {
						result = 'REMOVE';
					}
				}

				break;
			}

			default:
				break;
		}
	}

	return result;
};
