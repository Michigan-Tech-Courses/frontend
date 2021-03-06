import React from 'react';
import {useColorMode, IconButton} from '@chakra-ui/react';
import {SunIcon, MoonIcon} from '@chakra-ui/icons';

const ColorModeToggle = () => {
	const {colorMode, toggleColorMode} = useColorMode();

	return (
		<IconButton aria-label="Toggle color theme" onClick={toggleColorMode} variant="ghost" transition="none">
			{colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
		</IconButton>
	);
};

export default ColorModeToggle;
