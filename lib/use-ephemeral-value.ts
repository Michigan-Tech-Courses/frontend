import {Dispatch, SetStateAction, useEffect, useState} from 'react';

const useEphemeralValue = <T>(defaultState: T): [T, Dispatch<SetStateAction<T>>] => {
	const [state, setState] = useState(defaultState);

	useEffect(() => {
		if (state !== defaultState) {
			const timerId = setTimeout(() => {
				setState(defaultState);
			}, 200);

			return () => {
				clearTimeout(timerId);
			};
		}
	}, [state]);

	return [state, setState];
};

export default useEphemeralValue;
