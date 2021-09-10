import {useInterval} from '@chakra-ui/react';
import {useState} from 'react';

const useCurrentDate = (updateInterval = 1000) => {
	const [date, setDate] = useState(new Date());

	useInterval(() => {
		setDate(new Date());
	}, updateInterval);

	return date;
};

export default useCurrentDate;
