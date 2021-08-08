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
	usePrevious
} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from '../../lib/state-context';
import BasketContent from './content';
import FloatingButton from './floating-button';

const Basket = () => {
	const {onOpen, isOpen, onClose} = useDisclosure();
	const {basketState} = useStore();
	const isUltrawide = useBreakpointValue({base: false, '4xl': true});
	const wasPreviouslyUltrawide = usePrevious(isUltrawide);

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
