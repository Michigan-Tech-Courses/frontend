import React from 'react';
import {ChakraProvider} from '@chakra-ui/react';

const Wrapper = ({children}: {children: React.ReactElement}) => (
	<ChakraProvider>
		{children}
	</ChakraProvider>
);

export default Wrapper;
