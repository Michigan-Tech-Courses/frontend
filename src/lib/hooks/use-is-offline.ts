import {useState, useEffect} from 'react';

const isServer = typeof window === 'undefined';

const useIsOffline = () => {
	const [isOnline, setOnlineStatus] = useState(isServer ? true : window.navigator.onLine);

	useEffect(() => {
		if (isServer) {
			return;
		}

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
