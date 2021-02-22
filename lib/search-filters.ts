import {ICourseFromAPI} from './types';

export const qualifiers = ['subject', 'level'];

export const filterCourse = (tokenPairs: Array<[string, string]>, course: ICourseFromAPI) => {
	let includeCourse = true;

	tokenPairs.forEach(pair => {
		const qualifier = pair[0];
		const value = pair[1];

		switch (qualifier) {
			case 'subject': {
				if (!course.subject.toLowerCase().includes(value.toLowerCase())) {
					includeCourse = false;
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

				includeCourse = inclusive ? requestedLevel <= courseLevel : requestedLevel <= courseLevel && courseLevel < requestedLevel + 1000;

				break;
			}

			default:
				throw new Error('Bad qualifier');
		}
	});

	return includeCourse;
};
