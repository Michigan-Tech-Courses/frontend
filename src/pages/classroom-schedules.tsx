import React, {useCallback, useRef, useState, useEffect} from 'react';
import {Select, Box, Divider} from '@chakra-ui/react';
import Head from 'next/head';
import {observer} from 'mobx-react-lite';
import {NextSeo} from 'next-seo';
import CoursesTable from 'src/components/courses-table';
import ErrorToaster from 'src/components/error-toaster';
import useStore from 'src/lib/state/context';
import Basket from 'src/components/basket';
import ScrollTopDetector from 'src/components/scroll-top-detector';
import CoursesSearchBar from 'src/components/search-bar/courses';
import WeekView from '../components/basket/calendar/views/week';

const isFirstRender = typeof window === 'undefined';

const ClassroomSchedules = observer(() => {
	const courseTableContainerRef = useRef<HTMLDivElement>(null);
	const {apiState} = useStore();

	const [rooms, setRooms] = useState<string[]>([]);

	const handleScrollToTop = useCallback(() => {
		if (courseTableContainerRef.current) {
			courseTableContainerRef.current.scrollTop = 0;
		}
	}, []);

	const buildings = apiState.buildings;
	let selectedBuilding: string;
	let sections;
	let selectedRoom;

	const handleBuildingSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		selectedBuilding = event.target.value;
		sections = apiState.sections.filter(section => section.buildingName === selectedBuilding);

		const availableRooms: string[] = [];
		for (const section of sections) {
			if (section.room !== null && !availableRooms.includes(section.room)) {
				availableRooms.push(section.room);
			}
		}

		rooms.sort();
		setRooms(availableRooms);
	}, []);

	const handleRoomSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		selectedRoom = event.target.value;
	}, []);

	return (
		<>
			<NextSeo
				title='MTU Courses | Classroom Schedule'
				description='A listing of when classrooms have classes scheduled in them'
			/>

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

		</>
	);
});

export default ClassroomSchedules;
