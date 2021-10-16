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
	useTimeout,
} from '@chakra-ui/react';
import * as portals from 'react-reverse-portal';
import {useHotkeys} from 'react-hotkeys-hook';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import useTip from 'src/lib/hooks/use-tip';
import useHeldKey from 'src/lib/hooks/use-held-key';
import {AddIcon} from '@chakra-ui/icons';
import BasketContent from './content';
import FloatingButton from './floating-button';
import BasketCalendar, {BasketCalendarProvider} from './calendar/calendar';
import {CalendarEvent} from './calendar/types';
import BasketsSelectAndEdit from './basket-select-and-edit';

const Basket = observer(() => {
	const toast = useToast();
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {allBasketsState, uiState, apiState} = useStore();
	const {currentBasket} = allBasketsState;
	const previousBasketSize = usePrevious(currentBasket?.numOfItems);

	const isUltrawide = useBreakpointValue({base: false, '4xl': true});
	const wasPreviouslyUltrawide = usePrevious(isUltrawide);

	const onShowBasketTip = useTip('Tap the floating bar at the bottom, then \'Create a new basket\' to enable the add-to-basket buttons on courses and sections.');

	useTimeout(() => {
		if (allBasketsState.baskets.length === 0) {
			onShowBasketTip();
		}
	}, 8 * 1000);

	const onShowUndoTip = useTip('You can use normal undo / redo keyboard shortcuts.');
	useEffect(() => {
		if (previousBasketSize && currentBasket?.numOfItems !== previousBasketSize) {
			onShowUndoTip();
		}
	}, [onShowUndoTip, currentBasket, previousBasketSize]);

	useHotkeys('ctrl+z, command+z', event => {
		event.preventDefault();

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
	useHotkeys('ctrl+shift+z, command+shift+z', event => {
		event.preventDefault();

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
		onClose();
		uiState.setSearchValue(`id:${event.section.id}`);
	}, [uiState, calendarDisclosure, onClose]);

	const handleNewBasketCreation = () => {
		if (apiState.selectedSemester) {
			const newBasket = allBasketsState.addBasket(apiState.selectedSemester);
			allBasketsState.setSelectedBasket(newBasket.id);
		}
	};

	// Can't render Portals on server because library relies on document.*
	const [canRenderPortals, setCanRenderPortals] = useState(false);
	useEffect(() => {
		setCanRenderPortals(true);
	}, []);

	const contentPortalNode = useMemo(() => {
		if (!canRenderPortals) {
			return null;
		}

		return portals.createHtmlPortalNode();
	}, [canRenderPortals]);

	const calendarPortalNode = useMemo(() => {
		if (!canRenderPortals) {
			return null;
		}

		return portals.createHtmlPortalNode();
	}, [canRenderPortals]);

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
										isDisabled={!apiState.hasDataForTrackedEndpoints}
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
						<Box mb={6}>
							<BasketsSelectAndEdit onCreateNewBasket={handleNewBasketCreation}/>
						</Box>

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
							// Portals break if more than one OutPortal renders with
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
					<HStack px={6} spacing={6}>
						<Box py={4}>
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
