import React, {useEffect} from 'react';
import {Box, useColorModeValue, useMultiStyleConfig, usePrevious} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useEphemeralValue from 'src/lib/hooks/use-ephemeral-value';
import useStore from 'src/lib/state/context';

type FloatingButtonProps = {
	onOpen: () => void;
};

enum BasketSizeChange {
	NONE,
	ADDED,
	REMOVED,
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

const FloatingButton = (props: FloatingButtonProps) => {
	const [wasBasketSizeChanged, setWasBasketSizeChanged] = useEphemeralValue(BasketSizeChange.NONE);
	const styles = useMultiStyleConfig('Drawer', {placement: 'bottom'});
	const bgColor = useColorModeValue('gray.100', styles.dialog.bg as string);
	const {allBasketsState: {currentBasket}} = useStore();

	const previousBasketSize = usePrevious(currentBasket?.numOfItems);
	useEffect(() => {
		if (previousBasketSize === undefined || !currentBasket) {
			return;
		}

		if (currentBasket.numOfItems !== previousBasketSize) {
			if (currentBasket.numOfItems > previousBasketSize) {
				setWasBasketSizeChanged(BasketSizeChange.ADDED);
			} else {
				setWasBasketSizeChanged(BasketSizeChange.REMOVED);
			}
		}
	}, [currentBasket, currentBasket?.numOfItems, previousBasketSize, setWasBasketSizeChanged]);

	return (
		<Box
			display="flex"
			justifyContent="center"
			pos="fixed"
			bottom={0}
			left={0}
			w="full"
			// The container is invisible, so allow click-throughs
			pointerEvents="none"
		>
			<Box
				pointerEvents="all"
				p={4}
				title="Open basket"
				as="button"
				role="group"
				transitionProperty="common"
				transitionDuration="normal"
				transitionTimingFunction="ease-in-out"
				_hover={{
					bgColor,
					boxShadow: styles.dialog.boxShadow as string,
				}}
				w="sm"
				display="flex"
				justifyContent="center"
				roundedTop="md"
				onClick={props.onOpen}
			>
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
		</Box>
	);
};

export default observer(FloatingButton);
