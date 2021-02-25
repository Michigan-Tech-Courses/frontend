import {ICourseFromAPI, ISectionFromAPI} from './types';

export const qualifiers = ['subject', 'level', 'has', 'credits'];

export const filterCourse = (tokenPairs: Array<[string, string]>, course: ICourseFromAPI) => {
	for (const pair of tokenPairs) {
		const qualifier = pair[0];
		const value = pair[1];

		switch (qualifier) {
			case 'subject': {
				if (!course.subject.toLowerCase().includes(value.toLowerCase())) {
					return false;
				}

				break;
			}

			case 'level': {
				let requestedLevel: number;
				let inclusive = false;
				if (value.endsWith('+')) {
					inclusive = true;
					requestedLevel = Number.parseInt(value.slice(0, -1), 10);
				} else {
					requestedLevel = Number.parseInt(value, 10);
				}

				const courseLevel = Number.parseInt(course.crse, 10);

				if (!(inclusive ? requestedLevel <= courseLevel : requestedLevel <= courseLevel && courseLevel < requestedLevel + 1000)) {
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

export const filterSection = (tokenPairs: Array<[string, string]>, section: ISectionFromAPI): TQualifierResult => {
	let result: TQualifierResult = 'NOMATCH';

	for (const pair of tokenPairs) {
		// Short circuit
		if (result === 'REMOVE') {
			return result;
		}

		const qualifier = pair[0];
		const value = pair[1];

		switch (qualifier) {
			case 'has': {
				if (value === 'seats') {
					result = section.availableSeats <= 0 ? 'REMOVE' : 'MATCHED';
				}

				break;
			}

			default:
				break;
		}
	}

	return result;
};
