import {useRef, useEffect} from 'react';
import {useToast} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import useIsOffline from 'src/lib/hooks/use-is-offline';

const ErrorToaster = observer(() => {
	const store = useStore();
	const toast = useToast();
	const toastRef = useRef<React.ReactText | undefined>();
	const isOffline = useIsOffline();

	useEffect(() => {
		if (isOffline) {
			if (toastRef.current) {
				toast.close(toastRef.current);
			}

			toastRef.current = toast({
				title: 'Warning',
				description: 'Looks like you\'re offline.',
				status: 'warning',
				duration: null,
				isClosable: false,
				position: 'bottom-right',
			});
			return;
		}

		if (store.apiState.errors.length > 0) {
			if (toastRef.current) {
				toast.close(toastRef.current);
			}

			toastRef.current = toast({
				title: 'Error',
				description: 'There was an error fetching data.',
				status: 'error',
				duration: null,
				isClosable: false,
				position: 'bottom-right',
			});
			return;
		}

		if (toastRef.current && !isOffline && store.apiState.errors.length === 0) {
			toast.close(toastRef.current);
			toastRef.current = undefined;
		}
	}, [store.apiState.errors.length, isOffline, toast]);

	return null;
});

export default ErrorToaster;
