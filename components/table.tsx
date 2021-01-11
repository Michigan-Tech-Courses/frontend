import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Container, Spacer, HStack, VStack, TableCaption, Text, useDisclosure, Tag, useBreakpointValue} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import styles from './styles/table.module.scss';
import InlineStat from './inline-stat';

const SAMPLE_COURSE = {
	crse: 'CS1000',
	title: 'Intro to Programming',
	credits: 3,
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
};

const SAMPLE_COURSES = [SAMPLE_COURSE, SAMPLE_COURSE, SAMPLE_COURSE];

const TableRow = () => {
	const {isOpen, onToggle} = useDisclosure();
	const tableSize = useBreakpointValue({sm: 'sm', md: 'md'});

	return (
		<>
			<Tr>
				<Td borderBottomWidth={isOpen ? 0 : ''}>{SAMPLE_COURSE.crse}</Td>
				<Td borderBottomWidth={isOpen ? 0 : ''}>{SAMPLE_COURSE.title}</Td>
				<Td borderBottomWidth={isOpen ? 0 : ''} isNumeric>{SAMPLE_COURSE.credits}</Td>
				<Td borderBottomWidth={isOpen ? 0 : ''} w="50%" display={{base: 'none', md: 'table-cell'}}><Text noOfLines={1} as="span">{SAMPLE_COURSE.description}</Text></Td>
				<Td borderBottomWidth={isOpen ? 0 : ''}>
					<IconButton variant="ghost" colorScheme="blue" onClick={onToggle} aria-label={isOpen ? 'Hide course details' : 'Show course details'} isActive={isOpen}>
						{isOpen ? <InfoIcon/> : <InfoOutlineIcon/>}
					</IconButton>
				</Td>
			</Tr>

			{isOpen && (
				<Tr>
					<Td colSpan={5} w="100%">
						<span>
							<b>Description: </b>
							{SAMPLE_COURSE.description}
						</span>

						<Table my="1rem" className={styles.tableWithoutBottomBorder} size={tableSize} variant="simple" boxShadow="base" borderRadius="md">
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
									<Td>Leo Ureel</Td>
									<Td>MWF 1:00-3:00</Td>
									<Td isNumeric>48939</Td>
									<Td isNumeric>3</Td>
									<Td isNumeric>40</Td>
									<Td isNumeric>23</Td>
									<Td isNumeric>
										<Tag colorScheme={17 <= 0 ? 'red' : 'green'}>17</Tag>
									</Td>
								</Tr>
							</Tbody>
						</Table>
					</Td>
				</Tr>
			)}
		</>
	);
};

const DataTable = () => {
	const tableSize = useBreakpointValue({sm: 'sm', md: 'md'});

	return (
		<Container maxW="80%" mt="3rem">
			<VStack>
				<HStack w="100%" mb="0.5rem">
					<InlineStat label="matched" number="10,000" help="out of 20,900 courses"/>

					<Spacer/>

					<Text>last updated 3 minutes ago</Text>
				</HStack>

				<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
					<TableCaption p="0" mb="1rem">

						<HStack w="100%">
							<IconButton aria-label="Move back a page" size="sm" isDisabled><ArrowLeftIcon/></IconButton>

							<Spacer/>

							<HStack>
								<Text>page 1 of 100</Text>
								<Select w="auto" size="sm" aria-label="Change number of rows per page">
									<option>10</option>
									<option>20</option>
									<option>50</option>
								</Select>
							</HStack>

							<Spacer/>

							<IconButton aria-label="Move forward a page" size="sm"><ArrowRightIcon/></IconButton>
						</HStack>
					</TableCaption>
					<Thead>
						<Tr>
							<Th>Course</Th>
							<Th>Title</Th>
							<Th isNumeric>Credits</Th>
							<Th display={{base: 'none', md: 'table-cell'}}>Description</Th>
							<Th>Details</Th>
						</Tr>
					</Thead>
					<Tbody>
						{SAMPLE_COURSES.map(() => (
							<TableRow/>
						))}
					</Tbody>
				</Table>
			</VStack>
		</Container>
	);
};

export default DataTable;
