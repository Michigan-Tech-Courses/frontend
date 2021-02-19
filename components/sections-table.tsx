import React, {useMemo} from 'react';
import {Table, Thead, Tbody, Tr, Th, Td, Tag, useBreakpointValue, TableProps} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import InstructorWithPopover from './instructor-with-popover';
import {ISectionFromAPI} from '../lib/types';
import getCreditsStr from '../lib/get-credits-str';
import {Schedule} from '../lib/rschedule';
import {DATE_DAY_CHAR_MAP} from '../lib/constants';

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
		occurences[0].dates.forEach(d => {
			days += DATE_DAY_CHAR_MAP[d.date.getDay()];

			const start = d.date;
			const end = d.end;

			time = `${padTime(start.getHours())}:${padTime(start.getMinutes())} ${start.getHours() >= 12 ? 'PM' : 'AM'} - ${padTime(end?.getHours() ?? 0)}:${padTime(end?.getMinutes() ?? 0)} ${end?.getHours() ?? 0 >= 12 ? 'PM' : 'AM'}`;
		});
	}

	return {days, time};
};

const TableBody = observer(({sections}: {sections: ISectionFromAPI[]}) => {
	return (
		<Tbody>
			{
				sections.slice().sort((a, b) => a.section.localeCompare(b.section)).map(section => (
					<Tr key={section.id}>
						<Td>{section.section}</Td>
						<Td>
							{
								section.instructors.length > 0 ?
									section.instructors.map(instructor => (
										<InstructorWithPopover id={instructor.id} key={instructor.id}/>
									)) :
									'🤷‍♂'
							}
						</Td>
						<Td>
							{useMemo(() => {
								const {days, time} = getFormattedTimeFromSchedule(section.time);

								if (time === '') {
									return '🤷‍♂';
								}

								return (
									<>
										<span style={{width: '3.5rem', display: 'inline-block'}}>{days}</span>
										<span>{time}</span>
									</>
								);
							}, [section.time])}
						</Td>
						<Td isNumeric>{section.crn}</Td>
						<Td isNumeric>{getCreditsStr(section.minCredits, section.maxCredits)}</Td>
						<Td isNumeric>{section.totalSeats}</Td>
						<Td isNumeric>{section.takenSeats}</Td>
						<Td isNumeric>
							<Tag colorScheme={section.availableSeats <= 0 ? 'red' : 'green'}>{section.availableSeats}</Tag>
						</Td>
					</Tr>
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
