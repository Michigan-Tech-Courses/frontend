import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, TableProps, TableContainer, IconButton} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {ISectionFromAPI} from '../../lib/types';
import getCreditsStr from '../../lib/get-credits-str';
import {AddIcon, DeleteIcon} from '@chakra-ui/icons';
import useStore from '../../lib/state-context';
import InstructorList from './instructor-list';
import TimeDisplay from './time-display';

interface ISectionsTableProps {
	sections: ISectionFromAPI[];
}

const Row = observer(({section}: {section: ISectionFromAPI}) => {
	const {basketState} = useStore();
	const creditsString = getCreditsStr(section.minCredits, section.maxCredits);

	const isSectionInBasket = basketState.hasSection(section.id);

	const handleBasketAction = () => {
		if (isSectionInBasket) {
			basketState.removeSection(section.id);
		} else {
			basketState.addSection(section.id);
		}
	};

	return (
		<Tr key={section.id}>
			<Td minW="4ch">{section.section}</Td>
			<Td>
				<InstructorList instructors={section.instructors}/>
			</Td>
			<Td minW="28ch">
				<TimeDisplay schedule={section.time}/>
			</Td>
			<Td isNumeric>{section.crn}</Td>
			<Td isNumeric>{creditsString}</Td>
			<Td isNumeric>{section.totalSeats}</Td>
			<Td isNumeric>{section.takenSeats}</Td>
			<Td isNumeric>
				<Tag colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>{section.availableSeats}</Tag>
			</Td>

			<Td isNumeric>
				<IconButton
					size="xs"
					colorScheme={isSectionInBasket ? 'red' : undefined}
					icon={isSectionInBasket ? <DeleteIcon/> : <AddIcon/>}
					aria-label="Add to basket"
					onClick={handleBasketAction}/>
			</Td>
		</Tr>
	);
});

const TableBody = observer(({sections}: {sections: ISectionFromAPI[]}) => {
	return (
		<Tbody>
			{
				sections.map(s => (
					<Row key={s.id} section={s}/>
				))
			}
		</Tbody>
	);
});

const SectionsTable = ({sections, ...props}: TableProps & ISectionsTableProps) => {
	const tableSize = useBreakpointValue({base: 'sm', lg: 'md'});

	return (
		<TableContainer {...props}>
			<Table w="full" size={tableSize}>
				<Thead>
					<Tr>
						<Th>Section</Th>
						<Th>Instructors</Th>
						<Th>Schedule</Th>
						<Th isNumeric>CRN</Th>
						<Th isNumeric>Credits</Th>
						<Th isNumeric>Capacity</Th>
						<Th isNumeric>Seats Taken</Th>
						<Th isNumeric>Seats Available</Th>
						<Th isNumeric>Basket</Th>
					</Tr>
				</Thead>

				<TableBody sections={sections}/>
			</Table>
		</TableContainer>
	);
};

export default observer(SectionsTable);
