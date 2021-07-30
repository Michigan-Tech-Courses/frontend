import React from 'react';
import {Search2Icon, DeleteIcon} from '@chakra-ui/icons';
import {Table, Thead, Tr, Th, Tbody, Td, Tag, IconButton} from '@chakra-ui/react';
import InstructorList from '../sections-table/instructor-list';
import TimeDisplay from '../sections-table/time-display';
import useStore from '../../lib/state-context';

const BasketTable = ({onClose}: {onClose: () => void}) => {
	const {basketState, uiState} = useStore();

	const handleSearch = (query: string) => {
		uiState.setSearchValue(query);
		onClose();
	};

	return (
		<Table shadow="base" rounded="md">
			<Thead>
				<Tr>
					<Th>Title</Th>
					<Th>Section</Th>
					<Th>Instructors</Th>
					<Th>Schedule</Th>
					<Th isNumeric>CRN</Th>
					<Th isNumeric>Credits</Th>
					<Th isNumeric>Capacity</Th>
					<Th isNumeric>Seats Available</Th>
					<Th isNumeric>Go</Th>
					<Th isNumeric>Remove</Th>
				</Tr>
			</Thead>

			<Tbody>
				{
					basketState.sections.map(section => (
						<Tr key={section.id}>
							<Td>{section.course.title}</Td>
							<Td isNumeric>{section.section}</Td>
							<Td>
								<InstructorList instructors={section.instructors}/>
							</Td>
							<Td>
								<TimeDisplay size="lg" schedule={section.time}/>
							</Td>
							<Td isNumeric>{section.crn}</Td>
							<Td isNumeric>{section.maxCredits}</Td>
							<Td isNumeric>{section.totalSeats}</Td>
							<Td isNumeric>
								<Tag size="lg" colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>
									{section.availableSeats}
								</Tag>
							</Td>
							<Td isNumeric>
								<IconButton
									colorScheme="blue"
									icon={<Search2Icon/>}
									size="sm"
									aria-label="Go to section"
									onClick={() => {
										handleSearch(`id:${section.id}`);
									}}/>
							</Td>
							<Td isNumeric>
								<IconButton
									colorScheme="red"
									icon={<DeleteIcon/>}
									size="sm"
									aria-label="Remove from basket"
									onClick={() => {
										basketState.removeSection(section.id);
									}}/>
							</Td>
						</Tr>
					))
				}
				{
					basketState.searchQueries.map(query => (
						<Tr key={query}>
							<Td colSpan={8}>
								<Tag size="lg">
									{query}
								</Tag>
							</Td>
							<Td isNumeric>
								<IconButton
									colorScheme="blue"
									icon={<Search2Icon/>}
									size="sm"
									aria-label="Go to section"
									onClick={() => {
										handleSearch(query);
									}}/>
							</Td>
							<Td isNumeric>
								<IconButton
									colorScheme="red"
									icon={<DeleteIcon/>}
									size="sm"
									aria-label="Remove from basket"
									onClick={() => {
										basketState.removeSearchQuery(query);
									}}/>
							</Td>
						</Tr>
					))
				}
			</Tbody>
		</Table>
	);
};

export default BasketTable;
