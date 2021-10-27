import React from 'react';
import {Tooltip, Tag, TagProps, ThemingProps} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {Schedule} from 'src/lib/rschedule';
import {DATE_DAY_CHAR_MAP} from 'src/lib/constants';

const padTime = (v: number) => v.toString().padStart(2, '0');

const DAYS_95_IN_MS = 95 * 24 * 60 * 60 * 1000;

export const getFormattedTimeFromSchedule = (schedule?: Schedule | null) => {
	let start = new Date();
	let end = new Date();

	const timeStringToDay: Record<string, string[]> = {};

	if (schedule) {
		const occurences = schedule.collections({granularity: 'week', weekStart: 'SU'}).toArray();

		if (occurences.length > 0) {
			for (const d of occurences[0].dates) {
				const start = d.date;
				const end = d.end;

				const timeForThisDay = `${padTime(start.getHours())}:${padTime(start.getMinutes())} ${start.getHours() >= 12 ? 'PM' : 'AM'} - ${padTime(end?.getHours() ?? 0)}:${padTime(end?.getMinutes() ?? 0)} ${(end?.getHours() ?? 0) >= 12 ? 'PM' : 'AM'}`;

				const dayChar = DATE_DAY_CHAR_MAP[d.date.getDay()];

				if (timeStringToDay[timeForThisDay]) {
					timeStringToDay[timeForThisDay].push(dayChar);
				} else {
					timeStringToDay[timeForThisDay] = [dayChar];
				}
			}
		}

		start = schedule.firstDate?.toDateTime().date ?? new Date();
		end = schedule.lastDate?.toDateTime().date ?? new Date();
	}

	const [mostCommonTimeString, ...otherTimeStrs] = Object.keys(timeStringToDay).sort((timeString1, timeString2) => timeStringToDay[timeString2].length - timeStringToDay[timeString1].length);

	let days = `${timeStringToDay[mostCommonTimeString].join('')}`;

	if (otherTimeStrs.length > 0) {
		for (const timeString of otherTimeStrs) {
			days += `/${timeStringToDay[timeString].join('')}`;
		}
	}

	const isHalf = (end.getTime() - start.getTime() < DAYS_95_IN_MS);

	let info = `${start.toLocaleDateString('en-US')} - ${end.toLocaleDateString('en-US')} ${isHalf ? '(half semester)' : '(full semester)'}`;

	if (otherTimeStrs.length > 0) {
		for (const timeString of otherTimeStrs) {
			info += `, ${timeString} on ${timeStringToDay[timeString].join('')}`;
		}
	}

	info += ', EST';

	return {
		days,
		time: mostCommonTimeString,
		start: start.toLocaleDateString('en-US'),
		end: end.toLocaleDateString('en-US'),
		isHalf,
		info,
	};
};

type TimeDisplayProps = {
	schedule?: Schedule | null;
	size?: TagProps['size'];
	colorScheme?: ThemingProps['colorScheme'];
};

const TimeDisplay = observer((props: TimeDisplayProps) => {
	const {days, time, isHalf, info} = getFormattedTimeFromSchedule(props.schedule);

	if (time === '') {
		return <>¯\_(ツ)_/¯</>;
	}

	let colorScheme = isHalf ? 'yellow' : 'green';

	if (props.colorScheme) {
		colorScheme = props.colorScheme;
	}

	return (
		<Tooltip label={info} aria-label="Date range">
			<Tag colorScheme={colorScheme} size={props.size}>
				<span style={{minWidth: '4ch', display: 'inline-block', marginRight: '0.25rem'}}>{days}</span>
				<span>{time}</span>
			</Tag>
		</Tooltip>
	);
});

export default TimeDisplay;
