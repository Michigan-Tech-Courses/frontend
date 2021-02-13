import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, TableProps} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import InstructorWithPopover from './instructor-with-popover';
import {ISectionFromAPI} from '../lib/types';
import getCreditsStr from '../lib/get-credits-str';

interface ISectionsTableProps {
	isHighlighted: boolean;
	sections: ISectionFromAPI[];
}

const TableBody = observer(({sections}: {sections: ISectionFromAPI[]}) => {
	return (
		<Tbody>
			{
				sections.map(section => (
					<Tr key={section.id}>
						<Td>{section.section}</Td>
						<Td>
							{
								section.instructors.map(instructor => (
									<InstructorWithPopover id={instructor.id} key={instructor.id}/>
								))
							}
						</Td>
						<Td/>
						<Td isNumeric>{section.crn}</Td>
						<Td isNumeric>{getCreditsStr(section.minCredits, section.maxCredits)}</Td>
						<Td isNumeric>{section.totalSeats}</Td>
						<Td isNumeric>{section.takenSeats}</Td>
						<Td isNumeric>
							<Tag colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>{section.availableSeats}</Tag>
						</Td>
					</Tr>
				))
			}
		</Tbody>
	);
});

const SectionsTable = ({isHighlighted = false, sections, ...props}: TableProps & ISectionsTableProps) => {
	const tableSize = useBreakpointValue({base: 'sm', lg: 'md'});

	return (
		<Table size={tableSize} variant="simple" {...props}>
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
				</Tr>
			</Thead>

			<TableBody sections={sections}/>
		</Table>
	);
};

export default observer(SectionsTable);
