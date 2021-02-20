import React, {useCallback, useMemo, useState} from 'react';
import {Table, Thead, Tbody, Tr, Th, Select, IconButton, Spacer, HStack, VStack, TableCaption, Text, useBreakpointValue, Skeleton} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAPI from '../../lib/api-state-context';
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
				store.hasCourseData ?
					courses.map(course => <TableRow key={course.id} course={course}/>)				:
					Array.from(new Array(10).keys()).map(i => (
						<SkeletonRow key={i}/>
					))
			}
		</Tbody>
	);
});

const TABLE_LENGTH_OPTIONS = [10, 20, 50];

const CoursesTable = () => {
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});
	const store = useAPI();
	const now = useCurrentDate(1000 * 60);

	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const lastUpdatedString = useMemo(() => dayjs(store.dataLastUpdatedAt).from(now), [store.dataLastUpdatedAt, now]);
	const totalCoursesString = store.courses.length.toLocaleString();

	const numberOfPages = Math.ceil(store.filteredCourses.length / pageSize);

	const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number.parseInt(event.target.value, 10));
	}, []);

	const pagedData = useMemo(() => store.filteredCourses.slice(page * pageSize, (page + 1) * pageSize), [store.filteredCourses, page, pageSize]);

	return (
		<VStack maxW="min(100rem, 80%)">
			<HStack w="100%" mb={2}>
				<Skeleton isLoaded={store.hasCourseData}>
					<InlineStat label="matched" number={store.filteredCourses.length.toLocaleString()} help={`out of ${totalCoursesString} courses`}/>
				</Skeleton>

				<Spacer/>

				<Skeleton isLoaded={store.hasCourseData}>
					<Text>data last updated {lastUpdatedString}</Text>
				</Skeleton>
			</HStack>

			<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
				<TableCaption p="0" mb={4}>
					<HStack w="100%">
						<IconButton
							aria-label="Go to begining"
							size="sm"
							isDisabled={page === 0 || !store.hasCourseData}
							onClick={() => {
								setPage(0);
							}}
						>
							<ArrowLeftIcon/>
						</IconButton>

						<IconButton
							aria-label="Move back a page"
							size="sm"
							isDisabled={page === 0 || !store.hasCourseData}
							onClick={() => {
								setPage(p => p - 1);
							}}
						>
							<ChevronLeftIcon/>
						</IconButton>

						<Spacer/>

						<HStack>
							<Skeleton isLoaded={store.hasCourseData}>
								<Text>page {page + 1} of {numberOfPages}</Text>
							</Skeleton>

							<Select
								w="auto"
								size="sm"
								aria-label="Change number of rows per page"
								selected={pageSize}
								onChange={handlePageSizeChange}
								disabled={!store.hasCourseData}
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
							isDisabled={page === numberOfPages - 1 || !store.hasCourseData}
							onClick={() => {
								setPage(p => p + 1);
							}}
						>
							<ChevronRightIcon/>
						</IconButton>

						<IconButton
							aria-label="Go to end"
							size="sm"
							isDisabled={page === numberOfPages - 1 || !store.hasCourseData}
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
