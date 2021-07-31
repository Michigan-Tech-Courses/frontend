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
	useMultiStyleConfig,
	useColorModeValue,
	useDisclosure,
	Text,
	usePrevious,
	VStack
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import {observer} from 'mobx-react-lite';
import useStore from '../../lib/state-context';

import useEphemeralValue from '../../lib/hooks/use-ephemeral-value';
import BasketTable from './table';
const ExportOptions = dynamic(async () => import('./export-options'));

enum BasketSizeChange {
	NONE,
	ADDED,
	REMOVED
}

const getBarColor = (forState: BasketSizeChange) => {
	switch (forState) {
		case BasketSizeChange.ADDED:
			return 'green.400';
		case BasketSizeChange.REMOVED:
			return 'red.400';
		default:
			return 'gray.300';
	}
};

const Basket = () => {
	const {onOpen, isOpen, onClose} = useDisclosure();

	const {basketState} = useStore();
	const previousBasketSize = usePrevious(basketState.numOfItems);
	const [wasBasketSizeChanged, setWasBasketSizeChanged] = useEphemeralValue(BasketSizeChange.NONE);

	const styles = useMultiStyleConfig('Drawer', {placement: 'bottom'});
	const bgColor = useColorModeValue('gray.100', styles.dialog.bg as string);

	useEffect(() => {
		if (previousBasketSize === undefined) {
			return;
		}

		if (basketState.numOfItems !== previousBasketSize) {
			if (basketState.numOfItems > previousBasketSize) {
				setWasBasketSizeChanged(BasketSizeChange.ADDED);
			} else {
				setWasBasketSizeChanged(BasketSizeChange.REMOVED);
			}
		}
	}, [basketState.numOfItems, previousBasketSize]);

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
						bgColor={getBarColor(wasBasketSizeChanged)}
						maxW={64}
						flex={1}
						transitionProperty="height, background-color"
						transitionDuration="300ms"
						transitionTimingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
						h={2}
						_groupHover={{h: 4}}/>
				</Box>

				<Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
					<DrawerOverlay/>
					<DrawerContent>
						<DrawerCloseButton/>
						<DrawerHeader>
							{basketState.name}
						</DrawerHeader>

						<VStack as={DrawerBody} spacing={4}>
							{
								basketState.numOfItems === 0 ? (
									<Text textAlign="center">
										There's nothing in your basket. Go add some courses!
									</Text>
								) : (
									<BasketTable onClose={onClose}/>
								)
							}

							<ExportOptions/>
						</VStack>

						<DrawerFooter/>
					</DrawerContent>
				</Drawer>
			</Box>
		</>
	);
};

export default observer(Basket);
