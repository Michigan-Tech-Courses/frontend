export class ArrayMap<T> {
	private readonly map = new Map<string | number, T[]>();

	put(key: string | number, value: T, dedupField?: keyof T) {
		const existingValue = this.map.get(key);

		if (existingValue) {
			if (dedupField && existingValue.filter(v => v[dedupField] === value[dedupField])) {
				return;
			}

			this.map.set(key, [...existingValue, value]);
		} else {
			this.map.set(key, [value]);
		}
	}

	get(key: string | number): T[] | undefined {
		return this.map.get(key);
	}
}
