const mergeByProperty = <T, K extends keyof T>(oldArray: T[], newArray: T[], property: K): T[] => {
	const oldMap = new Map<T[K], T>();

	for (const element of oldArray) {
		const key = element[property];
		oldMap.set(key, element);
	}

	for (const element of newArray) {
		const key = element[property];
		const old = oldMap.get(key);

		if (old) {
			oldMap.set(key, Object.assign(old, element));
		} else {
			oldMap.set(key, element);
		}
	}

	const results = [];

	for (const [,value] of Array.from(oldMap)) {
		results.push(value);
	}

	return results;
};

export default mergeByProperty;
