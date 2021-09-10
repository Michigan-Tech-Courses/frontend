import React, {useEffect, useCallback} from 'react';
import {
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
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
	Heading
} from '@chakra-ui/react';
import {useHotkeys} from 'react-hotkeys-hook';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state-context';
import BasketContent from './content';
import FloatingButton from './floating-button';
import useTip from 'src/lib/hooks/use-tip';
import BasketCalendar, {BasketCalendarProvider} from './calendar/calendar';
import useHeldKey from 'src/lib/hooks/use-held-key';
import {CalendarEvent} from './calendar/types';

const Basket = observer(() => {
	const toast = useToast();
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {basketState, uiState} = useStore();
	const previousBasketSize = usePrevious(basketState.numOfItems);

	const isUltrawide = useBreakpointValue({base: false, '4xl': true});
	const wasPreviouslyUltrawide = usePrevious(isUltrawide);

	const {onShowTip} = useTip('You can use normal undo / redo keyboard shortcuts.');
	useEffect(() => {
		if (previousBasketSize && basketState.numOfItems !== previousBasketSize) {
			onShowTip();
		}
	}, [onShowTip, basketState.numOfItems, previousBasketSize]);

	useHotkeys('ctrl+z, command+z', () => {
		const stateDidChange = basketState.undoLastAction();

		if (!stateDidChange) {
			toast({
				title: 'Whoops',
				status: 'warning',
				description: 'Nothing to undo.',
				duration: 400
			});
		}
	}, [basketState, toast]);
	useHotkeys('ctrl+shift+z, command+shift+z', () => {
		const stateDidChange = basketState.redoLastAction();

		if (!stateDidChange) {
			toast({
				title: 'Whoops',
				status: 'warning',
				description: 'Nothing to redo.',
				duration: 400
			});
		}
	}, [basketState, toast]);

	const [isHeld] = useHeldKey({key: 'c'});
	const wasPreviouslyHeld = usePrevious(isHeld);
	const calendarDisclosure = useDisclosure();

	useEffect(() => {
		if (isHeld && !wasPreviouslyHeld) {
			calendarDisclosure.onToggle();
		}
	}, [calendarDisclosure, isHeld, wasPreviouslyHeld]);

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

	return (
		<BasketCalendarProvider>
			{
				isUltrawide ? (
					<Box maxW="container.2xl">
						<Heading size="lg" mb={6}>
							{basketState.name}
						</Heading>
						<BasketContent onClose={onClose}/>

						<Box h={12}/>

						<Heading size="lg" mb={6}>
							Calendar Preview
						</Heading>
						<BasketCalendar onEventClick={handleEventClick}/>
					</Box>
				) : (
					<FloatingButton onOpen={onOpen}/>
				)
			}

			<Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
				<DrawerOverlay/>
				<DrawerContent>
					<HStack pr={4} spacing={6}>
						<DrawerHeader>
							{basketState.name}
						</DrawerHeader>

						<Spacer/>

						<HStack>
							<Text>
								hold <Kbd>c</Kbd> to see
							</Text>

							<Button
								size="sm"
								onClick={calendarDisclosure.onOpen}
							>
								your calendar
							</Button>
						</HStack>

						<DrawerCloseButton pos="relative" top="auto" insetEnd="revert"/>
					</HStack>

					<DrawerBody>
						<BasketContent onClose={onClose}/>
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
							<BasketCalendar onEventClick={handleEventClick}/>
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
