import {IPotentialFutureSemester} from './types';

const areSemestersEqual = (firstSemester: IPotentialFutureSemester, secondSemester: IPotentialFutureSemester) => {
	if (firstSemester.isFuture) {
		if (firstSemester.semester === secondSemester.semester) {
			return true;
		}

		return false;
	}

	if (!secondSemester.isFuture && firstSemester.semester === secondSemester.semester
        && firstSemester.year === secondSemester.year) {
		return true;
	}

	return false;
};

export default areSemestersEqual;
