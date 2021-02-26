import React, {useEffect, useRef, useState} from 'react';
import {Input, Container, InputGroup, InputLeftElement, Text, Kbd, Modal, ModalOverlay, ModalContent, Heading, Code, VStack, Box} from '@chakra-ui/react';
import {Search2Icon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/state-context';
import useHeldKey from '../lib/use-held-key';

const FILTER_EXAMPLES = [
	{
		label: 'Subject',
		examples: [
			{
				label: 'filter by Computer Science courses',
				query: 'subject:cs'
			}
		]
	},
	{
		label: 'Course Level',
		examples: [
			{
				label: 'filter only by 1000-2000 level courses',
				query: 'level:1000'
			},
			{
				label: 'filter by courses that are at least 1000 level',
				query: 'level:1000+'
			}
		]
	},
	{
		label: 'Section Seats',
		examples: [
			{
				label: 'filter by sections with available seats',
				query: 'has:seats'
			}
		]
	},
	{
		label: 'Credits',
		examples: [
			{
				label: 'filter by 3 credit sections',
				query: 'credits:3'
			},
			{
				label: 'filter by sections that are at least 3 credits',
				query: 'credits:3+'
			},
			{
				label: 'filter by sections that are between 1 and 3 credits',
				query: 'credits:1-3'
			}
		]
	}
];

const SearchBar = () => {
	const [value, setValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const [showHelp, handleKeydown] = useHeldKey({key: '/'});

	const store = useAPI();

	// Autofocus
	useEffect(() => {
		if (store.apiState.hasCourseData) {
			inputRef.current?.focus();
		}
	}, [store.apiState.hasCourseData]);

	useEffect(() => {
		store.uiState.setSearchValue(value);
	}, [store.uiState.setSearchValue, value]);

	return (
		<Container>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>

				<Input
					ref={inputRef}
					placeholder="Start typing..."
					size="lg"
					autoFocus
					value={value}
					onChange={event => {
						setValue(event.target.value);
					}}
					aria-label="Search for courses or sections"
					disabled={!store.apiState.hasCourseData}
					onKeyDown={handleKeydown}
				/>
			</InputGroup>

			<Text mt={3} align="center">hold <Kbd>/</Kbd> to see available filters</Text>

			<Modal isOpen={showHelp} onClose={() => { /* closed by releasing hotkey */ }} size="xl">
				<ModalOverlay/>
				<ModalContent p={10}>
					<Heading size="lg" mb={6}>Filter Cheatsheet</Heading>

					<VStack spacing={8} alignItems="flex-start">
						{
							FILTER_EXAMPLES.map(exampleGroup => (
								<VStack key={exampleGroup.label} alignItems="flex-start">
									<Heading size="sm">{exampleGroup.label}</Heading>

									{exampleGroup.examples.map(example => (
										<Box display="flex" alignItems="center" key={example.label}>
											<Box w="12ch">
												<Code>{example.query}</Code>
											</Box>
											<Text>{example.label}</Text>
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
				</ModalContent>
			</Modal>
		</Container>
	);
};

export default observer(SearchBar);
