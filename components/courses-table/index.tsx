import React, {useCallback, useEffect} from 'react';
import {Table, Thead, Tbody, Tr, Th, VStack, useBreakpointValue, useToast} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from '../../lib/state-context';
import TableRow from './row';
import SkeletonRow from './skeleton-row';
import DataFilterStatsBar from '../data-filter-stats-bar';
import TablePageControls from '../table-page-controls';
import useTablePagination from '../../lib/hooks/use-table-pagination';
import {ICourseFromAPI} from '../../lib/api-types';
import {encodeShareable} from '../../lib/sharables';
import styles from './styles/table.module.scss';

const TableBody = observer(({startAt, endAt, onShareCourse}: {startAt: number; endAt: number; onShareCourse: (course: ICourseFromAPI) => void}) => {
	const store = useStore();

	return (
		<Tbody>
			{
				store.apiState.hasDataForTrackedEndpoints ?
					store.uiState.filteredCourses.slice(startAt, endAt).map(course => (
						<TableRow
							key={course.course.id} course={course} onShareCourse={() => {
								onShareCourse(course.course);
							}}/>
					))				:
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
	}, [store.uiState.filteredCourses.length, setPage]);

	const handleShareCourse = useCallback(async (course: ICourseFromAPI) => {
		const url = new URL('/', window.location.origin);

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
		<VStack w="100rem" h="min-content">
			<DataFilterStatsBar
				isLoaded={store.apiState.hasDataForTrackedEndpoints}
				matched={store.uiState.filteredCourses.length.toLocaleString()}
				total={totalCoursesString}
				updatedAt={store.apiState.dataLastUpdatedAt}
				label="courses"
			/>
			<Table
				variant="simple"
				boxShadow="base"
				borderRadius="md"
				size={tableSize}
				w="full"
				className={styles.table}
			>
				<TablePageControls
					page={page}
					pageSize={pageSize}
					setPage={setPage}
					isEnabled={store.apiState.hasDataForTrackedEndpoints}
					numberOfPages={numberOfPages}
					availableSizes={availableSizes}
					onPageSizeChange={handlePageSizeChange}
				/>

				<Thead>
					<Tr>
						<Th>Course</Th>
						<Th>Title</Th>
						<Th display={{base: 'none', md: 'table-cell'}}>Description</Th>
						<Th isNumeric>Credits</Th>
						<Th isNumeric>Details</Th>
					</Tr>
				</Thead>
				<TableBody startAt={startAt} endAt={endAt} onShareCourse={handleShareCourse}/>
			</Table>
		</VStack>
	);
};

export default observer(CoursesTable);
