const getCreditsString = (min: number, max: number) => {
	if (min === max) {
		return min.toString();
	}

	return `${min}-${max}`;
};

export default getCreditsString;
