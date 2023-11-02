import React from 'react';
import {useColorMode, IconButton} from '@chakra-ui/react';
import {SunIcon, MoonIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';

const ColorModeToggle = observer(() => {
	const {colorMode, toggleColorMode} = useColorMode();

	return (
		<IconButton aria-label='Toggle color theme' variant='ghost' transition='none' onClick={toggleColorMode}>
			{colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
		</IconButton>
	);
});

export default ColorModeToggle;
