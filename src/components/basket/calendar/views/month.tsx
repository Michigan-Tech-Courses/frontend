import React from 'react';
import {
	HStack,
	Spacer,
	Text,
	Thead,
	Tr,
	Td,
	Th,
	Tbody,
	Box,
	VStack,
	useColorModeValue,
	Flex,
	Tooltip,
} from '@chakra-ui/react';
import {format} from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import type useCalendar from '@veccu/react-calendar';
import {type CalendarBodyWithEvents, type CalendarEvent} from 'src/components/basket/calendar/types';
import {observer} from 'mobx-react-lite';
import styles from './styles/month.module.scss';

type MonthViewProps = {
	body: CalendarBodyWithEvents;
	headers: ReturnType<typeof useCalendar>['headers'];
	onEventClick: (event: CalendarEvent) => void;
};

const MonthView = observer(({body, headers, onEventClick}: MonthViewProps) => {
	const borderColor = useColorModeValue('gray.100', 'gray.700');

	return (
		<>
			<Thead>
				<Tr>
					{headers.weekDays.map(({key, value}) => (
						<Th key={key} paddingInlineStart={4}>
							{format(value, 'E', {locale: enUS})}
						</Th>
					))}
				</Tr>
			</Thead>

			<Tbody className={styles.monthlyView}>
				{body.value.map(({key, value: days}) => (
					<Tr key={key}>
						{days.map(({key, value, isCurrentMonth, isCurrentDate, events}, i) => (
							<Td
								key={key}
								opacity={isCurrentMonth ? 1 : 0.3}
								pos='relative'
								borderLeftWidth='1px'
								borderLeftColor={borderColor}
								borderRightWidth={i === days.length - 1 ? '1px' : undefined}
								borderRightColor={borderColor}
							>
								<Flex
									fontSize='sm'
									justify='center'
									align='center'
									rounded='full'
									w='3ch'
									h='3ch'
									bgColor={isCurrentDate ? 'red.500' : 'transparent'}
									color={isCurrentDate ? 'white' : undefined}
									pos='absolute'
									top={2}
									left={2}
								>
									{format(value, 'dd')}
								</Flex>

								{
									events.length > 0 && (
										<VStack
											align='flex-start'
											pos='absolute'
											top={12}
											bottom={0}
											left={4}
											right={4}
											overflowY='auto'
										>
											{
												events.map(event => (
													<Tooltip key={event.key} label={event.label}>
														<HStack
															w='full'
															bgColor='yellow.200'
															rounded='md'
															px={2}
															py={1}
															color='black'
															fontSize='xs'
															as='button'
															onClick={() => {
																onEventClick(event);
															}}
														>
															<Box textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap'>
																{event.section.course.title}
															</Box>

															<Text whiteSpace='nowrap'>
																{format(event.start, 'hh:mm a')}
															</Text>
														</HStack>
													</Tooltip>
												))
											}
											<Spacer/>
										</VStack>
									)
								}
							</Td>
						))}
					</Tr>
				))}
			</Tbody>
		</>
	);
});

export default MonthView;
