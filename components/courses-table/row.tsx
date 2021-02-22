import React, {useMemo, useState} from 'react';
import {Tr, Td, IconButton, VStack, Text, useDisclosure, Box, Heading, Button} from '@chakra-ui/react';
import {InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useAPI from '../../lib/state-context';
import useBackgroundColor from '../../lib/use-background-color';
import styles from './styles/table.module.scss';
import SectionsTable from '../sections-table';
import CourseStats from '../course-stats';
import ConditionalWrapper from '../conditional-wrapper';
import {ICourseFromAPI} from '../../lib/types';
import getCreditsStr from '../../lib/get-credits-str';

const TableRow = observer(({course}: {course: ICourseFromAPI}) => {
	const backgroundColor = useBackgroundColor();
	const {isOpen, onToggle} = useDisclosure();
	const [onlyShowSections, setOnlyShowSections] = useState(false);
	const store = useAPI();

	const sections = store.uiState.filteredSectionsByCourseId.get(course.id) ?? [];

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

	const courseKey = `${course.subject}${course.crse}`;

	return (
		<>
			<Tr className={isOpen ? styles.hideBottomBorder : ''}>
				<Td>{course.subject}<b>{course.crse}</b></Td>
				<Td whiteSpace="nowrap">
					{course.title}
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
						data-testid="course-details-button">
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
											<VStack spacing={4} align="flex-start">
												<Text>
													<b>Description: </b>
													{course.description}
												</Text>

												{
													course.prereqs && (
														<Text>
															<b>Prereqs: </b>
															{course.prereqs}
														</Text>
													)
												}
											</VStack>

											{
												store.apiState.passfaildrop[courseKey] && (
													<Box w="100%">
														<Heading mb={4}>Stats</Heading>

														<CourseStats w="100%" shadow="base" rounded="md" p={4} data={store.apiState.passfaildrop[courseKey]}/>
													</Box>
												)
											}
										</>
									)
								}

								<Box w="100%">
									{!onlyShowSections && (
										<Heading mb={4}>Sections</Heading>
									)}

									<SectionsTable shadow="base" borderRadius="md" bgColor={backgroundColor} sections={sections}/>
								</Box>
							</VStack>
						</ConditionalWrapper>
					</Td>
				</Tr>
			)}
		</>
	);
});

export default TableRow;
