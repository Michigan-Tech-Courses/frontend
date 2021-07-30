import React from 'react';
import {
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	Box,
	useMultiStyleConfig,
	useColorModeValue,
	useDisclosure,
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	IconButton,
	Tag
} from '@chakra-ui/react';
import useStore from '../lib/state-context';
import {observer} from 'mobx-react-lite';
import {DeleteIcon, Search2Icon} from '@chakra-ui/icons';
import TimeDisplay from './sections-table/time-display';
import InstructorList from './sections-table/instructor-list';

const Basket = () => {
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {basketState, uiState} = useStore();

	const styles = useMultiStyleConfig('Drawer', {placement: 'bottom'});
	const bgColor = useColorModeValue('gray.100', styles.dialog.bg as string);

	const handleSearch = (query: string) => {
		uiState.setSearchValue(query);
		onClose();
	};

	return (
		<>
			{/* Footer margin */}
			<Box h={12}/>

			<Box
				display="flex"
				justifyContent="center"
				pos="fixed"
				bottom={0}
				left={0}
				w="full">
				<Box
					p={4}
					title="Open basket"
					as="button"
					role="group"
					onClick={onOpen}
					transitionProperty="common"
					transitionDuration="normal"
					transitionTimingFunction="ease-in-out"
					_hover={{
						bgColor,
						boxShadow: styles.dialog.boxShadow as string
					}}
					w="sm"
					display="flex"
					justifyContent="center"
					roundedTop="md">
					<Box
						rounded="full"
						bgColor="gray.300"
						maxW={64}
						flex={1}
						transitionProperty="height"
						transitionDuration="300ms"
						transitionTimingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
						h={2}
						_groupHover={{h: 4}}/>
				</Box>

				<Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
					<DrawerOverlay/>
					<DrawerContent>
						<DrawerCloseButton/>
						<DrawerHeader>Basket</DrawerHeader>

						<DrawerBody>
							<Table shadow="base" rounded="md">
								<Thead>
									<Tr>
										<Th>Title</Th>
										<Th>Section</Th>
										<Th>Instructors</Th>
										<Th>Schedule</Th>
										<Th isNumeric>CRN</Th>
										<Th isNumeric>Credits</Th>
										<Th isNumeric>Capacity</Th>
										<Th isNumeric>Seats Available</Th>
										<Th isNumeric>Go</Th>
										<Th isNumeric>Remove</Th>
									</Tr>
								</Thead>

								<Tbody>
									{
										basketState.sections.map(section => (
											<Tr key={section.id}>
												<Td>{section.course.title}</Td>
												<Td isNumeric>{section.section}</Td>
												<Td>
													<InstructorList instructors={section.instructors}/>
												</Td>
												<Td>
													<TimeDisplay size="lg" schedule={section.time}/>
												</Td>
												<Td isNumeric>{section.crn}</Td>
												<Td isNumeric>{section.maxCredits}</Td>
												<Td isNumeric>{section.totalSeats}</Td>
												<Td isNumeric>
													<Tag size="lg" colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>
														{section.availableSeats}
													</Tag>
												</Td>
												<Td isNumeric>
													<IconButton
														colorScheme="blue"
														icon={<Search2Icon/>}
														size="sm"
														aria-label="Go to section"
														onClick={() => {
															handleSearch(`id:${section.id}`);
														}}/>
												</Td>
												<Td isNumeric>
													<IconButton
														colorScheme="red"
														icon={<DeleteIcon/>}
														size="sm"
														aria-label="Remove from basket"
														onClick={() => {
															basketState.removeSection(section.id);
														}}/>
												</Td>
											</Tr>
										))
									}
									{
										basketState.searchQueries.map(query => (
											<Tr key={query}>
												<Td colSpan={8}>
													<Tag size="lg">
														{query}
													</Tag>
												</Td>
												<Td isNumeric>
													<IconButton
														colorScheme="blue"
														icon={<Search2Icon/>}
														size="sm"
														aria-label="Go to section"
														onClick={() => {
															handleSearch(query);
														}}/>
												</Td>
												<Td isNumeric>
													<IconButton
														colorScheme="red"
														icon={<DeleteIcon/>}
														size="sm"
														aria-label="Remove from basket"
														onClick={() => {
															basketState.removeSearchQuery(query);
														}}/>
												</Td>
											</Tr>
										))
									}
								</Tbody>
							</Table>
						</DrawerBody>

						<DrawerFooter/>
					</DrawerContent>
				</Drawer>
			</Box>
		</>
	);
};

export default observer(Basket);
