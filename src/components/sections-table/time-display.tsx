import React from 'react';
import {Tooltip, Tag, TagProps, ThemingProps} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {Schedule} from 'src/lib/rschedule';
import {DATE_DAY_CHAR_MAP} from 'src/lib/constants';

const padTime = (v: number) => v.toString().padStart(2, '0');

const DAYS_95_IN_MS = 95 * 24 * 60 * 60 * 1000;

export const getFormattedTimeFromSchedule = (schedule?: Schedule | null) => {
	let days = '';
	let time = '';
	let start = new Date();
	let end = new Date();

	if (schedule) {
		const occurences = schedule.collections({granularity: 'week', weekStart: 'SU'}).toArray();

		if (occurences.length > 0) {
			for (const d of occurences[0].dates) {
				days += DATE_DAY_CHAR_MAP[d.date.getDay()];

				const start = d.date;
				const end = d.end;

				time = `${padTime(start.getHours())}:${padTime(start.getMinutes())} ${start.getHours() >= 12 ? 'PM' : 'AM'} - ${padTime(end?.getHours() ?? 0)}:${padTime(end?.getMinutes() ?? 0)} ${(end?.getHours() ?? 0) >= 12 ? 'PM' : 'AM'}`;
			}
		}

		start = schedule.firstDate?.toDateTime().date ?? new Date();
		end = schedule.lastDate?.toDateTime().date ?? new Date();
	}

	return {
		days,
		time,
		start: start.toLocaleDateString('en-US'),
		end: end.toLocaleDateString('en-US'),
		isHalf: (end.getTime() - start.getTime() < DAYS_95_IN_MS),
	};
};

type TimeDisplayProps = {
	schedule?: Schedule | null;
	size?: TagProps['size'];
	colorScheme?: ThemingProps['colorScheme'];
};

const TimeDisplay = observer((props: TimeDisplayProps) => {
	const {days, time, start, end, isHalf} = getFormattedTimeFromSchedule(props.schedule);

	if (time === '') {
		return <>¯\_(ツ)_/¯</>;
	}

	let colorScheme = isHalf ? 'yellow' : 'green';

	if (props.colorScheme) {
		colorScheme = props.colorScheme;
	}

	return (
		<Tooltip label={`${start} - ${end} ${isHalf ? '(half semester)' : '(full semester)'}, EST`} aria-label="Date range">
			<Tag colorScheme={colorScheme} size={props.size}>
				<span style={{minWidth: '4ch', display: 'inline-block', marginRight: '0.25rem'}}>{days}</span>
				<span>{time}</span>
			</Tag>
		</Tooltip>
	);
});

export default TimeDisplay;
