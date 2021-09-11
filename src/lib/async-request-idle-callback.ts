const asyncRequestIdleCallback = async (callback: () => Promise<void>, options?: IdleRequestOptions): Promise<void> => new Promise((resolve, reject) => {
	if (typeof requestIdleCallback === 'undefined') {
		callback().then(resolve).catch(reject);
	} else {
		requestIdleCallback(async () => {
			try {
				await callback();
				resolve();
			} catch (error: unknown) {
				reject(error);
			}
		}, options);
	}
});

export default asyncRequestIdleCallback;
