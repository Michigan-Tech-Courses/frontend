import {useCallback} from 'react';
import {useToast, useBreakpointValue} from '@chakra-ui/react';
import {useLocalStorage} from 'react-use';

const useTip = (tip: string, tipSpecificToUltrawides?: string) => {
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
				duration: 10_000,
				position: 'bottom-right',
			});
			setHasShown(true);
		}
	}, [hasShown, setHasShown, toast, resolvedTip]);

	return onShowTip;
};

export default useTip;
