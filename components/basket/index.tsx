import React, {useEffect} from 'react';
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
	useToast
} from '@chakra-ui/react';
import {useHotkeys} from 'react-hotkeys-hook';
import {observer} from 'mobx-react-lite';
import useStore from '../../lib/state-context';
import BasketContent from './content';
import FloatingButton from './floating-button';
import useTip from '../../lib/hooks/use-tip';

const Basket = () => {
	const toast = useToast();
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {basketState} = useStore();
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

	// Ensure drawer state is synced when window is resized
	useEffect(() => {
		if (isUltrawide && !wasPreviouslyUltrawide) {
			onClose();
		}
	}, [isUltrawide, wasPreviouslyUltrawide, onClose]);

	if (isUltrawide) {
		return (
			<BasketContent onClose={onClose}/>
		);
	}

	return (
		<>
			{/* Footer margin */}
			<Box h={12}/>

			<FloatingButton onOpen={onOpen}/>

			<Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
				<DrawerOverlay/>
				<DrawerContent>
					<DrawerCloseButton/>
					<DrawerHeader>
						{basketState.name}
					</DrawerHeader>

					<DrawerBody>
						<BasketContent onClose={onClose}/>
					</DrawerBody>

					<DrawerFooter/>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default observer(Basket);
