import React from 'react';
import {Wrap, WrapItem, Avatar, Button, PopoverContent, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverTrigger, Text, Divider, VStack, HStack, Spacer} from '@chakra-ui/react';
import Link from './link';
import StarRating from './star-rating';

interface IInstructorWithPopoverProps {
	name: string;
	avatarUrl: string;
	averageDifficultyRating: number;
	averageRating: number;
	rateMyProfessorsUrl: string;
}

const InstructorWithPopover = (props: IInstructorWithPopoverProps) => {
	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="ghost">
					<Wrap align="center">
						<WrapItem>
							<Avatar name={props.name} src={props.avatarUrl} size="sm"></Avatar>
						</WrapItem>
						<WrapItem>
							{props.name}
						</WrapItem>
					</Wrap>
				</Button>
			</PopoverTrigger>

			<PopoverContent>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody>
					<VStack align="flex-start">
						<HStack>
							<Avatar name={props.name} src={props.avatarUrl} size="md"/>

							<VStack align="flex-start">
								<Text fontSize="2xl">{props.name}</Text>
								<Text>Computer Science</Text>
							</VStack>
						</HStack>

						<Divider/>

						<VStack>
							<HStack w="100%">
								<Text>Average Rating:</Text>

								<Spacer/>

								<StarRating rating={props.averageRating}/>
							</HStack>

							<HStack w="100%">
								<Text>Difficulty Rating:</Text>

								<Spacer/>

								<StarRating rating={props.averageRating}/>
							</HStack>
						</VStack>

						<Link href={props.rateMyProfessorsUrl}>RateMyProfessors</Link>
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

export default InstructorWithPopover;
