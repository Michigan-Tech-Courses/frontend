import {useCallback, useEffect, useMemo, useState} from 'react';
import pThrottle from 'p-throttle';
import useInterval from './use-interval';
import useWindowFocus from './use-window-focus';

const useRevalidation = (doRevalidation: boolean, revalidate: () => Promise<void>) => {
	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(doRevalidation);

	const throttledRevalidation = useMemo(() => pThrottle({limit: 1, interval: 1000})(revalidate), [revalidate]);

	useWindowFocus({
		onFocus: useCallback(() => {
			setShouldRefetchAtInterval(true);
			void throttledRevalidation();
		}, [revalidate]),
		onBlur: useCallback(() => {
			setShouldRefetchAtInterval(false);
		}, [])
	});

	useEffect(() => {
		if (doRevalidation) {
			void throttledRevalidation();
			setShouldRefetchAtInterval(doRevalidation);
		}
	}, [doRevalidation]);

	useInterval(
		async () => {
			void throttledRevalidation();
		},
		shouldRefetchAtInterval ? 3000 : null
	);
};

export default useRevalidation;
