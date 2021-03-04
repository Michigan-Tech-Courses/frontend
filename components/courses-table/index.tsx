import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Table, Thead, Tbody, Tr, Th, Select, IconButton, Spacer, HStack, VStack, TableCaption, Text, useBreakpointValue, Skeleton} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import useAPI from '../../lib/state-context';
import InlineStat from '../inline-stat';
import useCurrentDate from '../../lib/use-current-date';
import TableRow from './row';
import SkeletonRow from './skeleton-row';

dayjs.extend(relativeTime);

const TableBody = observer(({startAt, endAt}: {startAt: number; endAt: number}) => {
	const store = useAPI();

	return (
		<Tbody>
			{
				store.apiState.hasCourseData ?
					store.uiState.filteredCourses.slice(startAt, endAt).map(course => <TableRow key={course.course.id} course={course}/>)				:
					Array.from(Array.from({length: 10}).keys()).map(i => (
						<SkeletonRow key={i}/>
					))
			}
		</Tbody>
	);
});

const TABLE_LENGTH_OPTIONS = [10, 20, 50];

const LastUpdatedAt = observer(() => {
	const store = useAPI();
	const now = useCurrentDate(1000);

	const lastUpdatedString = useMemo(() => dayjs(store.apiState.dataLastUpdatedAt).from(now), [store.apiState.dataLastUpdatedAt, now]);

	return <Text>data last updated {lastUpdatedString}</Text>;
});

const CoursesTable = () => {
	const dataFilterStatsRef = useRef<HTMLDivElement | null>(null);
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});
	const store = useAPI();

	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const totalCoursesString = store.apiState.courses.length.toLocaleString();

	const numberOfPages = Math.ceil((store.uiState.filteredCourses.length > 0 ? store.uiState.filteredCourses.length : 1) / pageSize);

	const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		const newPageSize = Number.parseInt(event.target.value, 10);
		const newNumberOfPages = Math.ceil((store.uiState.filteredCourses.length > 0 ? store.uiState.filteredCourses.length : 1) / newPageSize);
		setPage(p => Math.floor((p / numberOfPages) * newNumberOfPages));
		setPageSize(newPageSize);
	}, [numberOfPages]);

	const startAt = page * pageSize;
	const endAt = (page + 1) * pageSize;

	// Reset page when # of search results change
	useEffect(() => {
		setPage(0);
	}, [store.uiState.filteredCourses.length]);

	useEffect(() => {
		dataFilterStatsRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
	}, [page]);

	return (
		<VStack w="min(100rem, 80%)">
			<HStack w="100%" mb={2} ref={dataFilterStatsRef}>
				<Skeleton isLoaded={store.apiState.hasCourseData}>
					<InlineStat label="matched" number={store.uiState.filteredCourses.length.toLocaleString()} help={`out of ${totalCoursesString} courses`}/>
				</Skeleton>

				<Spacer/>

				<Skeleton isLoaded={store.apiState.hasCourseData}>
					<LastUpdatedAt/>
				</Skeleton>
			</HStack>

			<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
				<TableCaption p="0" mb={4}>
					<HStack w="100%">
						<IconButton
							aria-label="Go to begining"
							size="sm"
							isDisabled={page === 0 || !store.apiState.hasCourseData}
							onClick={() => {
								setPage(0);
							}}
						>
							<ArrowLeftIcon/>
						</IconButton>

						<IconButton
							aria-label="Move back a page"
							size="sm"
							isDisabled={page === 0 || !store.apiState.hasCourseData}
							onClick={() => {
								setPage(p => p - 1);
							}}
						>
							<ChevronLeftIcon/>
						</IconButton>

						<Spacer/>

						<HStack>
							<Skeleton isLoaded={store.apiState.hasCourseData}>
								<Text>page {page + 1} of {numberOfPages}</Text>
							</Skeleton>

							<Select
								w="auto"
								size="sm"
								aria-label="Change number of rows per page"
								value={pageSize}
								onChange={handlePageSizeChange}
								disabled={!store.apiState.hasCourseData}
							>
								{TABLE_LENGTH_OPTIONS.map(o => (
									<option value={o} key={o} defaultChecked={o === pageSize}>{o}</option>
								))}
							</Select>
						</HStack>

						<Spacer/>

						<IconButton
							aria-label="Move forward a page"
							size="sm"
							isDisabled={page === numberOfPages - 1 || !store.apiState.hasCourseData}
							onClick={() => {
								setPage(p => p + 1);
							}}
						>
							<ChevronRightIcon/>
						</IconButton>

						<IconButton
							aria-label="Go to end"
							size="sm"
							isDisabled={page === numberOfPages - 1 || !store.apiState.hasCourseData}
							onClick={() => {
								setPage(numberOfPages - 1);
							}}
						>
							<ArrowRightIcon/>
						</IconButton>
					</HStack>
				</TableCaption>
				<Thead>
					<Tr>
						<Th>Course</Th>
						<Th>Title</Th>
						<Th isNumeric>Credits</Th>
						<Th display={{base: 'none', md: 'table-cell'}}>Description</Th>
						<Th style={{textAlign: 'right'}}>Details</Th>
					</Tr>
				</Thead>
				<TableBody startAt={startAt} endAt={endAt}/>
			</Table>
		</VStack>
	);
};

export default observer(CoursesTable);
