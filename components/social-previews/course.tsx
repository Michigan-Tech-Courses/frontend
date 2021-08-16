import React from 'react';
import {Box, Text, VStack} from '@chakra-ui/react';
import HuskyIcon from '../../public/images/husky-icon.svg';

type Props = {
	title: string;
	semester: string;
};

const SocialPreviewCourse = ({title, semester}: Props) => (
	<Box
		bg="black"
		color="white"
		w="2048px"
		h="1170px"
		fontFamily="Georgia"
		d="flex"
		justifyContent="space-between"
		position="relative"
		p={12}
	>
		<VStack justifyContent="center" alignItems="flex-start" w="70%" position="relative" mr={12}>
			<Text
				w="full"
				fontWeight="bold"
				fontSize="8rem"
				textOverflow="ellipsis"
				overflow="hidden"
				noOfLines={2}
				mb="4rem"
			>
				{title}
			</Text>

		</VStack>

		<Box w="30%" d="flex" alignItems="center">
			<HuskyIcon/>
		</Box>

		<Text fontWeight="bold" fontSize="4rem" color="#8a8b8c" position="absolute" bottom={12} left={12}>
			{semester}
		</Text>
		<Text position="absolute" bottom={12} right={12} fontSize="4rem" color="#8a8b8c">michigantechcourses.com</Text>
	</Box>
);

export default SocialPreviewCourse;
