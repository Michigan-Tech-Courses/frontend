import React from 'react';
import {
	Tr,
	Td,
	VStack,
	Text,
	Box,
	Heading,
	Button,
	Collapse,
	IconButton,
	HStack,
	Spacer,
	Stack,
	Tooltip,
} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {faShare} from '@fortawesome/free-solid-svg-icons';
import SectionsTable from 'src/components/sections-table';
import CourseStats from 'src/components/course-stats';
import useStore from 'src/lib/state/context';
import {ICourseWithFilteredSections} from 'src/lib/state/ui';
import WrappedFontAwesomeIcon from 'src/components/wrapped-font-awesome-icon';
import toTitleCase from 'src/lib/to-title-case';
import {AddIcon, DeleteIcon} from '@chakra-ui/icons';

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

const DetailsRow = ({course, onlyShowSections, onShowEverything, onShareCourse}: {course: ICourseWithFilteredSections; onlyShowSections: boolean; onShowEverything: () => void; onShareCourse: () => void}) => {
	const {allBasketsState, apiState: {selectedTerm}} = useStore();
	const courseKey = `${course.course.subject}${course.course.crse}`;

	const courseSections = course.sections.wasFiltered ? course.sections.filtered : course.sections.all;

	const isCourseInBasket = allBasketsState.currentBasket?.hasCourse(course.course.id);

	const handleBasketAction = () => {
		if (!allBasketsState.currentBasket && selectedTerm) {
			const basket = allBasketsState.addBasket(selectedTerm);
			allBasketsState.setSelectedBasket(basket.id);
			basket.addCourse(course.course.id);
			return;
		}

		if (isCourseInBasket) {
			allBasketsState.currentBasket?.removeCourse(course.course.id);
		} else {
			allBasketsState.currentBasket?.addCourse(course.course.id);
		}
	};

	return (
		<Tr>
			<Td colSpan={5}>
				<VStack align="flex-start" spacing={10} w="100%">
					{
						onlyShowSections && (
							<Button w="100%" aria-label="Show full course details" onClick={onShowEverything}>
								<Text fontSize="2xl" fontWeight="bold" w="100%">· · ·</Text>
							</Button>
						)
					}

					<Collapse unmountOnExit in={!onlyShowSections} style={{width: '100%'}}>
						<VStack spacing={10} align="flex-start" w="full">
							<VStack spacing={4} align="flex-start" w="full">
								<HStack w="full">
									<Stack>
										<Text whiteSpace="normal">
											<b>Description: </b>
											{course.course.description}
										</Text>

										{
											course.course.offered && course.course.offered.length > 0 && (
												<Text whiteSpace="normal">
													<b>Semesters offered: </b>
													{toTitleCase(course.course.offered.join(', '))}
												</Text>
											)
										}
									</Stack>

									<Spacer/>

									<VStack>
										<IconButton
											icon={<WrappedFontAwesomeIcon icon={faShare}/>}
											aria-label="Share course"
											variant="ghost"
											colorScheme="brand"
											title="Share course"
											onClick={onShareCourse}/>

										<Tooltip label={isCourseInBasket ? 'remove course from basket' : 'add course to basket'}>
											<IconButton
												icon={isCourseInBasket ? <DeleteIcon/> : <AddIcon/>}
												aria-label="Add course to basket"
												size="xs"
												colorScheme={isCourseInBasket ? 'red' : undefined}
												onClick={handleBasketAction}/>
										</Tooltip>
									</VStack>
								</HStack>

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

					{
						courseSections.length > 0 && (
							<Box w="100%">
								{!onlyShowSections && (
									<Heading mb={4}>Sections</Heading>
								)}

								<SectionsTable shadow="base" borderRadius="md" sections={courseSections}/>
							</Box>
						)
					}
				</VStack>
			</Td>
		</Tr>
	);
};

export default observer(DetailsRow);
