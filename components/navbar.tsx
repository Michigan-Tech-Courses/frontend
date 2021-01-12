import React, {useState, useCallback} from 'react';
import {Flex, Box, Select, IconButton, Heading, HStack} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon} from '@chakra-ui/icons';
import ColorModeToggle from './color-mode-toggle';
import Link from './link';

const PAGES = [
	{
		label: 'Courses',
		href: '/'
	},
	{
		label: 'Transfer Courses',
		href: '/transfer'
	}
];

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const handleToggle = useCallback(() => {
		setIsOpen(o => !o);
	}, []);

	return (
		<Flex align="center" justify="space-between" wrap="wrap" p="1rem" as="nav" mb={8}>
			<Flex align="center" mr={5}>
				<Heading as="h1" size="lg">
          Courses @ Tech
				</Heading>
			</Flex>

			<Box display={{base: 'block', md: 'none'}} onClick={handleToggle} ml="auto">
				<IconButton aria-label={isOpen ? 'Close navbar' : 'Open navbar'}>
					{isOpen ? <CloseIcon/> : <HamburgerIcon/>}
				</IconButton>
			</Box>

			<Box
				display={{base: isOpen ? 'block' : 'none', md: 'flex'}}
				width={{base: 'full', md: 'auto'}}
				alignItems="center"
				flexGrow={1}>
				{
					PAGES.map(page => (
						<Link key={page.href} href={page.href} display="block" mr={6} mt={{base: 4, md: 0}}>{page.label}</Link>
					))
				}
			</Box>

			<HStack
				display={{base: isOpen ? 'flex' : 'none', md: 'flex'}}
				mt={{base: 4, md: 0}}
			>
				<Select w="auto" variant="filled" aria-label="Select a semester to view">
					<option>Fall 2020</option>
				</Select>

				<ColorModeToggle/>

			</HStack>
		</Flex>
	);
};

export default Navbar;
