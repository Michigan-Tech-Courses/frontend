export class ArrayMap<T> {
	private readonly map = new Map<string, T[]>();

	put(key: string, value: T) {
		const existingValue = this.map.get(key);

		if (existingValue) {
			this.map.set(key, [...existingValue, value]);
		} else {
			this.map.set(key, [value]);
		}
	}

	get(key: string): T[] | null {
		return this.map.get(key) ?? null;
	}
}
