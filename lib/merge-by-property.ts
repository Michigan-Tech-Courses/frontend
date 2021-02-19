const mergeByProperty = <T, K extends keyof T>(oldArray: T[], newArray: T[], property: K): T[] => {
	const oldMap = new Map<T[K], T>();

	oldArray.forEach(element => {
		const key = element[property];
		oldMap.set(key, element);
	});

	newArray.forEach(element => {
		const key = element[property];
		const old = oldMap.get(key);

		if (old) {
			oldMap.set(key, Object.assign(old, element));
		} else {
			oldMap.set(key, element);
		}
	});

	return Array.from(oldMap).map(([,value]) => value);
};

export default mergeByProperty;
