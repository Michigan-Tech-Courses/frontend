import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, TableProps} from '@chakra-ui/react';
import InstructorWithPopover from './instructor-with-popover';

interface ISectionsTableProps {
	isHighlighted: boolean;
}

const SectionsTable = ({isHighlighted = false, ...props}: TableProps & ISectionsTableProps) => {
	const tableSize = useBreakpointValue({base: 'sm', lg: 'md'});

	return (
		<Table size={tableSize} variant="simple" {...props}>
			<Thead>
				<Tr>
					<Th>Section</Th>
					<Th>Instructor</Th>
					<Th>Schedule</Th>
					<Th isNumeric>CRN</Th>
					<Th isNumeric>Credits</Th>
					<Th isNumeric>Capacity</Th>
					<Th isNumeric>Seats Taken</Th>
					<Th isNumeric>Seats Available</Th>
				</Tr>
			</Thead>

			<Tbody>
				<Tr>
					<Td>1A</Td>
					<Td>
						<InstructorWithPopover name="Leo Ureel" avatarUrl="https://bit.ly/dan-abramov" rateMyProfessorsUrl="https://www.ratemyprofessors.com/ShowRatings.jsp?tid=2053969" averageRating={0.5} averageDifficultyRating={0.8}/>
					</Td>
					<Td>MWF 1:00-3:00</Td>
					<Td isNumeric>48939</Td>
					<Td isNumeric>3</Td>
					<Td isNumeric>
						{
							isHighlighted ? (
								<mark>40</mark>
							) : (
								40
							)
						}
					</Td>
					<Td isNumeric>23</Td>
					<Td isNumeric>
						<Tag colorScheme={17 <= 0 ? 'red' : 'green'}>17</Tag>
					</Td>
				</Tr>
			</Tbody>
		</Table>
	);
};

export default SectionsTable;
