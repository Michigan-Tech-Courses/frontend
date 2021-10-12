import React, {useEffect, useCallback, useState, useMemo} from 'react';
import {
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	Box,
	useDisclosure,
	useBreakpointValue,
	usePrevious,
	useToast,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	HStack,
	Text,
	Kbd,
	Button,
	Spacer,
	Heading,
	Editable,
	EditableInput,
	EditablePreview,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useEditableControls,
	IconButton,
	Tooltip,
	ModalFooter,
} from '@chakra-ui/react';
import * as portals from 'react-reverse-portal';
import {useHotkeys} from 'react-hotkeys-hook';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import useTip from 'src/lib/hooks/use-tip';
import useHeldKey from 'src/lib/hooks/use-held-key';
import {AddIcon, ChevronDownIcon, DeleteIcon} from '@chakra-ui/icons';
import EditableControls from '../editable-controls';
import BasketContent from './content';
import FloatingButton from './floating-button';
import BasketCalendar, {BasketCalendarProvider} from './calendar/calendar';
import {CalendarEvent} from './calendar/types';

type BasketSelectorProps = {
	onCreateNewBasket: () => void;
};

const BasketSelector = (props: BasketSelectorProps) => {
	const {isEditing} = useEditableControls();
	const {allBasketsState, apiState} = useStore();
	const {currentBasket} = allBasketsState;

	if (!currentBasket) {
		return <>¯\_(ツ)_/¯</>;
	}

	return (
		<Menu>
			{({isOpen}) => (
				<>
					<MenuButton
						as={Button}
						rightIcon={<ChevronDownIcon
							transform={isOpen ? 'rotate(180deg)' : ''}
							transitionProperty="transform"
							transitionDuration="normal"/>}
						display={isEditing ? 'none' : 'block'}
					>
						<EditablePreview/>
						<EditableInput/>
					</MenuButton>
					<MenuList>
						<MenuItem icon={<AddIcon/>} onClick={props.onCreateNewBasket}>
							Add basket
						</MenuItem>

						{
							apiState.selectedSemester && allBasketsState.getBasketsFor(apiState.selectedSemester).map(basket => (
								<MenuItem
									key={basket.id}
									onClick={() => {
										allBasketsState.setSelectedBasket(basket.id);
									}}
								>
									{basket.name}
								</MenuItem>
							))
						}
					</MenuList>
				</>
			)}
		</Menu>
	);
};

type BasketsSelectAndEditProps = {
	onCreateNewBasket: () => void;
};

