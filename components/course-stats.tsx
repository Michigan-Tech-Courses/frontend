import React from 'react';
import {Spacer, HStack, VStack, useDisclosure, Box, Stat, StatHelpText, StatLabel, StatNumber, Button, Collapse, StackProps} from '@chakra-ui/react';
import {CalendarIcon} from '@chakra-ui/icons';
import Chart from './chart';

const CourseStats = (props: StackProps) => {
	const {isOpen: isChartOpen, onToggle: onChartOpenToggle} = useDisclosure();

	return (
		<VStack {...props}>
			<HStack w="100%">
				<Stat>
					<StatLabel>avg. % of students who dropped</StatLabel>
					<StatNumber>5%</StatNumber>
					<StatHelpText>from Fall 2015 to Spring 2020</StatHelpText>
				</Stat>

				<Stat>
					<StatLabel>avg. % of students who failed</StatLabel>
					<StatNumber>2%</StatNumber>
					<StatHelpText>from Fall 2015 to Spring 2020</StatHelpText>
				</Stat>

				<Spacer/>

				<Button leftIcon={<CalendarIcon/>} colorScheme="brand" onClick={onChartOpenToggle} isActive={isChartOpen}>
					Details
				</Button>
			</HStack>

			<Collapse in={isChartOpen} animateOpacity style={{width: '100%'}}>
				<Box width="100%" height={80}>
					<Chart/>
				</Box>
			</Collapse>
		</VStack>
	);
};

export default CourseStats;
