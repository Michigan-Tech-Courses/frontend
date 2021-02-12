import React, {useEffect, useMemo, useState} from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Spacer, HStack, VStack, TableCaption, Text, useDisclosure, useBreakpointValue, Box, Heading, Button, Skeleton} from '@chakra-ui/react';
import {ArrowLeftIcon, ArrowRightIcon, InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/api-state-context';
import usePrevious from '../lib/use-previous';
import useBackgroundColor from '../lib/use-background-color';
import styles from './styles/table.module.scss';
import InlineStat from './inline-stat';
import SectionsTable from './sections-table';
import CourseStats from './course-stats';
import ConditionalWrapper from './conditional-wrapper';

import {ICourseFromAPI, ISectionFromAPI} from '../lib/types';
import getCreditsStr from '../lib/get-credits-str';

const TableRow = ({isHighlighted = false, isSectionHighlighted = false, course, sections}: {isHighlighted: boolean; isSectionHighlighted: boolean; course: ICourseFromAPI; sections: ISectionFromAPI[]}) => {
	const backgroundColor = useBackgroundColor();
	const {isOpen, onToggle} = useDisclosure();
	const wasOpen = usePrevious(isOpen);
	const [onlyShowSections, setOnlyShowSections] = useState(isSectionHighlighted);

	useEffect(() => {
		if (isSectionHighlighted && !wasOpen && !isOpen) {
			onToggle();
			setOnlyShowSections(true);
		}
	}, [isSectionHighlighted, wasOpen, onToggle, isOpen]);

	const creditsString: string = useMemo(() => {
		if (sections.length === 0) {
			return '';
		}

		let min = 10000;
		let max = 0;
		sections.forEach(s => {
			if (s.minCredits < min) {
				min = s.minCredits;
			}

			if (s.maxCredits > max) {
				max = s.maxCredits;
			}
		});

		return getCreditsStr(min, max);
	}, [sections]);

	return (
		<>
			<Tr className={isOpen ? styles.hideBottomBorder : ''}>
				<Td>{`${course.subject}${course.crse}`}</Td>
				<Td whiteSpace="nowrap">
					{isHighlighted ? (
						<mark>{course.title}</mark>
					) : (
						course.title
					)}
				</Td>
				<Td isNumeric>{creditsString}</Td>
				<Td display={{base: 'none', md: 'table-cell'}}><Text noOfLines={1} as="span">{course.description}</Text></Td>
				<Td style={{textAlign: 'right'}}>
					<IconButton
						variant="ghost"
						colorScheme="blue"
						onClick={onToggle}
						aria-label={isOpen ? 'Hide course details' : 'Show course details'}
						isActive={isOpen}
						data-testid="course-details-button"
						isDisabled={isSectionHighlighted}>
						{isOpen ? <InfoIcon/> : <InfoOutlineIcon/>}
					</IconButton>
				</Td>
			</Tr>

			{isOpen && (
				<Tr>
					<Td colSpan={5}>
						<ConditionalWrapper
							condition={onlyShowSections}
							wrapper={children => (
								<Button w="100%" h="100%" p={4} onClick={() => {
									setOnlyShowSections(false);
								}} aria-label="Show full course details">
									{children}
								</Button>
							)}>
							<VStack align="flex-start" spacing={10} w="100%">
								{
									onlyShowSections && (
										<Text fontSize="2xl" fontWeight="bold" w="100%">.	.	.</Text>
									)
								}

								{
									!onlyShowSections && (
										<>
											<Text>
												<b>Description: </b>
												{course.description}
											</Text>

											<Box w="100%">
												<Heading mb={4}>Stats</Heading>

												<CourseStats w="100%" shadow="base" rounded="md" p={4}/>
											</Box>
										</>
									)
								}

								<Box w="100%">
									{!onlyShowSections && (
										<Heading mb={4}>Sections</Heading>
									)}

									<SectionsTable shadow="base" borderRadius="md" isHighlighted={isSectionHighlighted} bgColor={backgroundColor} sections={sections}/>
								</Box>
							</VStack>
						</ConditionalWrapper>
					</Td>
				</Tr>
			)}
		</>
	);
};

const TableBody = () => {
	const store = useAPI();

	return (
		<Tbody>
			{
				store.sortedCourses.slice(0, 10).map(course => <TableRow key={course.id} course={course} isHighlighted={false} isSectionHighlighted={false} sections={store.sectionsByCourseId.get(course.id) ?? []}/>)
			}
		</Tbody>
	);
};

const DataTable = ({isHighlighted = false}: {isHighlighted: boolean}) => {
	const tableSize = useBreakpointValue({base: 'sm', md: 'md'});
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsLoaded(true);
		}, 1000);

		return () => {
			clearTimeout(timeout);
		};
	}, []);

	return (
		<VStack maxW="min(100rem, 80%)">
			<HStack w="100%" mb={2}>
				<Skeleton isLoaded={isLoaded}>
					<InlineStat label="matched" number="10,000" help="out of 20,900 courses"/>
				</Skeleton>

				<Spacer/>

				<Skeleton isLoaded={isLoaded}>
					<Text>last updated 3 minutes ago</Text>
				</Skeleton>
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
				<TableBody/>
			</Table>
		</VStack>
	);
};

export default observer(DataTable);
