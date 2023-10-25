import {type IPotentialFutureTerm} from './types';

const areTermsEqual = (firstTerm: IPotentialFutureTerm, secondTerm: IPotentialFutureTerm) => {
	if (firstTerm.isFuture) {
		if (
			secondTerm.isFuture
			&& firstTerm.semester === secondTerm.semester) {
			return true;
		}

		return false;
	}

	if (!secondTerm.isFuture && firstTerm.semester === secondTerm.semester
        && firstTerm.year === secondTerm.year) {
		return true;
	}

	return false;
};

export default areTermsEqual;
