import React from 'react';
import {
	Avatar,
	Button,
	PopoverContent,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverTrigger,
	Text,
	Divider,
	VStack,
	HStack,
	Spacer,
} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {type IInstructorFromAPI} from 'src/lib/api-types';
import useStore from 'src/lib/state/context';
import rmpIdToURL from 'src/lib/rmp-id-to-url';
import {EmailIcon, PhoneIcon} from '@chakra-ui/icons';
import Link from './link';

type IInstructorWithPopoverProps = {
	id: IInstructorFromAPI['id'];
	showName: boolean;
	showAvatar?: boolean;
};

const INSTRUCTORS_WITH_ALTERNATIVE_IMAGES = ['ureel'];

const InstructorWithPopover = observer((props: IInstructorWithPopoverProps) => {
	const {
		id,
		showName,
		showAvatar = true,
	} = props;

	const {apiState} = useStore();

	const instructor = apiState.instructorsById.get(id);

	if (!instructor) {
		return null;
	}

	const alternativeId = INSTRUCTORS_WITH_ALTERNATIVE_IMAGES.find(s => instructor.fullName.toLowerCase().includes(s));

	const alternativeImageUrl = alternativeId ? `/images/instructors/${alternativeId}.jpg` : null;

	return (
		<Popover isLazy>
			<PopoverTrigger>
				<Button
					variant='ghost'
					pl='0'
					pr={showName ? undefined : 0}
					roundedLeft='200px'
					roundedRight={showName ? 'sm' : '200px'}
					size='sm'
					maxW='min(40ch, 100%)'
				>
					{
						showAvatar && (
							<Avatar
								name={instructor.fullName}
								src={instructor.thumbnailURL ?? undefined}
								size='sm'
								mr={showName ? 2 : 0}/>
						)
					}

					{
						showName && (
							<Text overflow='hidden' textOverflow='ellipsis'>
								{instructor.fullName}
							</Text>
						)
					}
				</Button>
			</PopoverTrigger>

			<PopoverContent>
				<PopoverArrow/>
				<PopoverCloseButton/>

				<PopoverBody p={4}>
					<VStack align='flex-start' spacing={4}>
						<VStack w='100%' align='flex-start'>
							<HStack w='100%'>
								<Avatar name={instructor.fullName} src={alternativeImageUrl ?? (instructor.thumbnailURL ?? undefined)} size='lg'/>

								<VStack align='flex-start' flex={1} minW={0}>
									<Text fontSize='2xl' whiteSpace='normal'>{instructor.fullName}</Text>

									{
										instructor.departments.map(department => (
											<Text key={department} whiteSpace='normal'>{department}</Text>
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

									<VStack align='flex-start' w='100%'>
										{instructor.averageRating && (
											<HStack w='100%'>
												<Text>Average Rating:</Text>

												<Spacer/>

												<Text fontWeight='bold'>{Math.round(instructor.averageRating * 100)}%</Text>
											</HStack>
										)}

										{instructor.averageDifficultyRating && (
											<HStack w='100%'>
												<Text>Difficulty Rating:</Text>

												<Spacer/>

												<Text fontWeight='bold'>{Math.round(instructor.averageDifficultyRating * 100)}%</Text>
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
});

export default InstructorWithPopover;
