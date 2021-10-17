import React from 'react';
import {Box, Text} from '@chakra-ui/react';

const InlineStat = ({label, number, help}: {label: string; number: string; help: string}) => (
	<Box>
		<Text as="span">{label}</Text>
		<Text as="span"> </Text>
		<Text as="b">{number}</Text>
		<Text as="span"> </Text>
		<Text as="span">{help}</Text>
	</Box>
);

export default InlineStat;
