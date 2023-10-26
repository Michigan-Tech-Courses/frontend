import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, type TableProps, TableContainer, IconButton, Wrap, Tooltip} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {type ISectionFromAPIWithSchedule} from 'src/lib/api-types';
import getCreditsStr from 'src/lib/get-credits-str';
import {AddIcon, DeleteIcon} from '@chakra-ui/icons';
import useStore from 'src/lib/state/context';
import LocationWithPopover from 'src/components/location-with-popover';
import InstructorList from './instructor-list';
import TimeDisplay from './time-display';
import styles from './styles/table.module.scss';

type ISectionsTableProps = {
	sections: ISectionFromAPIWithSchedule[];
};

const Row = observer(({section}: {section: ISectionFromAPIWithSchedule}) => {
	const {allBasketsState, apiState} = useStore();
	const creditsString = getCreditsStr(section.minCredits, section.maxCredits);

	const isSectionInBasket = allBasketsState.currentBasket?.hasSection(section.id);

	const handleBasketAction = () => {
		if (!allBasketsState.currentBasket && apiState.selectedTerm) {
			const basket = allBasketsState.addBasket(apiState.selectedTerm);
			allBasketsState.setSelectedBasket(basket.id);
			basket.addSection(section.id);
			return;
		}

		if (isSectionInBasket) {
			allBasketsState.currentBasket?.removeSection(section.id);
		} else {
			allBasketsState.currentBasket?.addSection(section.id);
		}
	};

	return (
		<Tr key={section.id}>
			<Td>{section.section}</Td>
			<Td>
				<InstructorList instructors={section.instructors}/>
			</Td>
			<Td>
				<TimeDisplay schedule={section.parsedTime ?? undefined}/>
			</Td>
			<Td>
				<LocationWithPopover
					locationType={section.locationType}
					room={section.room}
					building={section.buildingName ? apiState.buildingsByName.get(section.buildingName) : undefined}/>
			</Td>
			<Td isNumeric>{section.crn}</Td>
			<Td isNumeric>{creditsString}</Td>

			<Td isNumeric>
				<Wrap
					align='center'
					justify='flex-end'
					as={Tooltip}
					label='available / total'
					placement='bottom-end'
				>
					<Tag colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>
						{section.availableSeats}
					</Tag>

					{' / '}

					{section.totalSeats}
				</Wrap>
			</Td>

			<Td isNumeric>
				<IconButton
					size='xs'
					colorScheme={isSectionInBasket ? 'red' : undefined}
					icon={isSectionInBasket ? <DeleteIcon/> : <AddIcon/>}
					aria-label={isSectionInBasket ? 'Remove from basket' : 'Add to basket'}
					onClick={handleBasketAction}/>
			</Td>
		</Tr>
	);
});

const TableBody = observer(({sections}: {sections: ISectionFromAPIWithSchedule[]}) => (
	<Tbody>
		{
			sections.map(s => (
				<Row key={s.id} section={s}/>
			))
		}
	</Tbody>
));

const SectionsTable = ({sections, ...props}: TableProps & ISectionsTableProps) => {
	const tableSize = useBreakpointValue({base: 'sm', lg: 'md'});

	return (
		<TableContainer {...props}>
			<Table w='full' size={tableSize} className={styles.table}>
				<Thead>
					<Tr>
						<Th>Section</Th>
						<Th>Instructors</Th>
						<Th>Schedule</Th>
						<Th>Location</Th>
						<Th isNumeric>CRN</Th>
						<Th isNumeric>Credits</Th>
						<Th isNumeric>Seats</Th>
						<Th isNumeric>Basket</Th>
					</Tr>
				</Thead>

				<TableBody sections={sections}/>
			</Table>
		</TableContainer>
	);
};

export default observer(SectionsTable);
