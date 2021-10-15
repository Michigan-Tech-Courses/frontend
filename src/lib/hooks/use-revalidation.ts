import {useEffect, useMemo, useState} from 'react';
import pThrottle from 'p-throttle';
import {useCallbackRef, useInterval} from '@chakra-ui/react';
import useWindowFocus, {UseWindowFocusParameters} from './use-window-focus';

const useRevalidation = (doRevalidation: boolean, revalidate: () => Promise<void>, interval = 3000) => {
	const revalidateRef = useCallbackRef(revalidate);
	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(doRevalidation);

	const throttledRevalidation = useMemo(() => pThrottle({limit: 1, interval})(revalidateRef), [revalidateRef, interval]);

	const focusParameters: UseWindowFocusParameters = useMemo(() => ({
		onFocus: () => {
			setShouldRefetchAtInterval(true);
			void throttledRevalidation();
		},
		onBlur: () => {
			setShouldRefetchAtInterval(false);
		},
	}), [throttledRevalidation]);

	useWindowFocus(focusParameters);

	useEffect(() => {
		if (doRevalidation) {
			void throttledRevalidation();
			setShouldRefetchAtInterval(doRevalidation);
		}
	}, [doRevalidation, throttledRevalidation]);

	useInterval(
		async () => {
			void throttledRevalidation();
		},
		shouldRefetchAtInterval ? interval : null,
	);
};

export default useRevalidation;
