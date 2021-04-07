import React, {useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {Table, Tbody, Th, Thead, Tr, useBreakpointValue, VStack} from '@chakra-ui/react';
import DataFilterStatsBar from '../data-filter-stats-bar';
import TablePageControls from '../table-page-controls';
import useStore from '../../lib/state-context';
import useTablePagination from '../../lib/use-table-pagination';
import TableRow from './row';
import SkeletonRow from './skeleton-row';

const TableBody = observer(({startAt, endAt}: {startAt: number; endAt: number}) => {
	const store = useStore();

	return (
		<Tbody>
			{
				store.transferCoursesState.hasData ?
					store.transferCoursesState.filteredCourses.slice(startAt, endAt).map(course => <TableRow key={course.id} course={course}/>)				:
					Array.from(Array.from({length: endAt - startAt}).keys()).map(i => (
						<SkeletonRow key={i}/>
					))
			}
		</Tbody>
	);
});

const TransferCoursesTable = ({onScrollToTop}: {onScrollToTop: () => void}) => {
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
		len: (store.transferCoursesState.filteredCourses.length > 0 ? store.transferCoursesState.filteredCourses.length : 1),
		onPageChange: () => {
			onScrollToTop();
		}
	});

	// Reset page when # of search results change
	useEffect(() => {
		setPage(0);
	}, [store.transferCoursesState.filteredCourses.length]);

	return (
		<VStack w="min(100rem, 80%)">
			<DataFilterStatsBar
				isLoaded={store.transferCoursesState.hasData}
				matched={store.transferCoursesState.filteredCourses.length.toLocaleString()}
				total={store.apiState.transferCourses.length.toLocaleString()}
				updatedAt={store.transferCoursesState.dataLastUpdatedAt}
				label="transfer courses"
			/>

			<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
				<TablePageControls
					page={page}
					pageSize={pageSize}
					setPage={setPage}
					isEnabled={store.transferCoursesState.hasData}
					numberOfPages={numberOfPages}
					onPageSizeChange={handlePageSizeChange}
					availableSizes={availableSizes}
				/>

				<Thead>
					<Tr>
						<Th>Course</Th>
						<Th>Transfers As</Th>
						<Th>Title</Th>
						<Th>College</Th>
						<Th>State</Th>
						<Th isNumeric>Credits</Th>
					</Tr>
				</Thead>

				<TableBody startAt={startAt} endAt={endAt}/>
			</Table>
		</VStack>
	);
};

export default observer(TransferCoursesTable);
