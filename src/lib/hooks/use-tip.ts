import {useCallback} from 'react';
import {useToast, useBreakpointValue} from '@chakra-ui/react';
import {useLocalStorage} from 'react-use';

type UseTipParameters = {
	tip: string;
	tipSpecificToUltrawides?: string;
	duration?: number | null;
};

const useTip = ({tip, tipSpecificToUltrawides, duration = 10_000}: UseTipParameters) => {
	const resolvedTip = useBreakpointValue({base: tip, '4xl': tipSpecificToUltrawides ?? tip}) ?? tip;
	const isServer = typeof window === 'undefined';

	const toast = useToast();
	const [hasShown, setHasShown] = useLocalStorage(isServer ? '' : btoa(resolvedTip), false);

	const onShowTip = useCallback(() => {
		if (!hasShown) {
			toast({
				title: '✨ tip:',
				status: 'info',
				description: resolvedTip,
				isClosable: true,
				duration,
				position: 'bottom-right',
			});
			setHasShown(true);
		}
	}, [hasShown, setHasShown, toast, resolvedTip]);

	return onShowTip;
};

export default useTip;
