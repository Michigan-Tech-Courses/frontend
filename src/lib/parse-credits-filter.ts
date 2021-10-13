const parseCreditsFilter = (value: string): [number, number | null] => {
	let min = 0;
	let max: number | null = 0;

	if (value.includes('-')) {
		const fragments = value.split('-');
		min = Number.parseFloat(fragments[0]);
		max = Number.parseFloat(fragments[1]);
	} else if (value.includes('+')) {
		const fragments = value.split('+');
		min = Number.parseFloat(fragments[0]);
		max = null;
	} else {
		min = Number.parseFloat(value);
		max = min;
	}

	return [min, max];
};

export default parseCreditsFilter;
