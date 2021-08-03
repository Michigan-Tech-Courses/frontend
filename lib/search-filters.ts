import memoizeOne from 'memoize-one';
import {ICourseFromAPI, ISectionFromAPIWithSchedule} from './types';
import {Schedule, intersection} from './rschedule';

export const qualifiers = ['subject', 'level', 'has', 'credits', 'id'];

const generateArrayFromRange = memoizeOne((low: number, high: number): number[] => {
	const result = [];

	for (let i = low; i <= high; i++) {
		result.push(i);
	}

	return result;
});

const getSchedulesFromSections = memoizeOne((sections: ISectionFromAPIWithSchedule[]) => sections.reduce<Schedule[]>((accum, basketSection) => {
	if (basketSection.parsedTime) {
		return [...accum, basketSection.parsedTime];
	}

	return accum;
}, []));

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
	basketSections?: ISectionFromAPIWithSchedule[]
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
					const intersections = section.parsedTime.pipe(
						intersection({
							streams: getSchedulesFromSections(basketSections),
							maxFailedIterations: 10
						})
					);

					result = intersections.firstDate ? 'REMOVE' : 'MATCHED';
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
