import React from 'react';
import {
	HStack,
	Button,
	Text,
	Box,
	IconButton,
} from '@chakra-ui/react';
import {ChevronLeftIcon, ChevronRightIcon} from '@chakra-ui/icons';
import type useCalendar from '@veccu/react-calendar';

type CalendarToolbarProps = {
	label: string;
	navigation: ReturnType<typeof useCalendar>['navigation'];
	view: ReturnType<typeof useCalendar>['view'];
};

const CalendarToolbar = (props: CalendarToolbarProps) => (
	<HStack spacing={0} mb={4}>
		<Box
			flex={1}
			flexBasis={0}
			display='flex'
			justifyContent='flex-start'
			pos='relative'
		>
			<Button
				roundedRight={0}
				zIndex={2}
				isActive={props.view.isMonthView}
				onClick={props.view.showMonthView}
			>
				Month
			</Button>

			<Button
				roundedLeft={0}
				isActive={props.view.isWeekView}
				onClick={props.view.showWeekView}
			>
				Week
			</Button>
		</Box>

		<Text fontWeight='bold'>
			{props.label}
		</Text>

		<Box
			flex={1}
			flexBasis={0}
			display='flex'
			justifyContent='flex-end'
			pos='relative'
		>
			<IconButton
				aria-label='previous'
				icon={<ChevronLeftIcon/>}
				roundedRight={0}
				zIndex={2}
				onClick={props.navigation.toPrev}/>
			<Button rounded={0} onClick={props.navigation.setToday}>
				Today
			</Button>

			<IconButton
				aria-label='next'
				icon={<ChevronRightIcon/>}
				roundedLeft={0}
				zIndex={2}
				onClick={props.navigation.toNext}/>
		</Box>
	</HStack>
);

export default CalendarToolbar;
