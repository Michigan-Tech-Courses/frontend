import React from 'react';
import {Tr, Td, VStack, Text, Box, Heading, Button, Collapse} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import SectionsTable from '../sections-table';
import CourseStats from '../course-stats';
import useStore from '../../lib/state-context';
import {ICourseWithFilteredSections} from '../../lib/ui-state';

const Stats = observer(({courseKey}: {courseKey: string}) => {
	const store = useStore();

	const data = store.apiState.passfaildrop[courseKey];

	if (!data) {
		return null;
	}

	return (
		<Box w="100%">
			<Heading mb={4}>Stats</Heading>

			<Box p={1}>
				<CourseStats w="100%" shadow="base" rounded="md" p={4} data={store.apiState.passfaildrop[courseKey]}/>
			</Box>
		</Box>
	);
});

const DetailsRow = ({course, onlyShowSections, onShowEverything}: {course: ICourseWithFilteredSections; onlyShowSections: boolean; onShowEverything: () => void}) => {
	const courseKey = `${course.course.subject}${course.course.crse}`;

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

					<Collapse in={!onlyShowSections} style={{width: '100%'}} unmountOnExit>
						<VStack spacing={10} align="flex-start">
							<VStack spacing={4} align="flex-start">
								<Text whiteSpace="normal">
									<b>Description: </b>
									{course.course.description}
								</Text>

								{
									course.course.prereqs && (
										<Text>
											<b>Prereqs: </b>
											{course.course.prereqs}
										</Text>
									)
								}
							</VStack>

							<Stats courseKey={courseKey}/>
						</VStack>
					</Collapse>

					<Box w="100%">
						{!onlyShowSections && (
							<Heading mb={4}>Sections</Heading>
						)}

						<SectionsTable shadow="base" borderRadius="md" sections={course.sections.wasFiltered ? course.sections.filtered : course.sections.all}/>
					</Box>
				</VStack>
			</Td>
		</Tr>
	);
};

export default DetailsRow;
