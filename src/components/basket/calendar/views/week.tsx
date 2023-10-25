import React, {useMemo} from 'react';
import {
	Tbody,
	Tr,
	Td,
	Th,
	Thead,
	Box,
	VStack,
	HStack,
	Tooltip,
	Spacer,
} from '@chakra-ui/react';
import type useCalendar from '@veccu/react-calendar';
import enUS from 'date-fns/locale/en-US';
import {
	add,
	sub,
	format,
	areIntervalsOverlapping,
	eachHourOfInterval,
	differenceInMinutes,
	differenceInDays,
} from 'date-fns';
import {type CalendarBodyWithEvents, type CalendarEvent} from 'src/components/basket/calendar/types';
import compareTimes from 'src/lib/compare-times';
import matchDateOnTime from 'src/lib/match-date-on-time';
import styles from './styles/week.module.scss';

const TIME_STEPS_HOURS = 2;
const TIME_STEPS_MINUTES = TIME_STEPS_HOURS * 60;

type WeekViewProps = {
	body: CalendarBodyWithEvents;
	headers: ReturnType<typeof useCalendar>['headers'];
	onEventClick: (event: CalendarEvent) => void;
};

const WeekView = ({body, headers, onEventClick}: WeekViewProps) => {
	const startDate = useMemo(() => body.value[0].value[0].value, [body]);

	const events = useMemo(() => {
		const events = body.value.map(({value}) => value.map(({events}) => events)).flat(2);

		const eventsWithMetadata: Array<(typeof events)[0] & {overlapOffset: number; dayOffset: number}> = [];

		for (const event of events) {
			eventsWithMetadata.push({
				...event,
				dayOffset: differenceInDays(event.start, startDate),
				overlapOffset: eventsWithMetadata.reduce((accum, eventToCompareOverlap) => {
					if (areIntervalsOverlapping(event, eventToCompareOverlap)) {
						return accum + 1;
					}

					return accum;
				}, 0),
			});
		}

		return eventsWithMetadata;
	}, [body, startDate]);

	const {minTime, maxTime} = useMemo(() => {
		let min = new Date();
		let max = new Date(1970, 0, 1, 1, 0);

		for (const event of events) {
			if (compareTimes(min, event.start) === 1) {
				min = event.start;
			}

			if (compareTimes(max, event.end) === -1) {
				max = event.end;
			}
		}

		// Add padding
		min = sub(min, {hours: 1});
		max = matchDateOnTime(min, add(max, {hours: 1}));

		return {
			minTime: min,
			// Guard against max < min, happens when events.length === 0
			maxTime: max < min ? new Date(min.getTime() + 1) : max,
		};
	}, [events]);

	const twoHourIntervals = useMemo(() => eachHourOfInterval({start: minTime, end: maxTime}, {step: TIME_STEPS_HOURS}), [minTime, maxTime]);

	return (
		<>
			<Thead className={styles.weeklyView}>
				<Tr>
					<Th>
						Time
					</Th>
					{headers.weekDays.map(({key, value}) => (
						<Th key={key} paddingInlineStart={4}>
							{format(value, 'E dd', {locale: enUS})}
						</Th>
					))}
				</Tr>
			</Thead>
			<Tbody className={styles.weeklyView}>
				{
					twoHourIntervals.map(interval => (
						<Tr key={interval.toISOString()}>
							<Th>
								{format(interval, 'h a')}
							</Th>
							{
								body.value[0].value.map(({key}) => (
									<Td key={key}/>
								))
							}

						</Tr>
					))
				}
				{
					events.map(event => (
						<Tooltip
							key={event.key}
							label={event.label}
						>
							<Box
								__css={{'--left-offset': `calc(var(--chakra-sizes-8) * ${event.overlapOffset})`}}
								w='calc(var(--cell-width) - var(--left-offset))'
								h={`calc(${differenceInMinutes(event.end, event.start) / TIME_STEPS_MINUTES} * var(--row-height))`}
								color='black'
								pos='absolute'
								// Position is relative to table container, so includes offset for header (2.5rem)
								top={`calc((${differenceInMinutes(event.start, matchDateOnTime(event.start, minTime)) / TIME_STEPS_MINUTES} * var(--row-height)) + 2.5rem)`}
								left={`calc(var(--vertical-header-width) + (${event.dayOffset} * var(--cell-width)) + var(--left-offset))`}
								as='button'
								onClick={() => {
									onEventClick(event);
								}}
							>
								<HStack
									fontSize='xs'
									justify='center'
									h='full'
									bgColor={`yellow.${200 + (event.overlapOffset * 100)}`}
									px={2}
									py={1}
									mx={1}
									shadow={event.overlapOffset === 0 ? 'none' : 'md'}
									rounded='md'
								>
									<Box as='span' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
										{event.section.course.title}
									</Box>

									<VStack spacing={0} h='full'>
										<span>{format(event.start, 'hh:mm')}</span>
										<Spacer/>
										<span>{format(event.end, 'hh:mm')}</span>
									</VStack>
								</HStack>
							</Box>
						</Tooltip>
					))
				}
			</Tbody>
		</>
	);
};

export default WeekView;
