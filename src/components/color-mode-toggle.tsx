import React from 'react';
import {useColorMode, IconButton} from '@chakra-ui/react';
import {SunIcon, MoonIcon} from '@chakra-ui/icons';

const ColorModeToggle = () => {
	const {colorMode, toggleColorMode} = useColorMode();

	return (
		<IconButton aria-label='Toggle color theme' variant='ghost' transition='none' onClick={toggleColorMode}>
			{colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
		</IconButton>
	);
};

export default ColorModeToggle;
