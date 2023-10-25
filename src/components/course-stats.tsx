import React, {useCallback, useState} from 'react';
import {Spacer, HStack, VStack, useDisclosure, Box, Stat, StatHelpText, StatLabel, StatNumber, Button, Collapse, type StackProps, useBreakpointValue} from '@chakra-ui/react';
import {CalendarIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import {type IPassFailDropRecord} from 'src/lib/api-types';
import {SEMESTER_DISPLAY_MAPPING} from 'src/lib/constants';
import Chart from './course-fail-drop-chart';

const SEMESTER_VALUES = {
	SPRING: 0.1,
	SUMMER: 0.2,
	FALL: 0.3,
};

const formatPercentage = (value: number) => `${(100 * value).toFixed(2)}%`;

const CourseStats = (props: StackProps & {data: IPassFailDropRecord[]}) => {
	const [shouldLoadChart, setShouldLoadChart] = useState(false);
	const {isOpen: isChartOpen, onToggle: onChartOpenToggle} = useDisclosure();
	const statSize = useBreakpointValue({base: 'sm', md: 'md'});

	const sortedStats = props.data.slice().sort((a, b) => (a.year + SEMESTER_VALUES[a.semester]) - (b.year + SEMESTER_VALUES[b.semester]));

	const lastStat = sortedStats.at(-1);
	const rangeString = `between ${SEMESTER_DISPLAY_MAPPING[sortedStats[0].semester]} ${sortedStats[0].year} and ${SEMESTER_DISPLAY_MAPPING[lastStat.semester]} ${lastStat.year}`;

	let totalDropped = 0;
	let totalFailed = 0;
	// Avoid division by 0
	let totalStudents = 1;

	for (const stat of props.data) {
		totalDropped += stat.dropped;
		totalFailed += stat.failed;
		totalStudents += stat.total;
	}

	const handleChartButtonMouseOver = useCallback(() => {
		setShouldLoadChart(true);
	}, []);

	return (
		<VStack {...props}>
			<HStack w='100%'>
				<Stat size={statSize}>
					<StatLabel>dropped</StatLabel>
					<StatNumber>{formatPercentage(totalDropped / totalStudents)}</StatNumber>
					<StatHelpText>{rangeString}</StatHelpText>
				</Stat>

				<Stat size={statSize}>
					<StatLabel>failed</StatLabel>
					<StatNumber>{formatPercentage(totalFailed / totalStudents)}</StatNumber>
					<StatHelpText>{rangeString}</StatHelpText>
				</Stat>

				<Stat size={statSize}>
					<StatLabel>avg. class size</StatLabel>
					<StatNumber>{(totalStudents / props.data.length).toFixed(0)}</StatNumber>
					<StatHelpText>{rangeString}</StatHelpText>
				</Stat>

				<Spacer/>

				<Button leftIcon={<CalendarIcon/>} colorScheme='brand' isActive={isChartOpen} onClick={onChartOpenToggle} onMouseOver={handleChartButtonMouseOver}>
					Details
				</Button>
			</HStack>

			<Collapse animateOpacity in={isChartOpen} style={{width: '100%'}} unmountOnExit={!shouldLoadChart}>
				<Box width='100%' height={80}>
					<Chart data={sortedStats}/>
				</Box>
			</Collapse>
		</VStack>
	);
};

export default observer(CourseStats);
