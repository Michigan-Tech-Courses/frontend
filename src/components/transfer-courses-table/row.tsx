import React from 'react';
import {Td, Tr} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {ITransferCourseFromAPI} from 'src/lib/api-types';

const Row = ({course}: {course: ITransferCourseFromAPI}) => (
	<Tr>
		<Td>
			<span style={{width: '12ch', display: 'inline-block'}}>
				{course.fromSubject}<b>{course.fromCRSE}</b>
			</span>
		</Td>

		<Td>
			<span style={{width: '12ch', display: 'inline-block'}}>
				{course.toSubject}<b>{course.toCRSE}</b>
			</span>
		</Td>

		<Td whiteSpace="nowrap">
			{course.title}
		</Td>

		<Td whiteSpace="nowrap">
			{course.fromCollege}
		</Td>

		<Td>
			{course.fromCollegeState}
		</Td>

		<Td isNumeric>
			{course.toCredits}
		</Td>
	</Tr>
);

export default observer(Row);
