import {Td} from '@chakra-ui/react';
import {Tr} from '@chakra-ui/table';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {ITransferCourseFromAPI} from '../../lib/types';

const Row = ({course}: {course: ITransferCourseFromAPI}) => {
	return (
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
};

export default observer(Row);
