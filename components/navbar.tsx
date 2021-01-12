import React from 'react';
import {HStack, Select, Spacer} from '@chakra-ui/react';
import ColorModeToggle from './color-mode-toggle';
import Link from './link';

const Navbar = () => {
	return (
		<HStack w="100%" p="1rem" as="nav">
			<Link href="/" mr="1rem">Michigan Tech Courses</Link>

			<Link href="/transfer">Transfer Courses</Link>

			<Spacer/>

			<Select w="auto" variant="filled" aria-label="Select a semester to view">
				<option>Fall 2020</option>
			</Select>

			<ColorModeToggle/>
		</HStack>
	);
};

export default Navbar;
