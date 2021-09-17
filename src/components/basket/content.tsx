import React from 'react';
import {
	HStack,
	Spacer,
	VStack,
	Text,
	useBreakpointValue,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	Box,
} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import useScreenSize from 'src/lib/hooks/use-screen-size';
import useStore from 'src/lib/state/context';
import BasketTable from './table';

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

			{
				basketState.warnings.length > 0 && (
					<Alert status="warning" rounded="md">
						<AlertIcon/>
						<Box flex="1">
							<AlertTitle>Warning:</AlertTitle>
							<AlertDescription display="block">
								{basketState.warnings.map(warning => (
									<div key={warning}>{warning}</div>
								))}
							</AlertDescription>
						</Box>
					</Alert>
				)
			}

			<HStack w="full">
				<Text
					display={(totalScreenWidth >= ULTRAWIDE_BREAKPOINT_IN_PX) && !isCurrentlyUltrawide ? 'block' : 'none'}
				>
					✨ tip: looks like you have a really wide screen - make this window bigger to always see your basket
				</Text>

				<Spacer/>

				{
					basketState.numOfItems !== 0 && (
						<ExportOptions/>
					)
				}
			</HStack>
		</VStack>
	);
};

export default observer(BasketContent);
