import React, {useState, useCallback} from 'react';
import {Flex, Box, Select, IconButton, Image, HStack} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/api-state-context';
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
	const store = useAPI();
	const [isOpen, setIsOpen] = useState(false);
	const handleToggle = useCallback(() => {
		setIsOpen(o => !o);
	}, []);

	const handleSemesterSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		store.setSelectedSemester(JSON.parse(event.target.value));
		await store.revalidate();
	}, [store]);

	return (
		<Flex align="center" justify="space-between" wrap="wrap" p={4} as="nav" mb={8}>
			<Image src="/images/logo.svg" borderRadius="full" boxSize="40px" mr={5} alt="Logo"/>

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
				<Select w="auto" variant="filled" aria-label="Select a semester to view" onChange={handleSemesterSelect} value={JSON.stringify(store.selectedSemester)}>
					{
						store.availableSemesters.map(semester => (
							<option
								defaultChecked={store.selectedSemester?.semester === semester.semester && store.selectedSemester.year === semester.year}
								value={JSON.stringify(semester)}
								key={JSON.stringify(semester)}
							>
								{semester.semester} {semester.year}
							</option>
						))
					}
				</Select>

				<ColorModeToggle/>

			</HStack>
		</Flex>
	);
};

export default observer(Navbar);
