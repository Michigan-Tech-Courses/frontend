import {useCallback, useEffect, useMemo, useState} from 'react';
import pThrottle from 'p-throttle';
import useInterval from './use-interval';
import useWindowFocus from './use-window-focus';

const useRevalidation = (revalidate: () => Promise<void>) => {
	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(true);

	const throttle = useMemo(() => pThrottle({limit: 1, interval: 1000}), []);

	useWindowFocus({
		onFocus: useCallback(() => {
			setShouldRefetchAtInterval(true);
			throttle(async () => revalidate());
		}, [revalidate]),
		onBlur: useCallback(() => {
			setShouldRefetchAtInterval(false);
		}, [])
	});

	useEffect(() => {
		// Called once upon mount
		throttle(async () => revalidate());
	}, []);

	useInterval(
		async () => {
			throttle(async () => revalidate());
		},
		shouldRefetchAtInterval ? 3000 : null
	);
};

export default useRevalidation;
