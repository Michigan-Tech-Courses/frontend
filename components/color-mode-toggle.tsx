import React from 'react';
import {useColorMode, IconButton, Box} from '@chakra-ui/react';
import {SunIcon, MoonIcon} from '@chakra-ui/icons';

const ColorModeToggle = () => {
	const {colorMode, toggleColorMode} = useColorMode();

	return (
		<Box display="flex" p="1rem">
			<IconButton aria-label="Toggle color theme" onClick={toggleColorMode} ml="auto">
				{colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
			</IconButton>
		</Box>
	);
};

export default ColorModeToggle;
