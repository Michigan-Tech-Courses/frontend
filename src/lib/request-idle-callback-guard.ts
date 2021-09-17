const requestIdleCallbackGuard: typeof requestIdleCallback = (callback, options) => {
	if (typeof requestIdleCallback === 'undefined') {
		(callback as () => void)();
		return 0;
	}

	return requestIdleCallback(callback, options);
};

export default requestIdleCallbackGuard;
