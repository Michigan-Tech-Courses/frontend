/** Copies day-of-year from first argument to second. */
const matchDateOnTime = (date: Date, onToTime: Date) => {
	const d = new Date(date);

	d.setMilliseconds(onToTime.getMilliseconds());
	d.setSeconds(onToTime.getSeconds());
	d.setMinutes(onToTime.getMinutes());
	d.setHours(onToTime.getHours());

	return d;
};

export default matchDateOnTime;
