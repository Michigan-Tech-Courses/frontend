const useScreenSize = () => {
	if (typeof window !== 'undefined') {
		const {width, height} = window.screen;

		return {width, height};
	}

	return {
		width: 0,
		height: 0
	};
};

export default useScreenSize;
