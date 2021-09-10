import {useToken, useColorModeValue} from '@chakra-ui/react';

const useBackgroundColor = () => {
	const [lightBackground, darkBackground] = useToken('colors', ['white', 'gray.800']) as string[];

	return useColorModeValue(lightBackground, darkBackground);
};

export default useBackgroundColor;
