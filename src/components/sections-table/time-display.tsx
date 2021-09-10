import React from 'react';
import {Tooltip, Tag, TagProps} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {Schedule} from 'src/lib/rschedule';
import {DATE_DAY_CHAR_MAP} from 'src/lib/constants';

const padTime = (v: number) => v.toString().padStart(2, '0');

const DAYS_95_IN_MS = 95 * 24 * 60 * 60 * 1000;

export const getFormattedTimeFromSchedule = (jsonSchedule: Schedule.JSON | Schedule) => {
	const schedule = jsonSchedule.constructor === Schedule ? jsonSchedule : Schedule.fromJSON(jsonSchedule as Schedule.JSON);

	let days = '';
	let time = '';

	const occurences = schedule.collections({granularity: 'week', weekStart: 'SU'}).toArray();

	if (occurences.length > 0) {
		for (const d of occurences[0].dates) {
			days += DATE_DAY_CHAR_MAP[d.date.getDay()];

			const start = d.date;
			const end = d.end;

			time = `${padTime(start.getHours())}:${padTime(start.getMinutes())} ${start.getHours() >= 12 ? 'PM' : 'AM'} - ${padTime(end?.getHours() ?? 0)}:${padTime(end?.getMinutes() ?? 0)} ${(end?.getHours() ?? 0) >= 12 ? 'PM' : 'AM'}`;
		}
	}

	const start = schedule.firstDate?.toDateTime().date ?? new Date();
	const end = schedule.lastDate?.toDateTime().date ?? new Date();

	return {
		days,
		time,
		start: start.toLocaleDateString('en-US'),
		end: end.toLocaleDateString('en-US'),
		isHalf: (end.getTime() - start.getTime() < DAYS_95_IN_MS),
	};
};

const TimeDisplay = observer(({schedule, size}: {schedule: Schedule.JSON; size?: TagProps['size']}) => {
	const {days, time, start, end, isHalf} = getFormattedTimeFromSchedule(schedule);

	if (time === '') {
		return <>¯\_(ツ)_/¯</>;
	}

	return (
		<Tooltip label={`${start} - ${end} ${isHalf ? '(half semester)' : '(full semester)'}, EST`} aria-label="Date range">
			<Tag colorScheme={isHalf ? 'yellow' : 'green'} size={size}>
				<span style={{minWidth: '4ch', display: 'inline-block', marginRight: '0.25rem'}}>{days}</span>
				<span>{time}</span>
			</Tag>
		</Tooltip>
	);
});

export default TimeDisplay;
