import {Dispatch, SetStateAction, useEffect, useState} from 'react';

const useEphemeralValue = <T>(defaultState: T, duration = 200): [T, Dispatch<SetStateAction<T>>] => {
	const [state, setState] = useState(defaultState);

	useEffect(() => {
		if (state !== defaultState) {
			const timerId = setTimeout(() => {
				setState(defaultState);
			}, duration);

			return () => {
				clearTimeout(timerId);
			};
		}
	}, [state, duration, defaultState]);

	return [state, setState];
};

export default useEphemeralValue;
