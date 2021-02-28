import React from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, TableProps, Wrap, WrapItem} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {IInstructorFromAPI, ISectionFromAPI} from '../lib/types';
import getCreditsStr from '../lib/get-credits-str';
import {Schedule} from '../lib/rschedule';
import {DATE_DAY_CHAR_MAP} from '../lib/constants';
import InstructorWithPopover from './instructor-with-popover';

interface ISectionsTableProps {
	sections: ISectionFromAPI[];
}

const padTime = (v: number) => v.toString().padStart(2, '0');

const getFormattedTimeFromSchedule = (jsonSchedule: Record<string, unknown>) => {
	const schedule = Schedule.fromJSON(jsonSchedule as any);

	let days = '';
	let time = '';

	const occurences = schedule.collections({granularity: 'week', weekStart: 'SU'}).toArray();

	if (occurences.length > 0) {
		for (const d of occurences[0].dates) {
			days += DATE_DAY_CHAR_MAP[d.date.getDay()];

			const start = d.date;
			const end = d.end;

			time = `${padTime(start.getHours())}:${padTime(start.getMinutes())} ${start.getHours() >= 12 ? 'PM' : 'AM'} - ${padTime(end?.getHours() ?? 0)}:${padTime(end?.getMinutes() ?? 0)} ${end?.getHours() ?? 0 >= 12 ? 'PM' : 'AM'}`;
		}
	}

	return {days, time};
};

const InstructorList = observer(({instructors}: {instructors: Array<{id: IInstructorFromAPI['id']}>}) => (
	<Wrap>
		{
			instructors.length > 0 ?
				instructors.map(instructor => (
					<WrapItem key={instructor.id}>
						<InstructorWithPopover id={instructor.id} showName={instructors.length <= 1}/>
					</WrapItem>
				)) : (
					<WrapItem>
											🤷‍♂
					</WrapItem>
				)
		}
	</Wrap>
));

const TimeDisplay = observer(({schedule}: {schedule: Record<string, unknown>}) => {
	const {days, time} = getFormattedTimeFromSchedule(schedule);

	if (time === '') {
		return <>🤷‍♂</>;
	}

	return (
		<>
			<span style={{width: '4ch', display: 'inline-block', marginRight: '0.25rem'}}>{days}</span>
			<span>{time}</span>
		</>
	);
});

const Row = observer(({section}: {section: ISectionFromAPI}) => {
	const creditsString = getCreditsStr(section.minCredits, section.maxCredits);

	return (
		<Tr key={section.id}>
			<Td minW="4ch">{section.section}</Td>
			<Td w="100rem">
				<InstructorList instructors={section.instructors}/>
			</Td>
			<Td minW="25ch">
				<TimeDisplay schedule={section.time}/>
			</Td>
			<Td isNumeric>{section.crn}</Td>
			<Td isNumeric>{creditsString}</Td>
			<Td isNumeric>{section.totalSeats}</Td>
			<Td isNumeric>{section.takenSeats}</Td>
			<Td isNumeric>
				<Tag colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>{section.availableSeats}</Tag>
			</Td>
		</Tr>
	);
});

const TableBody = observer(({sections}: {sections: ISectionFromAPI[]}) => {
	return (
		<Tbody>
			{
				sections.map(s => (
					<Row key={s.id} section={s}/>
				))
			}
		</Tbody>
	);
});

const SectionsTable = ({sections, ...props}: TableProps & ISectionsTableProps) => {
	const tableSize = useBreakpointValue({base: 'sm', lg: 'md'});

	return (
		<Table size={tableSize} variant="simple" {...props}>
			<Thead>
				<Tr>
					<Th>Section</Th>
					<Th>Instructors</Th>
					<Th>Schedule</Th>
					<Th isNumeric>CRN</Th>
					<Th isNumeric>Credits</Th>
					<Th isNumeric>Capacity</Th>
					<Th isNumeric>Seats Taken</Th>
					<Th isNumeric>Seats Available</Th>
				</Tr>
			</Thead>

			<TableBody sections={sections}/>
		</Table>
	);
};

export default observer(SectionsTable);
