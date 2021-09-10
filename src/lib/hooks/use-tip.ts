import {useCallback} from 'react';
import {useToast} from '@chakra-ui/react';
import useLocalStorage from 'react-use/lib/useLocalStorage';

const useTip = (tip: string) => {
	const isServer = typeof window === 'undefined';

	const toast = useToast();
	const [hasShown, setHasShown] = useLocalStorage(isServer ? '' : btoa(tip), false);

	const onShowTip = useCallback(() => {
		if (!hasShown) {
			toast({
				title: '✨ tip:',
				status: 'info',
				description: tip,
				isClosable: true,
				duration: 10_000,
			});
			setHasShown(true);
		}
	}, [hasShown, setHasShown, toast, tip]);

	return {
		onShowTip,
	};
};

export default useTip;
