import {useCallback, useEffect, useMemo, useState} from 'react';
import pThrottle from 'p-throttle';
import {useInterval} from '@chakra-ui/react';
import useWindowFocus from './use-window-focus';

const useRevalidation = (doRevalidation: boolean, revalidate: () => Promise<void>, interval = 3000) => {
	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(doRevalidation);

	const throttledRevalidation = useMemo(() => pThrottle({limit: 1, interval: 1000})(revalidate), [revalidate]);

	useWindowFocus({
		onFocus: useCallback(() => {
			setShouldRefetchAtInterval(true);
			void throttledRevalidation();
		}, [throttledRevalidation]),
		onBlur: useCallback(() => {
			setShouldRefetchAtInterval(false);
		}, [])
	});

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
		shouldRefetchAtInterval ? interval : null
	);
};

export default useRevalidation;
