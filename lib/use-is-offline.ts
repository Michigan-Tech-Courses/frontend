import {useState, useEffect} from 'react';

const useIsOffline = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const [isOnline, setOnlineStatus] = useState(window.navigator.onLine);

	useEffect(() => {
		const toggleOnlineStatus = () => {
			setOnlineStatus(window.navigator.onLine);
		};

		window.addEventListener('online', toggleOnlineStatus);
		window.addEventListener('offline', toggleOnlineStatus);

		return () => {
			window.removeEventListener('online', toggleOnlineStatus);
			window.removeEventListener('offline', toggleOnlineStatus);
		};
	}, [isOnline]);

	return !isOnline;
};

export default useIsOffline;