const BasketsSelectAndEdit = (props: BasketsSelectAndEditProps) => {
	const deleteBasketDisclosure = useDisclosure();
	const {allBasketsState} = useStore();
	const {currentBasket} = allBasketsState;

	const [basketName, setBasketName] = useState(currentBasket?.name ?? '');

	const previousName = usePrevious(currentBasket?.name);
	useEffect(() => {
		if (currentBasket && previousName !== currentBasket.name) {
			setBasketName(currentBasket.name);
		}
	}, [currentBasket, previousName]);

	const handleDelete = useCallback(() => {
		if (!currentBasket) {
			return;
		}

		allBasketsState.removeBasket(currentBasket.id);
		deleteBasketDisclosure.onClose();
	}, [allBasketsState, currentBasket, deleteBasketDisclosure]);

	if (!currentBasket) {
		return <>¯\_(ツ)_/¯</>;
	}

	return (
		<>
			<Editable
				submitOnBlur
				value={basketName}
				startWithEditView={false}
				as={HStack}
				alignItems="center"
				onChange={setBasketName}
				onSubmit={newName => {
					currentBasket.setName(newName.trim());
				}}
			>
				<BasketSelector onCreateNewBasket={props.onCreateNewBasket}/>
				<EditableInput/>

				<EditableControls/>

				<Tooltip label="delete basket">
					<IconButton
						size="xs"
						icon={<DeleteIcon/>}
						colorScheme="red"
						aria-label="Delete basket"
						onClick={deleteBasketDisclosure.onOpen}/>
				</Tooltip>
			</Editable>

			<Modal isOpen={deleteBasketDisclosure.isOpen} onClose={deleteBasketDisclosure.onClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Confirm Deletion</ModalHeader>
					<ModalBody>
						Are you sure you want to delete this basket?
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={deleteBasketDisclosure.onClose}>
							Cancel
						</Button>
						<Button variant="ghost" colorScheme="red" onClick={handleDelete}>
							Delete Basket
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

const Basket = observer(() => {
	const toast = useToast();
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {allBasketsState, uiState, apiState} = useStore();
	const {currentBasket} = allBasketsState;
	const previousBasketSize = usePrevious(currentBasket?.numOfItems);

	const isUltrawide = useBreakpointValue({base: false, '4xl': true});
	const wasPreviouslyUltrawide = usePrevious(isUltrawide);

	const {onShowTip} = useTip('You can use normal undo / redo keyboard shortcuts.');
	useEffect(() => {
		if (previousBasketSize && currentBasket?.numOfItems !== previousBasketSize) {
			onShowTip();
		}
	}, [onShowTip, currentBasket, previousBasketSize]);

	useHotkeys('ctrl+z, command+z', () => {
		const stateDidChange = currentBasket?.undoLastAction();

		if (!stateDidChange) {
			toast({
				title: 'Whoops',
				status: 'warning',
				description: 'Nothing to undo.',
				duration: 400,
			});
		}
	}, [currentBasket, toast]);
	useHotkeys('ctrl+shift+z, command+shift+z', () => {
		const stateDidChange = currentBasket?.redoLastAction();

		if (!stateDidChange) {
			toast({
				title: 'Whoops',
				status: 'warning',
				description: 'Nothing to redo.',
				duration: 400,
			});
		}
	}, [currentBasket, toast]);

	const [isHeld] = useHeldKey({key: 'c', stopPropagation: false});
	const wasPreviouslyHeld = usePrevious(isHeld);
	const calendarDisclosure = useDisclosure();

	useEffect(() => {
		if (isHeld && !wasPreviouslyHeld && currentBasket) {
			calendarDisclosure.onToggle();
		}
	}, [calendarDisclosure, isHeld, wasPreviouslyHeld, currentBasket]);

	// Ensure drawer state is synced when window is resized
	useEffect(() => {
		if (isUltrawide && !wasPreviouslyUltrawide) {
			onClose();
		}
	}, [isUltrawide, wasPreviouslyUltrawide, onClose]);

	const handleEventClick = useCallback((event: CalendarEvent) => {
		calendarDisclosure.onClose();
		uiState.setSearchValue(`id:${event.section.id}`);
	}, [uiState, calendarDisclosure]);

	const handleNewBasketCreation = () => {
		if (apiState.selectedSemester) {
			const newBasket = allBasketsState.addBasket(apiState.selectedSemester);
			allBasketsState.setSelectedBasket(newBasket.id);
		}
	};

	const [shouldRenderTable, setShouldRenderTable] = useState(false);

	useEffect(() => {
		setShouldRenderTable(true);
	}, []);

	const contentPortalNode = useMemo(() => {
		if (!shouldRenderTable) {
			return null;
		}

		return portals.createHtmlPortalNode();
	}, [shouldRenderTable]);

	const calendarPortalNode = useMemo(() => {
		if (typeof window === 'undefined') {
			return null;
		}

		return portals.createHtmlPortalNode();
	}, []);

	return (
		<BasketCalendarProvider>
			{
				contentPortalNode ? (
					<portals.InPortal node={contentPortalNode}>
						{
							currentBasket ? (
								<BasketContent onClose={onClose}/>
							) : (
								<Box w="full" display="flex">
									<Button
										colorScheme="blue"
										leftIcon={<AddIcon/>}
										mx="auto"
										onClick={handleNewBasketCreation}
									>
										Create a new basket
									</Button>
								</Box>
							)
						}
					</portals.InPortal>
				) : <div/>
			}

			{
				calendarPortalNode ? (
					<portals.InPortal node={calendarPortalNode}>
						<BasketCalendar onEventClick={handleEventClick}/>
					</portals.InPortal>
				) : <div/>
			}

			{
				isUltrawide ? (
					<Box maxW="container.2xl">
						<Heading size="lg" mb={6}>
							<BasketsSelectAndEdit onCreateNewBasket={handleNewBasketCreation}/>
						</Heading>

						{
							contentPortalNode && (
								<portals.OutPortal node={contentPortalNode}/>
							)
						}

						<Box h={12}/>

						<Heading size="lg" mb={6}>
							Calendar Preview
						</Heading>

						{
							// Portals seem to break if more than one OutPortal renders with
							// the same node.
							calendarPortalNode && !calendarDisclosure.isOpen && (
								<portals.OutPortal node={calendarPortalNode}/>
							)
						}
					</Box>
				) : (
					<FloatingButton onOpen={onOpen}/>
				)
			}

			<Drawer isOpen={isOpen} placement="bottom" autoFocus={false} onClose={onClose}>
				<DrawerOverlay/>
				<DrawerContent>
					<HStack pr={4} spacing={6}>
						<Box paddingInline={6} py={4}>
							<BasketsSelectAndEdit onCreateNewBasket={handleNewBasketCreation}/>
						</Box>

						<Spacer/>

						<HStack>
							<Text>
								hold <Kbd>c</Kbd> to see
							</Text>

							<Button
								size="sm"
								isDisabled={!currentBasket}
								onClick={calendarDisclosure.onOpen}
							>
								your calendar
							</Button>
						</HStack>

						<DrawerCloseButton pos="relative" top="auto" insetEnd="revert"/>
					</HStack>

					<DrawerBody>
						{
							contentPortalNode && (
								<portals.OutPortal node={contentPortalNode}/>
							)
						}
					</DrawerBody>

					<DrawerFooter/>
				</DrawerContent>
			</Drawer>

			<Modal size="full" isOpen={calendarDisclosure.isOpen} onClose={calendarDisclosure.onClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Calendar</ModalHeader>
					<ModalCloseButton/>
					<ModalBody display="flex">
						<Box mx="auto">
							{
								calendarPortalNode && (
									<portals.OutPortal node={calendarPortalNode}/>
								)
							}
						</Box>
					</ModalBody>
				</ModalContent>
			</Modal>
		</BasketCalendarProvider>
	);
});

const BasketWithCalendarProvider = () => (
	<BasketCalendarProvider>
		<Basket/>
	</BasketCalendarProvider>
);

export default BasketWithCalendarProvider;
