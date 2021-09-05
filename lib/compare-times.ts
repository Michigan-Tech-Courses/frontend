/** Compare two times.
 * Returns 0 if equal, -1 if first time is earlier, 1 if first time is later
 */
const compareTimes = (time1: Date, time2: Date) => {
	const hours1 = time1.getHours();
	const minutes1 = time1.getMinutes();
	const hours2 = time2.getHours();
	const minutes2 = time2.getMinutes();

	const totalMinutes1 = (hours1 * 60) + minutes1;
	const totalMinutes2 = (hours2 * 60) + minutes2;

	const diff = totalMinutes1 - totalMinutes2;

	if (diff === 0) {
		return 0;
	}

	if (diff > 0) {
		return 1;
	}

	return -1;
};

export default compareTimes;
