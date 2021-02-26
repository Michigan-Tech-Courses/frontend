import React from 'react';
import {Tr, Td, VStack, Text, Box, Heading, Button, Collapse} from '@chakra-ui/react';
import SectionsTable from '../sections-table';
import CourseStats from '../course-stats';
import useAPI from '../../lib/state-context';
import {ICourseWithFilteredSections} from '../../lib/ui-state';
import useBackgroundColor from '../../lib/use-background-color';

const DetailsRow = ({course, onlyShowSections, onShowEverything}: {course: ICourseWithFilteredSections; onlyShowSections: boolean; onShowEverything: () => void}) => {
	const backgroundColor = useBackgroundColor();
	const store = useAPI();

	const courseKey = `${course.subject}${course.crse}`;

	return (
		<Tr>
			<Td colSpan={5}>
				<VStack align="flex-start" spacing={10} w="100%">
					{
						onlyShowSections && (
							<Button w="100%" onClick={onShowEverything} aria-label="Show full course details">
								<Text fontSize="2xl" fontWeight="bold" w="100%">· · ·</Text>
							</Button>
						)
					}

					<Collapse in={!onlyShowSections} style={{overflow: 'unset', width: '100%'}}>
						<VStack spacing={10} align="flex-start">
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
						</VStack>
					</Collapse>

					<Box w="100%">
						{!onlyShowSections && (
							<Heading mb={4}>Sections</Heading>
						)}

						<SectionsTable shadow="base" borderRadius="md" bgColor={backgroundColor} sections={course.sections.wasFiltered ? course.sections.filtered : course.sections.all}/>
					</Box>
				</VStack>
			</Td>
		</Tr>
	);
};

export default DetailsRow;
