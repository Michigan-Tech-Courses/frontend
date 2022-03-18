import React, {useMemo, useContext, useEffect, useState} from 'react';
import {Table, Skeleton} from '@chakra-ui/react';
import useCalendar, {CalendarViewType} from '@veccu/react-calendar';
import {format, add} from 'date-fns';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import occurrenceGeneratorCache from 'src/lib/occurrence-generator-cache';
import {CalendarEvent} from './types';
import CalendarToolbar from './toolbar';
import MonthView from './views/month';
import WeekView from './views/week';
import styles from './styles/calendar.module.scss';

const BasketCalendarContext = React.createContext<ReturnType<typeof useCalendar>>(undefined as any);

export const BasketCalendarProvider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => (
	<BasketCalendarContext.Provider value={useCalendar({defaultViewType: CalendarViewType.Week})}>
		{children}
	</BasketCalendarContext.Provider>
);

type BasketCalendarProps = {
	onEventClick: (event: CalendarEvent) => void;
};

const BasketCalendar = (props: BasketCalendarProps) => {
	const {allBasketsState: {currentBasket}, apiState} = useStore();
	const {headers, body, view, navigation, cursorDate} = useContext(BasketCalendarContext);
	const [hasSetCalendarStartDate, setHasSetCalendarStartDate] = useState(false);

	const bodyWithEvents = useMemo(() => ({
		...body,
		value: body.value.map(week => ({
			...week,
			value: week.value.map(day => {
				const events = [];

				const start = day.value;
				const end = add(day.value, {days: 1});

				for (const section of currentBasket?.sections ?? []) {
					if (section.parsedTime) {
						for (const occurrence of occurrenceGeneratorCache(JSON.stringify(section.time), start, end, section.parsedTime)) {
							events.push({
								section,
								start: occurrence.date as Date,
								end: occurrence.end as Date ?? new Date(),
							});
						}
					}
				}

				return {
					...day,
					events: events.sort((a, b) => a.start.getTime() - b.start.getTime()).map(event => ({
						...event,
						key: `${event.section.id}-${event.start.toISOString()}-${event.end.toISOString()}`,
						label: `${event.section.course.title} ${event.section.section} (${event.section.course.subject}${event.section.course.crse})`,
					})),
				};
			}),
		})),
	}), [body, currentBasket?.sections]);

	const firstDate = useMemo<Date | undefined>(() => {
		const dates = [];

		for (const section of currentBasket?.sections ?? []) {
			if (section.parsedTime?.firstDate) {
				dates.push(section.parsedTime.firstDate.date);
			}
		}

		return dates.sort((a, b) => a.getTime() - b.getTime())[0];
	}, [currentBasket?.sections]);

	// Jump to first event in calendar if we haven't yet
	useEffect(() => {
		if (firstDate && !hasSetCalendarStartDate) {
			setHasSetCalendarStartDate(true);
			navigation.setDate(firstDate);
		}
	}, [firstDate, hasSetCalendarStartDate, navigation]);

	// Reset calendar jump status if basket becomes empty
	useEffect(() => {
		if (currentBasket?.sectionIds.length === 0) {
			setHasSetCalendarStartDate(false);
		}
	}, [currentBasket?.sectionIds]);

	return (
		<Skeleton display="inline-block" isLoaded={apiState.hasDataForTrackedEndpoints}>
			<CalendarToolbar
				navigation={navigation}
				view={view}
				label={format(cursorDate, 'MMMM yyyy')}/>

			<Table
				shadow="base"
				rounded="md"
				w="min-content"
				className={styles.table}
			>
				{
					view.isMonthView && (
						<MonthView
							body={bodyWithEvents}
							headers={headers}
							onEventClick={props.onEventClick}/>
					)
				}

				{
					view.isWeekView && (
						<WeekView
							body={bodyWithEvents}
							headers={headers}
							onEventClick={props.onEventClick}/>
					)
				}
			</Table>
		</Skeleton>
	);
};

export default observer(BasketCalendar);
