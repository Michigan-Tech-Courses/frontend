import React, {useCallback, useRef, useState, useEffect, useContext, useMemo} from 'react';
import {Select, Box, Divider, useDisclosure, Skeleton, Table} from '@chakra-ui/react';
import {format, add} from 'date-fns';
import Head from 'next/head';
import {observer} from 'mobx-react-lite';
import {NextSeo} from 'next-seo';
import useCalendar, {CalendarViewType} from '@veccu/react-calendar';
import useStore from 'src/lib/state/context';
import CalendarToolbar from 'src/components/basket/calendar/toolbar';
import MonthView from 'src/components/basket/calendar/views/month';
import {type ICourseFromAPI, ISectionFromAPI, type ISectionFromAPIWithSchedule} from 'src/lib/api-types';
import occurrenceGeneratorCache from 'src/lib/occurrence-generator-cache';
import WeekView from '../components/basket/calendar/views/week';
import styles from '../components/basket/calendar/styles/calendar.module.scss';

const isFirstRender = typeof window === 'undefined';

const ClassroomSchedules = observer(() => {
	const courseTableContainerRef = useRef<HTMLDivElement>(null);
	const {apiState} = useStore();

	const calendar = useCalendar({defaultViewType: CalendarViewType.Week});

	const [rooms, setRooms] = useState<string[]>([]);
	const [sectionsInRoom, setSectionsInRoom] = useState<Array<ISectionFromAPIWithSchedule & {course: ICourseFromAPI}>>([]);

	let sectionsInBuilding: ISectionFromAPIWithSchedule[] = [];

	const handleScrollToTop = useCallback(() => {
		if (courseTableContainerRef.current) {
			courseTableContainerRef.current.scrollTop = 0;
		}
	}, []);

	const buildings = apiState.buildings;
	let selectedBuilding: string;
	let selectedRoom: string;

	const handleBuildingSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		selectedBuilding = event.target.value;
		sectionsInBuilding = apiState.sectionsWithParsedSchedules.filter(section => section.buildingName === selectedBuilding);

		const availableRooms: string[] = [];
		for (const section of sectionsInBuilding) {
			if (section.room !== null && !availableRooms.includes(section.room)) {
				availableRooms.push(section.room);
			}
		}

		availableRooms.sort();
		setRooms(availableRooms);
	}, []);

	const handleRoomSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		selectedRoom = event.target.value;

		const sections = sectionsInBuilding.filter(section => section.room === selectedRoom)
			.map(section => ({...section, course: apiState.courseById.get(section.courseId)!}));
		setSectionsInRoom(sections);
	}, []);

	const bodyWithEvents = useMemo(() => ({
		...calendar.body,
		value: calendar.body.value.map(week => ({
			...week,
			value: week.value.map(day => {
				const events = [];

				const start = day.value;
				const end = add(day.value, {days: 1});

				for (const section of sectionsInRoom ?? []) {
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
	}), [calendar.body, sectionsInRoom]);

	return (
		<>
			<NextSeo
				title='MTU Courses | Classroom Schedule'
				description='A listing of when classrooms have classes scheduled in them'
			/>

			<Head>
				{isFirstRender && (
					<>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/semesters`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/instructors`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/passfaildrop`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/buildings`} as='fetch' crossOrigin='anonymous'/>
					</>
				)}
			</Head>

			<Select
				w='auto'
				variant='filled'
				placeholder='Select building'
				aria-label='Select a building to view'
				onChange={handleBuildingSelect}
			>
				{buildings.map(building => (
					<option key={building.name} value={building.name}>{building.name}</option>
				))}
			</Select>

			<Select
				w='auto'
				variant='filled'
				placeholder='Select room'
				aria-label='Select a room to view'
				onChange={handleRoomSelect}
			>
				{rooms.map(room => (
					<option key={room} value={room}>{room}</option>
				))}
			</Select>

			<Skeleton display='inline-block' isLoaded={apiState.hasDataForTrackedEndpoints}>
				<CalendarToolbar
					navigation={calendar.navigation}
					view={calendar.view}
					label={format(calendar.cursorDate, 'MMMM yyyy')}/>

				<Table
					shadow='base'
					rounded='md'
					w='min-content'
					className={styles.table}
				>
					{
						calendar.view.isMonthView && (
							<MonthView
								body={bodyWithEvents}
								headers={calendar.headers}
								onEventClick={() => {
									console.log('hello');
								}}/>
						)
					}

					{
						calendar.view.isWeekView && (
							<WeekView
								body={bodyWithEvents}
								headers={calendar.headers}
								onEventClick={() => {
									console.log('hello');
								}}/>
						)
					}
				</Table>
			</Skeleton>

		</>
	);
});

export default ClassroomSchedules;