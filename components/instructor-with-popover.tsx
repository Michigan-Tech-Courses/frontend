import React from 'react';
import {Avatar, Button, PopoverContent, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverTrigger, Text, Divider, VStack, HStack, Spacer} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import Link from './link';
import {IInstructorFromAPI} from '../lib/types';
import useAPI from '../lib/state-context';
import rmpIdToURL from '../lib/rmp-id-to-url';
import {EmailIcon, PhoneIcon} from '@chakra-ui/icons';

interface IInstructorWithPopoverProps {
	id: IInstructorFromAPI['id'];
	showName: boolean;
}

const InstructorWithPopover = (props: IInstructorWithPopoverProps) => {
	const store = useAPI();

	const instructor = store.apiState.instructorsById.get(props.id);

	if (!instructor) {
		return null;
	}

	return (
		<Popover isLazy>
			<PopoverTrigger>
				<Button variant="ghost" pl="0" roundedLeft="200px" size="sm" roundedRight={props.showName ? 'sm' : '200px'} pr={props.showName ? undefined : 0}>
					<HStack>
						<Avatar name={instructor.fullName} src={instructor.thumbnailURL ?? undefined} size="sm"/>

						{
							props.showName && (
								<Text>
									{instructor.fullName}
								</Text>
							)
						}
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
							instructor.email && (
								<HStack>
									<EmailIcon/>
									<Link href={`mailto:${instructor.email}`}>{instructor.email}</Link>
								</HStack>
							)
						}

						{
							instructor.phone && (
								<HStack>
									<PhoneIcon/>
									<Link href={`tel:${instructor.phone}`}>{instructor.phone}</Link>
								</HStack>
							)
						}

						{
							instructor.websiteURL && (
								<HStack>
									<Link href={instructor.websiteURL}>Website</Link>
								</HStack>
							)
						}

						{
							instructor.rmpId && (
								<>
									<Divider/>

									<VStack align="flex-start" w="100%">
										{instructor.averageRating && (
											<HStack w="100%">
												<Text>Average Rating:</Text>

												<Spacer/>

												<Text fontWeight="bold">{Math.round(instructor.averageRating * 100)}%</Text>
											</HStack>
										)}

										{instructor.averageDifficultyRating && (
											<HStack w="100%">
												<Text>Difficulty Rating:</Text>

												<Spacer/>

												<Text fontWeight="bold">{Math.round(instructor.averageDifficultyRating * 100)}%</Text>
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
