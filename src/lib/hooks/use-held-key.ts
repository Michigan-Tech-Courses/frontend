import {useCallback, useEffect, useRef, useState} from 'react';

type TReturnType = [boolean, (event: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => void];

const useHeldKey = ({key, minDuration = 512, stopPropagation = true}: {key: string; minDuration?: number; stopPropagation?: boolean}): TReturnType => {
	const [triggered, setTriggered] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout>();

	const handleKeydown = useCallback((event: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === key) {
			if (stopPropagation) {
				event.stopPropagation();
				event.preventDefault();
			}

			if (!triggered && !timeoutRef.current) {
				timeoutRef.current = setTimeout(() => {
					setTriggered(true);
				}, minDuration);
			}
		}
	}, [triggered, key, minDuration, stopPropagation]);

	const handleKeyup = useCallback((event: KeyboardEvent) => {
		if (event.key === key) {
			event.stopPropagation();

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = undefined;
			}

			setTriggered(false);
		}
	}, [key]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('keyup', handleKeyup);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('keyup', handleKeyup);
		};
	}, [handleKeydown, handleKeyup]);

	return [triggered, handleKeydown];
};

export default useHeldKey;
