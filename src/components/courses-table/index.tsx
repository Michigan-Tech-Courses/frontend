import React, {useCallback, useEffect, useMemo} from 'react';
import {Table, Thead, Tbody, Tr, Th, VStack, useBreakpointValue, useToast} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import DataFilterStatsBar from 'src/components/data-filter-stats-bar';
import TablePageControls from 'src/components/table-page-controls';
import useTablePagination from 'src/lib/hooks/use-table-pagination';
import {type ICourseFromAPI} from 'src/lib/api-types';
import {encodeShareable} from 'src/lib/sharables';
import SkeletonRow from './skeleton-row';
import TableRow from './row';
import styles from './styles/table.module.scss';

const TableBody = observer(({startAt, endAt, onShareCourse}: {startAt: number; endAt: number; onShareCourse: (course: ICourseFromAPI) => void}) => {
	const store = useStore();

	const slicedCourses = useMemo(() => store.uiState.filteredCourses.slice(startAt, endAt), [store.uiState.filteredCourses, startAt, endAt]);

	return (
		<Tbody>
			{
				store.apiState.hasDataForTrackedEndpoints
					? slicedCourses.map(course => (
						<TableRow
							key={course.course.id} course={course} onShareCourse={() => {
								onShareCourse(course.course);
							}}/>
					))
					:				Array.from(Array.from({length: endAt - startAt}).keys()).map(i => (
						<SkeletonRow key={i}/>
					))
			}
		</Tbody>
	);
});

const CoursesTable = observer(({onScrollToTop}: {onScrollToTop: () => void}) => {
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
		numberOfPages,
	} = useTablePagination({
		len: (store.uiState.filteredCourses.length > 0 ? store.uiState.filteredCourses.length : 1),
		onPageChange() {
			onScrollToTop();
		},
	});

	const totalCoursesString = store.apiState.coursesNotDeleted.length.toLocaleString();

	// Reset page when # of search results change
	useEffect(() => {
		setPage(0);
	}, [store.uiState.filteredCourses.length, setPage]);

	const handleShareCourse = useCallback(async (course: ICourseFromAPI) => {
		const url = new URL('/shared', window.location.origin);

		url.searchParams.set(
			'share',
			encodeShareable({
				version: 1,
				type: 'SHARE_COURSE',
				data: {
					term: {
						semester: course.semester,
						year: course.year,
					},
					subject: course.subject,
					crse: course.crse,
				},
			}),
		);

		try {
			await navigator.share({url: url.toString()});
		} catch {
			await navigator.clipboard.writeText(url.toString());
			toast({
				title: 'Copied',
				description: `A link to ${course.title} was copied to your clipboard.`,
				status: 'success',
				duration: 4000,
				position: 'bottom-right',
			});
		}
	}, [toast]);

	return (
		<VStack w='100rem' h='min-content'>
			<DataFilterStatsBar
				isLoaded={store.apiState.hasDataForTrackedEndpoints}
				matched={store.uiState.filteredCourses.length.toLocaleString()}
				total={totalCoursesString}
				updatedAt={store.apiState.dataLastUpdatedAt}
				label='courses'
			/>
			<Table
				variant='simple'
				boxShadow='base'
				borderRadius='md'
				size={tableSize}
				w='full'
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
});

export default CoursesTable;
