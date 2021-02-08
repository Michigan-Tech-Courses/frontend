import React from 'react';
import {Spacer, HStack, VStack, useDisclosure, Box, Stat, StatHelpText, StatLabel, StatNumber, Button, Collapse, StackProps, useBreakpointValue} from '@chakra-ui/react';
import {CalendarIcon} from '@chakra-ui/icons';
import Chart from './course-fail-drop-chart';

const CourseStats = (props: StackProps) => {
	const {isOpen: isChartOpen, onToggle: onChartOpenToggle} = useDisclosure();
	const statSize = useBreakpointValue({base: 'sm', md: 'md'});

	return (
		<VStack {...props}>
			<HStack w="100%">
				<Stat size={statSize}>
					<StatLabel>dropped</StatLabel>
					<StatNumber>5%</StatNumber>
					<StatHelpText>between Fall 2015 and Spring 2020</StatHelpText>
				</Stat>

				<Stat size={statSize}>
					<StatLabel>failed</StatLabel>
					<StatNumber>2%</StatNumber>
					<StatHelpText>from Fall 2015 to Spring 2020</StatHelpText>
				</Stat>

				<Stat size={statSize}>
					<StatLabel>avg. class size</StatLabel>
					<StatNumber>62</StatNumber>
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
