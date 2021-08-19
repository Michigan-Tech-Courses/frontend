import React from 'react';
import {HStack, Spacer, VStack, Text, useBreakpointValue} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import BasketTable from './table';
import useScreenSize from '../../lib/hooks/use-screen-size';
import useStore from '../../lib/state-context';
const ExportOptions = dynamic(async () => import('./export-options'));

const ULTRAWIDE_BREAKPOINT_IN_PX = 3072;

type BasketContentProps = {
	onClose: () => void;
};

const BasketContent = (props: BasketContentProps) => {
	const {width: totalScreenWidth} = useScreenSize();
	const isCurrentlyUltrawide = useBreakpointValue({base: false, '4xl': true});

	const {basketState} = useStore();

	return (
		<VStack spacing={4}>
			{
				basketState.numOfItems === 0 ? (
					<Text textAlign="center">
						There's nothing in your basket. Go add some courses!
					</Text>
				) : (
					<BasketTable onClose={props.onClose}/>
				)
			}

			<HStack w="full">
				<Text
					display={(totalScreenWidth >= ULTRAWIDE_BREAKPOINT_IN_PX) && !isCurrentlyUltrawide ? 'block' : 'none'}
				>
					✨ tip: looks like you have a really wide screen - make this window bigger to always see your basket
				</Text>

				<Spacer/>

				<ExportOptions/>
			</HStack>
		</VStack>
	);
};

export default observer(BasketContent);
