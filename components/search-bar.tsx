import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Input, Container, InputGroup, InputLeftElement, Text, Kbd, Modal, ModalOverlay, ModalContent, Heading, Code, VStack, Box, Button, HStack, ModalBody, ModalCloseButton, ModalHeader} from '@chakra-ui/react';
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
			},
			{
				label: 'filter by courses that are between 1000 and 3000 level',
				query: 'level:1000-3000'
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

const SearchBar = ({innerRef}: {innerRef: React.Ref<HTMLDivElement>}) => {
	const [value, setValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const [showHelp, setShowHelp] = useState(false);
	const [isKeyHeld, handleKeydown] = useHeldKey({key: '/'});

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

	useEffect(() => {
		if (isKeyHeld) {
			setShowHelp(true);
		} else {
			setShowHelp(false);
		}
	}, [isKeyHeld]);

	const handleShowHelp = useCallback(() => {
		setShowHelp(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setShowHelp(false);
	}, []);

	return (
		<Container ref={innerRef}>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>

				<Input
					ref={inputRef}
					placeholder="Search by instructor, subject, section, or anything else..."
					size="lg"
					autoFocus
					value={value}
					onChange={event => {
						setValue(event.target.value);
					}}
					aria-label="Search for courses or sections"
					disabled={!(store.apiState.hasCourseData ?? false)}
					onKeyDown={handleKeydown}
				/>
			</InputGroup>

			<HStack mt={3} w="100%" justifyContent="center">
				<Text>
					hold <Kbd>/</Kbd> to see
				</Text>
				<Button size="sm" onClick={handleShowHelp}>available filters</Button>
			</HStack>

			<Modal isOpen={showHelp} onClose={handleModalClose} size="xl">
				<ModalOverlay/>
				<ModalContent p={8}>
					<ModalHeader>Filter Cheatsheet</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={8} alignItems="flex-start">
							{
								FILTER_EXAMPLES.map(exampleGroup => (
									<VStack key={exampleGroup.label} alignItems="flex-start" w="100%" spacing={3}>
										<Heading size="sm">{exampleGroup.label}</Heading>

										{exampleGroup.examples.map(example => (
											<Box display="flex" key={example.label} w="100%">
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
			</Modal>
		</Container>
	);
};

export default observer(SearchBar);
