import React from 'react';
import {Search2Icon, DeleteIcon} from '@chakra-ui/icons';
import {Table, Thead, Tr, Th, Tbody, Td, Tag, IconButton, TableProps, Tooltip, Wrap, Skeleton} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import InstructorList from 'src/components/sections-table/instructor-list';
import LocationWithPopover from 'src/components/location-with-popover';
import TimeDisplay from 'src/components/sections-table/time-display';
import useStore from 'src/lib/state-context';
import getCreditsString from 'src/lib/get-credits-str';
import styles from './styles/table.module.scss';

type BasketTableProps = {
	onClose?: () => void;
	isForCapture?: boolean;
	tableProps?: TableProps;
};

const SkeletonRow = () => (
	<Tr>
		{
			Array.from({length: 8}).map((_, i) => (
				// eslint-disable-next-line react/no-array-index-key
				<Td key={i}>
					<Skeleton>
						Some text
					</Skeleton>
				</Td>
			))
		}
		<Td isNumeric>
			<IconButton
				isLoading
				colorScheme="blue"
				icon={<Search2Icon/>}
				size="sm"
				aria-label="Go to section"/>
		</Td>
		<Td isNumeric>
			<IconButton
				isLoading
				colorScheme="red"
				icon={<DeleteIcon/>}
				size="sm"
				aria-label="Remove from basket"/>
		</Td>
	</Tr>
);

const BodyWithData = observer(({onClose, isForCapture}: BasketTableProps) => {
	const {basketState, uiState, apiState} = useStore();

	const handleSearch = (query: string) => {
		uiState.setSearchValue(query);
		if (onClose) {
			onClose();
		}
	};

	return (
		<>
			{basketState.sections.map(section => (
				<Tr key={section.id}>
					<Td>{section.course.title}</Td>
					<Td>{section.section}</Td>
					<Td>
						<InstructorList instructors={section.instructors}/>
					</Td>
					<Td>
						<TimeDisplay size="lg" schedule={section.time}/>
					</Td>
					<Td>
						<LocationWithPopover
							locationType={section.locationType}
							room={section.room}
							building={section.buildingName ? apiState.buildingsByName.get(section.buildingName) : undefined}
							hasLabelOnly={isForCapture}/>
					</Td>
					<Td isNumeric>{section.crn}</Td>
					<Td isNumeric>{getCreditsString(section.minCredits, section.maxCredits)}</Td>
					{
						!isForCapture && (
							<>
								<Td isNumeric>
									<Wrap
										align="center"
										justify="flex-end"
										as={Tooltip}
										label="available / total"
										placement="bottom-end"
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
							</>
						)
					}
				</Tr>
			))}
			{
				basketState.searchQueries.map(query => (
					<Tr key={query}>
						<Td colSpan={isForCapture ? 6 : 8}>
							<Tag size="lg">
								{query}
							</Tag>
						</Td>
						{
							!isForCapture && (
								<>
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
								</>
							)
						}
					</Tr>
				))
			}
		</>
	);
});

const BasketTable = (props: BasketTableProps) => {
	const {apiState} = useStore();

	return (
		<Table
			className={styles.table}
			shadow="base"
			rounded="md"
			{...props.tableProps}
		>
			<Thead>
				<Tr>
					<Th>Title</Th>
					<Th>Section</Th>
					<Th>Instructors</Th>
					<Th>Schedule</Th>
					<Th>Location</Th>
					<Th isNumeric>CRN</Th>
					<Th isNumeric>Credits</Th>
					{
						!props.isForCapture && (
							<>
								<Th isNumeric>Seats</Th>
								<Th isNumeric>Go</Th>
								<Th isNumeric>Remove</Th>
							</>
						)
					}
				</Tr>
			</Thead>

			<Tbody>
				{
					apiState.hasDataForTrackedEndpoints ? (
						<BodyWithData {...props}/>
					) : Array.from({length: 4}).map((_, i) => (
						// eslint-disable-next-line react/no-array-index-key
						<SkeletonRow key={i}/>
					))
				}
			</Tbody>
		</Table>
	);
};

export default observer(BasketTable);