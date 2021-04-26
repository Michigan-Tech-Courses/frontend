import React, {useCallback, useEffect} from 'react';
import {Table, Thead, Tbody, Tr, Th, VStack, useBreakpointValue, TableContainer, useToast} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from '../../lib/state-context';
import TableRow from './row';
import SkeletonRow from './skeleton-row';
import DataFilterStatsBar from '../data-filter-stats-bar';
import TablePageControls from '../table-page-controls';
import useTablePagination from '../../lib/use-table-pagination';
import {ICourseFromAPI} from '../../lib/types';
import {encodeShareable} from '../../lib/sharables';

const TableBody = observer(({startAt, endAt, onShareCourse}: {startAt: number; endAt: number; onShareCourse: (course: ICourseFromAPI) => void}) => {
	const store = useStore();

	return (
		<Tbody>
			{
				store.apiState.hasCourseData ?
					store.uiState.filteredCourses.slice(startAt, endAt).map(course => <TableRow key={course.course.id} course={course} onShareCourse={() => {
						onShareCourse(course.course);
					}}/>)				:
					Array.from(Array.from({length: endAt - startAt}).keys()).map(i => (
						<SkeletonRow key={i}/>
					))
			}
		</Tbody>
	);
});

const CoursesTable = ({onScrollToTop}: {onScrollToTop: () => void}) => {
	const toast = useToast();
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});
	const store = useStore();

	const {
		startAt,
		endAt,
		setPage,
		handlePageSizeChange,
		page,
		pageSize,
		availableSizes,
		numberOfPages
	} = useTablePagination({
		len: (store.uiState.filteredCourses.length > 0 ? store.uiState.filteredCourses.length : 1),
		onPageChange: () => {
			onScrollToTop();
		}
	});

	const totalCoursesString = store.apiState.coursesNotDeleted.length.toLocaleString();

	// Reset page when # of search results change
	useEffect(() => {
		setPage(0);
	}, [store.uiState.filteredCourses.length]);

	const handleShareCourse = useCallback(async (course: ICourseFromAPI) => {
		const url = new URL('/', process.env.NEXT_PUBLIC_BASE_URL);

		url.searchParams.set(
			'share',
			encodeShareable({
				version: 1,
				type: 'SHARE_COURSE',
				data: {
					year: course.year,
					semester: course.semester,
					subject: course.subject,
					crse: course.crse
				}
			})
		);

		try {
			await navigator.share({url: url.toString()});
		} catch {
			await navigator.clipboard.writeText(url.toString());
			toast({
				title: 'Copied',
				description: `A link to ${course.title} was copied to your clipboard.`,
				status: 'success',
				duration: 4000
			});
		}
	}, [toast]);

	return (
		<VStack w="min(100rem, 80%)">
			<DataFilterStatsBar
				isLoaded={store.apiState.hasCourseData}
				matched={store.uiState.filteredCourses.length.toLocaleString()}
				total={totalCoursesString}
				updatedAt={store.apiState.dataLastUpdatedAt}
				label="courses"
			/>
			<TableContainer w="100%" p={1}>
				<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
					<TablePageControls
						page={page}
						pageSize={pageSize}
						setPage={setPage}
						isEnabled={store.apiState.hasCourseData}
						numberOfPages={numberOfPages}
						onPageSizeChange={handlePageSizeChange}
						availableSizes={availableSizes}
					/>

					<Thead>
						<Tr>
							<Th>Course</Th>
							<Th>Title</Th>
							<Th isNumeric>Credits</Th>
							<Th display={{base: 'none', md: 'table-cell'}}>Description</Th>
							<Th style={{textAlign: 'right'}}>Details</Th>
						</Tr>
					</Thead>
					<TableBody startAt={startAt} endAt={endAt} onShareCourse={handleShareCourse}/>
				</Table>
			</TableContainer>
		</VStack>
	);
};

export default observer(CoursesTable);
