import React from 'react';
import {Search2Icon, DeleteIcon} from '@chakra-ui/icons';
import {Table, Thead, Tr, Th, Tbody, Td, Tag, IconButton, TableProps, Tooltip, Wrap, Skeleton} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import InstructorList from 'src/components/sections-table/instructor-list';
import LocationWithPopover from 'src/components/location-with-popover';
import TimeDisplay from 'src/components/sections-table/time-display';
import useStore from 'src/lib/state/context';
import getCreditsString from 'src/lib/get-credits-str';
import {BasketState} from 'src/lib/state/basket';
import {ICourseFromAPI} from 'src/lib/api-types';
import styles from './styles/table.module.scss';

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

type RowProps = {
	isForCapture?: boolean;
	handleSearch: (query: string) => void;
};

type SectionRowProps = RowProps & {
	section: BasketState['sections'][0];
};

const SectionRow = observer(({section, isForCapture, handleSearch}: SectionRowProps) => {
	const {allBasketsState: {currentBasket}, apiState} = useStore();

	return (
		<Tr>
			<Td>
				{section.course.subject}
				<b>{section.course.crse}</b>
				{' '}
				{section.course.title}
			</Td>
			<Td>{section.section}</Td>
			<Td>
				<InstructorList instructors={section.instructors}/>
			</Td>
			<Td>
				<TimeDisplay
					size="lg"
					schedule={section.parsedTime}
					colorScheme={currentBasket?.doesSectionConflictMap.get(section.id) ? 'red' : undefined}/>
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
									currentBasket?.removeSection(section.id);
								}}/>
						</Td>
					</>
				)
			}
		</Tr>
	);
});

type CourseRowProps = RowProps & {
	course: ICourseFromAPI;
};

const CourseRow = observer(({isForCapture, handleSearch, course}: CourseRowProps) => {
	const {allBasketsState: {currentBasket}} = useStore();

	return (
		<Tr>
			<Td colSpan={6}>
				{course.title}
			</Td>

			<Td isNumeric>
				{course.credits}
			</Td>

			{
				!isForCapture && (
					<>
						<Td/>
						<Td isNumeric>
							<IconButton
								colorScheme="blue"
								icon={<Search2Icon/>}
								size="sm"
								aria-label="Go to course"
								onClick={() => {
									handleSearch(`${course.subject}${course.crse}`);
								}}/>
						</Td>
						<Td isNumeric>
							<IconButton
								colorScheme="red"
								icon={<DeleteIcon/>}
								size="sm"
								aria-label="Remove from basket"
								onClick={() => {
									currentBasket?.removeCourse(course.id);
								}}/>
						</Td>
					</>
				)
			}
		</Tr>
	);
});

type SearchQueryRowProps = RowProps & {
	query: {
		query: string;
		credits?: [number, number];
	};
};

const SearchQueryRow = observer(({isForCapture, handleSearch, query}: SearchQueryRowProps) => {
	const {allBasketsState: {currentBasket}} = useStore();

	return (
		<Tr>
			<Td colSpan={6}>
				<Tag size="lg">
					{query.query}
				</Tag>
			</Td>

			<Td isNumeric>
				{query.credits ? getCreditsString(...query.credits) : ''}
			</Td>

			{
				!isForCapture && (
					<>
						<Td/>
						<Td isNumeric>
							<IconButton
								colorScheme="blue"
								icon={<Search2Icon/>}
								size="sm"
								aria-label="Go to section"
								onClick={() => {
									handleSearch(query.query);
								}}/>
						</Td>
						<Td isNumeric>
							<IconButton
								colorScheme="red"
								icon={<DeleteIcon/>}
								size="sm"
								aria-label="Remove from basket"
								onClick={() => {
									currentBasket?.removeSearchQuery(query.query);
								}}/>
						</Td>
					</>
				)
			}
		</Tr>
	);
});

type BasketTableProps = {
	onClose?: () => void;
	isForCapture?: boolean;
	tableProps?: TableProps;
};

const BodyWithData = observer(({onClose, isForCapture}: BasketTableProps) => {
	const {allBasketsState: {currentBasket}, uiState} = useStore();

	const handleSearch = (query: string) => {
		uiState.setSearchValue(query);
		if (onClose) {
			onClose();
		}
	};

	return (
		<Tbody>
			{
				currentBasket?.sections.map(section => (
					<SectionRow
						key={section.id}
						section={section}
						isForCapture={isForCapture}
						handleSearch={handleSearch}/>
				))
			}

			{
				currentBasket?.courses.map(course => (
					<CourseRow
						key={course.id}
						course={course}
						isForCapture={isForCapture}
						handleSearch={handleSearch}/>
				))
			}

			{
				currentBasket?.parsedQueries.map(query => (
					<SearchQueryRow
						key={query.query}
						query={query}
						isForCapture={isForCapture}
						handleSearch={handleSearch}/>
				))
			}

			<Tr fontWeight="bold">
				<Td>Total:</Td>
				<Td colSpan={5}/>
				<Td isNumeric>
					{currentBasket ? getCreditsString(...currentBasket.totalCredits) : ''}
				</Td>
				{
					!isForCapture && (
						<>
							<Td/>
							<Td/>
							<Td/>
						</>
					)
				}
			</Tr>
		</Tbody>
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

			{
				apiState.hasDataForTrackedEndpoints ? (
					<BodyWithData {...props}/>
				) : (
					<Tbody>
						{Array.from({length: 4}).map((_, i) => (
						// eslint-disable-next-line react/no-array-index-key
							<SkeletonRow key={i}/>
						))}
					</Tbody>
				)
			}
		</Table>
	);
};

export default observer(BasketTable);
