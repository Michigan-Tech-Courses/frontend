import React from 'react';
import {observer} from 'mobx-react-lite';
import {Wrap, WrapItem} from '@chakra-ui/react';
import {IInstructorFromAPI} from '../../lib/types';
import InstructorWithPopover from '../instructor-with-popover';

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
						¯\_(ツ)_/¯
					</WrapItem>
				)
		}
	</Wrap>
));

export default InstructorList;
