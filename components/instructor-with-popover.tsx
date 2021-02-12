import React from 'react';
import {Avatar, Button, PopoverContent, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverTrigger, Text, Divider, VStack, HStack, Spacer} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import Link from './link';
import StarRating from './star-rating';
import {IInstructorFromAPI} from '../lib/types';
import useAPI from '../lib/api-state-context';
import rmpIdToURL from '../lib/rmp-id-to-url';

interface IInstructorWithPopoverProps {
	id: IInstructorFromAPI['id'];
}

const InstructorWithPopover = (props: IInstructorWithPopoverProps) => {
	const store = useAPI();

	const instructor = store.instructorsById.get(props.id);

	if (!instructor) {
		return null;
	}

	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="ghost" pl="0" roundedLeft="200px" size="sm">
					<HStack>
						<Avatar name={instructor.fullName} src={instructor.thumbnailURL ?? undefined} size="sm"></Avatar>

						<Text>
							{instructor.fullName}
						</Text>
					</HStack>
				</Button>
			</PopoverTrigger>

			<PopoverContent>
				<PopoverArrow />
				<PopoverCloseButton />

				<PopoverBody p={4}>
					<VStack align="flex-start" spacing={4}>
						<VStack w="100%" align="flex-start">
							<HStack>
								<Avatar name={instructor.fullName} src={instructor.thumbnailURL ?? undefined} size="lg"/>

								<VStack align="flex-start">
									<Text fontSize="2xl">{instructor.fullName}</Text>

									{
										instructor.departments.map(department => (
											<Text key={department}>{department}</Text>
										))
									}
								</VStack>
							</HStack>
						</VStack>

						{
							instructor.rmpId && (
								<>
									<Divider/>

									<VStack align="flex-start">
										{instructor.averageRating && (
											<HStack w="100%">
												<Text>Average Rating:</Text>

												<Spacer/>

												<StarRating rating={instructor.averageRating}/>
											</HStack>
										)}

										{instructor.averageDifficultyRating && (
											<HStack w="100%">
												<Text>Difficulty Rating:</Text>

												<Spacer/>

												<StarRating rating={instructor.averageDifficultyRating}/>
											</HStack>
										)}

										{
											instructor.rmpId && (
												<Link href={rmpIdToURL(instructor.rmpId)}>RateMyProfessors</Link>
											)
										}
									</VStack>
								</>
							)
						}
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

export default observer(InstructorWithPopover);
