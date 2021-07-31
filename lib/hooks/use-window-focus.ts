import {useEffect} from 'react';

const useWindowFocus = ({onFocus, onBlur}: {onFocus: () => void; onBlur: () => void}) => {
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
