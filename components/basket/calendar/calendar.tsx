import React, {useMemo, useCallback, useContext} from 'react';
import {Table, Box} from '@chakra-ui/react';
import useCalendar from '@veccu/react-calendar';
import {format, add} from 'date-fns';
import {observer} from 'mobx-react-lite';
import useStore from '../../../lib/state-context';
import {CalendarEvent} from './types';
import CalendarToolbar from './toolbar';
import MonthView from './views/month';
import WeekView from './views/week';
import styles from './styles/calendar.module.scss';

const BasketCalendarContext = React.createContext<ReturnType<typeof useCalendar>>(undefined as any);

export const BasketCalendarProvider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	return (
		<BasketCalendarContext.Provider value={useCalendar()}>
			{children}
		</BasketCalendarContext.Provider>
	);
};

const BasketCalendar = () => {
	const {basketState, uiState} = useStore();
	const {headers, body, view, navigation, cursorDate} = useContext(BasketCalendarContext);

	const bodyWithEvents = useMemo(() => ({
		...body,
		value: body.value.map(week => ({
			...week,
			value: week.value.map(day => {
				const events = [];

				const start = day.value;
				const end = add(day.value, {days: 1});

				for (const section of basketState.sections) {
					if (section.parsedTime) {
						for (const occurence of section.parsedTime.occurrences({start, end})) {
							events.push({
								section,
								start: occurence.date as Date,
								end: occurence.end as Date ?? new Date()
							});
						}
					}
				}

				return {
					...day,
					events: events.sort((a, b) => a.start.getTime() - b.start.getTime()).map(event => ({
						...event,
						key: `${event.section.id}-${event.start.toISOString()}-${event.end.toISOString()}`,
						label: `${event.section.course.title} ${event.section.section} (${event.section.course.subject}${event.section.course.crse})`
					}))
				};
			})
		}))
	}), [body, basketState.sections]);

	const handleEventClick = useCallback((event: CalendarEvent) => {
		uiState.setSearchValue(`id:${event.section.id}`);
	}, [uiState]);

	return (
		<Box display="inline-block">
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
							onEventClick={handleEventClick}/>
					)
				}

				{
					view.isWeekView && (
						<WeekView
							body={bodyWithEvents}
							headers={headers}
							onEventClick={handleEventClick}/>
					)
				}
			</Table>
		</Box>
	);
};

export default observer(BasketCalendar);
