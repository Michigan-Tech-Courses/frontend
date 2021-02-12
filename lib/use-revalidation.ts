import {useCallback, useEffect, useState} from 'react';
import useInterval from './use-interval';
import useWindowFocus from './use-window-focus';

const useRevalidation = (revalidate: () => void) => {
	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(true);

	useWindowFocus({
		onFocus: useCallback(() => {
			setShouldRefetchAtInterval(true);
			revalidate();
		}, [revalidate]),
		onBlur: useCallback(() => {
			setShouldRefetchAtInterval(false);
		}, [])
	});

	useEffect(() => {
		// Called once upon mount
		revalidate();
	}, []);

	useInterval(
		async () => {
			revalidate();
		},
		shouldRefetchAtInterval ? 3000 : null
	);
};

export default useRevalidation;
