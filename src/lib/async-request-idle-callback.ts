import requestIdleCallbackGuard from './request-idle-callback-guard';

const asyncRequestIdleCallback = async (callback: () => Promise<void>, options?: IdleRequestOptions): Promise<void> => new Promise((resolve, reject) => {
	requestIdleCallbackGuard(async () => {
		try {
			await callback();
			resolve();
		} catch (error: unknown) {
			reject(error);
		}
	}, options);
});

export default asyncRequestIdleCallback;
