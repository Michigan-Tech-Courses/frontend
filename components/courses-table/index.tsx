import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Table, Thead, Tbody, Tr, Th, Select, IconButton, Spacer, HStack, VStack, TableCaption, Text, useBreakpointValue, Skeleton} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAPI from '../../lib/state-context';
import InlineStat from '../inline-stat';
import {ICourseFromAPI} from '../../lib/types';
import useCurrentDate from '../../lib/use-current-date';
import TableRow from './row';
import SkeletonRow from './skeleton-row';

dayjs.extend(relativeTime);

const TableBody = observer(({courses}: {courses: ICourseFromAPI[]}) => {
	const store = useAPI();

	return (
		<Tbody>
			{
				store.apiState.hasCourseData ?
					courses.map(course => <TableRow key={course.id} course={course}/>)				:
					Array.from(new Array(10).keys()).map(i => (
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
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});
	const store = useAPI();

	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const totalCoursesString = store.apiState.courses.length.toLocaleString();

	const numberOfPages = Math.ceil((store.uiState.filteredCourses.length > 0 ? store.uiState.filteredCourses.length : 1) / pageSize);

	const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number.parseInt(event.target.value, 10));
	}, []);

	const pagedData = useMemo(() => store.uiState.filteredCourses.slice(page * pageSize, (page + 1) * pageSize), [store.uiState.filteredCourses, page, pageSize]);

	// Reset page when # of search results change
	useEffect(() => {
		setPage(0);
	}, [store.uiState.filteredCourses.length]);

	return (
		<VStack w="min(100rem, 80%)">
			<HStack w="100%" mb={2}>
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
								selected={pageSize}
								onChange={handlePageSizeChange}
								disabled={!store.apiState.hasCourseData}
							>
								{TABLE_LENGTH_OPTIONS.map(o => (
									<option value={o} key={o}>{o}</option>
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
				<TableBody courses={pagedData}/>
			</Table>
		</VStack>
	);
};

export default observer(CoursesTable);
