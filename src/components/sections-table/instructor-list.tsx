import React from 'react';
import {observer} from 'mobx-react-lite';
import {Wrap, WrapItem} from '@chakra-ui/react';
import {type IInstructorFromAPI} from 'src/lib/api-types';
import InstructorWithPopover from 'src/components/instructor-with-popover';

type InstructorListProps = {
	instructors: Array<{id: IInstructorFromAPI['id']}>;
	showAvatar?: boolean;
};

const InstructorList = observer(({instructors, showAvatar}: InstructorListProps) => (
	<Wrap w='full'>
		{
			instructors.length > 0
				? instructors.map(instructor => (
					<WrapItem key={instructor.id} maxW='full'>
						<InstructorWithPopover
							id={instructor.id}
							showName={instructors.length <= 1}
							showAvatar={showAvatar}/>
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
