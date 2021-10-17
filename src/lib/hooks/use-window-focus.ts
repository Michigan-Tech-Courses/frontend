import {useEffect} from 'react';

export type UseWindowFocusParameters = {
	onFocus: () => void;
	onBlur: () => void;
};

const useWindowFocus = ({onFocus, onBlur}: UseWindowFocusParameters) => {
	useEffect(() => {
		window.addEventListener('focus', onFocus);
		window.addEventListener('blur', onBlur);

		return () => {
			window.removeEventListener('focus', onFocus);
			window.removeEventListener('blur', onBlur);
		};
	}, [onFocus, onBlur]);
};

export default useWindowFocus;
