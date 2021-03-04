import React, {useState, useCallback} from 'react';
import {Flex, Box, Select, IconButton, HStack} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon} from '@chakra-ui/icons';
import {useRouter} from 'next/router';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/state-context';
import ColorModeToggle from './color-mode-toggle';
import Logo from '../public/images/logo.svg';
import Link from './link';
import {SEMESTER_DISPLAY_MAPPING} from '../lib/constants';

const PAGES = [
	{
		label: 'Courses',
		href: '/'
	},
	{
		label: 'About',
		href: '/about'
	}
];

const Navbar = () => {
	const router = useRouter();
	const store = useAPI();
	const [isOpen, setIsOpen] = useState(false);
	const handleToggle = useCallback(() => {
		setIsOpen(o => !o);
	}, []);

	const handleSemesterSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		store.apiState.setSelectedSemester(JSON.parse(event.target.value));
		await store.apiState.revalidate();
	}, [store]);

	return (
		<Flex align="center" justify="space-between" wrap="wrap" p={4} as="nav" mb={8}>
			<Box width="40px" height="40px" borderRadius="full" overflow="hidden" mr={5}>
				<Logo/>
			</Box>

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

				{
					router.pathname === '/' && (
						<Select
							w="auto"
							variant="filled"
							aria-label="Select a semester to view"
							onChange={handleSemesterSelect}
							value={JSON.stringify(store.apiState.selectedSemester)}
							disabled={!(store.apiState.hasCourseData ?? false)}
						>
							{
								store.apiState.sortedSemesters.map(semester => (
									<option
										defaultChecked={store.apiState.selectedSemester?.semester === semester.semester && store.apiState.selectedSemester.year === semester.year}
										value={JSON.stringify(semester)}
										key={JSON.stringify(semester)}
									>
										{SEMESTER_DISPLAY_MAPPING[semester.semester]} {semester.year}
									</option>
								))
							}
						</Select>
					)
				}

				<ColorModeToggle/>
			</HStack>
		</Flex>
	);
};

export default observer(Navbar);
