import React from 'react';
import {ChakraProvider} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';

const Wrapper = observer(({children}: {children: React.ReactElement}) => (
	<ChakraProvider>
		{children}
	</ChakraProvider>
));

export default Wrapper;
