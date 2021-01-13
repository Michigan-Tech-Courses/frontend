import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Spacer, HStack, VStack, TableCaption, Text, useDisclosure, useBreakpointValue, Box, Heading} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import styles from './styles/table.module.scss';
import InlineStat from './inline-stat';
import SectionsTable from './sections-table';
import CourseStats from './course-stats';

const SAMPLE_COURSE = {
	crse: 'CS1000',
	title: 'Intro to Programming',
	credits: 3,
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
};

const SAMPLE_COURSES = [SAMPLE_COURSE, SAMPLE_COURSE, SAMPLE_COURSE];

const TableRow = () => {
	const {isOpen, onToggle} = useDisclosure();

	return (
		<>
			<Tr className={isOpen ? styles.hideBottomBorder : ''}>
				<Td>{SAMPLE_COURSE.crse}</Td>
				<Td whiteSpace="nowrap">{SAMPLE_COURSE.title}</Td>
				<Td isNumeric>{SAMPLE_COURSE.credits}</Td>
				<Td display={{base: 'none', md: 'table-cell'}}><Text noOfLines={1} as="span">{SAMPLE_COURSE.description}</Text></Td>
				<Td style={{textAlign: 'right'}}>
					<IconButton variant="ghost" colorScheme="blue" onClick={onToggle} aria-label={isOpen ? 'Hide course details' : 'Show course details'} isActive={isOpen} data-testid="course-details-button">
						{isOpen ? <InfoIcon/> : <InfoOutlineIcon/>}
					</IconButton>
				</Td>
			</Tr>

			{isOpen && (
				<Tr>
					<Td colSpan={5}>
						<VStack align="flex-start" spacing={10}>
							<Text>
								<b>Description: </b>
								{SAMPLE_COURSE.description}
							</Text>

							<Box w="100%">
								<Heading mb={4}>Stats</Heading>

								<CourseStats w="100%" shadow="base" rounded="md" p={4}/>
							</Box>

							<Box w="100%">
								<Heading mb={4}>Sections</Heading>

								<SectionsTable boxShadow="base" borderRadius="md"/>
							</Box>
						</VStack>
					</Td>
				</Tr>
			)}
		</>
	);
};

const DataTable = () => {
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});

	return (
		<VStack maxW="80%">
			<HStack w="100%" mb={2}>
				<InlineStat label="matched" number="10,000" help="out of 20,900 courses"/>

				<Spacer/>

				<Text>last updated 3 minutes ago</Text>
			</HStack>

			<Table variant="simple" boxShadow="base" borderRadius="md" size={tableSize}>
				<TableCaption p="0" mb={4}>

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
						<Th style={{textAlign: 'right'}}>Details</Th>
					</Tr>
				</Thead>
				<Tbody>
					{SAMPLE_COURSES.map((_, i) => (
						<TableRow key={i}/>
					))}
				</Tbody>
			</Table>
		</VStack>
	);
};

export default DataTable;
