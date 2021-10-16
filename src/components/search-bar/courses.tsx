import React, {useCallback} from 'react';
import {
	Tooltip,
	IconButton,
	Box,
	Code,
	Heading,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	VStack,
	Text,
} from '@chakra-ui/react';
import {DeleteIcon, StarIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import DefaultSearchBar from './default';

const FILTER_EXAMPLES = [
	{
		label: 'Subject',
		examples: [
			{
				label: 'filter by Computer Science courses',
				query: 'subject:cs',
			},
		],
	},
	{
		label: 'Course Level',
		examples: [
			{
				label: 'filter only by 1000-2000 level courses',
				query: 'level:1000',
			},
			{
				label: 'filter by courses that are at least 1000 level',
				query: 'level:1000+',
			},
			{
				label: 'filter by courses that are between 1000 and 3000 level',
				query: 'level:1000-3000',
			},
		],
	},
	{
		label: 'Section Seats',
		examples: [
			{
				label: 'filter by sections with available seats',
				query: 'has:seats',
			},
		],
	},
	{
		label: 'Location',
		examples: [
			{
				label: 'filter by sections offered in-person',
				query: 'is:classroom',
			},
			{
				label: 'filter by online sections (recorded lectures)',
				query: 'is:online',
			},
			{
				label: 'filter by remote sections (live lectures but online)',
				query: 'is:remote',
			},
		],
	},
	{
		label: 'Credits',
		examples: [
			{
				label: 'filter by 3 credit sections',
				query: 'credits:3',
			},
			{
				label: 'filter by sections that are at least 3 credits',
				query: 'credits:3+',
			},
			{
				label: 'filter by sections that are between 1 and 3 credits',
				query: 'credits:1-3',
			},
		],
	},
	{
		label: 'Schedule',
		examples: [
			{
				label: 'filter by sections that have a listed schedule',
				query: 'has:time',
			},
		],
	},
	{
		label: 'Basket',
		examples: [
			{
				label: 'filter by sections that are schedule-compatible with saved sections in your basket',
				query: 'is:compatible',
			},
		],
	},
];

const Help = () => (
	<ModalContent p={8}>
		<ModalHeader>Filter Cheatsheet</ModalHeader>
		<ModalCloseButton/>
		<ModalBody>
			<VStack spacing={8} alignItems="flex-start">
				{
					FILTER_EXAMPLES.map(exampleGroup => (
						<VStack key={exampleGroup.label} alignItems="flex-start" w="100%" spacing={3}>
							<Heading size="sm">{exampleGroup.label}</Heading>

							{exampleGroup.examples.map(example => (
								<Box key={example.label} display="flex" w="100%">
									<Box w="20ch">
										<Code>{example.query}</Code>
									</Box>

									<Text w="100%">{example.label}</Text>
								</Box>
							))}
						</VStack>
					))
				}

				<Box>
					<Heading size="md" mb={2}>Tips</Heading>

					<Text>
						Don't be afraid to mix and match! Queries like <Code>subject:cs has:seats ureel</Code> work just fine.
					</Text>
				</Box>
			</VStack>
		</ModalBody>
	</ModalContent>
);

const CoursesSearchBar = observer(() => {
	const {
		uiState,
		apiState,
		allBasketsState: {currentBasket},
	} = useStore();

	const isQuerySaved = uiState.searchValue === '' ? false : currentBasket?.searchQueries.includes(uiState.searchValue);

	const handleQuerySaveOrDelete = useCallback(() => {
		if (!currentBasket) {
			return;
		}

		if (currentBasket.searchQueries.includes(uiState.searchValue)) {
			currentBasket.removeSearchQuery(uiState.searchValue);
		} else {
			currentBasket.addSearchQuery(uiState.searchValue);
		}
	}, [currentBasket, uiState.searchValue]);

	const handleSearchChange = useCallback((newValue: string) => {
		uiState.setSearchValue(newValue);
	}, [uiState]);

	return (
		<DefaultSearchBar
			rightButtons={(
				<Tooltip label={isQuerySaved ? 'remove query from basket' : 'save query to basket'}>
					<IconButton
						colorScheme={isQuerySaved ? 'red' : 'purple'}
						icon={isQuerySaved ? <DeleteIcon/> : <StarIcon/>}
						aria-label={isQuerySaved ? 'Remove from basket' : 'Save to basket'}
						rounded="full"
						size="xs"
						mr={2}
						onClick={handleQuerySaveOrDelete}
					/>
				</Tooltip>
			)}
			placeholder="Search by instructor, subject, section, or anything else..."
			isEnabled={apiState.hasDataForTrackedEndpoints}
			value={uiState.searchValue}
			onChange={handleSearchChange}
		>
			<Help/>
		</DefaultSearchBar>
	);
});

export default CoursesSearchBar;
