import {useToast} from '@chakra-ui/toast';
import {useCallback} from 'react';
import {useLocalStorage} from 'react-use';

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
				duration: 10000
			});
			setHasShown(true);
		}
	}, [hasShown, setHasShown, toast, tip]);

	return {
		onShowTip
	};
};

export default useTip;
