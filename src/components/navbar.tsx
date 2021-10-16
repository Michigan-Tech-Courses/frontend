import React, {useState, useCallback} from 'react';
import {Flex, Box, Select, IconButton, HStack} from '@chakra-ui/react';
import {CloseIcon, HamburgerIcon} from '@chakra-ui/icons';
import {useRouter} from 'next/router';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import Logo from 'public/images/logo.svg';
import {SEMESTER_DISPLAY_MAPPING} from 'src/lib/constants';
import {IPotentialFutureSemester} from 'src/lib/types';
import toTitleCase from 'src/lib/to-title-case';
import ColorModeToggle from './color-mode-toggle';
import Link from './link';

const PAGES = [
	{
		label: 'Courses',
		href: '/',
	},
	{
		label: 'Transfer Courses',
		href: '/transfer-courses',
	},
	{
		label: 'About',
		href: '/about',
	},
];

const getSemesterDisplayName = (semester: IPotentialFutureSemester) => {
	if (semester.isFuture) {
		return toTitleCase(`Future ${semester.semester.toLowerCase()} Semester`);
	}

	return `${SEMESTER_DISPLAY_MAPPING[semester.semester]} ${semester.year}`;
};

const PATHS_THAT_REQUIRE_SEMESTER_SELECTOR = new Set(['/', '/help/registration-script']);

const Navbar = () => {
	const router = useRouter();
	const store = useStore();
	const [isOpen, setIsOpen] = useState(false);
	const handleToggle = useCallback(() => {
		setIsOpen(o => !o);
	}, []);

	const handleSemesterSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
		store.apiState.setSelectedSemester(JSON.parse(event.target.value));
	}, [store]);

	const shouldShowSemesterSelector = PATHS_THAT_REQUIRE_SEMESTER_SELECTOR.has(router.pathname);

	return (
		<Flex align="center" justify="space-between" wrap="wrap" p={4} as="nav" mb={8}>
			<Box width="40px" height="40px" borderRadius="full" overflow="hidden" mr={5}>
				<Logo/>
			</Box>

			<Box display={{base: 'block', md: 'none'}} ml="auto" onClick={handleToggle}>
				<IconButton aria-label={isOpen ? 'Close navbar' : 'Open navbar'}>
					{isOpen ? <CloseIcon/> : <HamburgerIcon/>}
				</IconButton>
			</Box>

			<Box
				display={{base: isOpen ? 'block' : 'none', md: 'flex'}}
				width={{base: 'full', md: 'auto'}}
				alignItems="center"
				flexGrow={1}
			>
				{
					PAGES.map(page => (
						<Link
							key={page.href}
							href={page.href}
							display="block"
							mr={6}
							mt={{base: 4, md: 0}}
							color="inherit"
						>
							{page.label}
						</Link>
					))
				}
			</Box>

			<HStack
				display={{base: isOpen ? 'flex' : 'none', md: 'flex'}}
				mt={{base: 4, md: 0}}
			>

				{
					shouldShowSemesterSelector && (
						<Select
							w="auto"
							variant="filled"
							aria-label="Select a semester to view"
							value={JSON.stringify(store.apiState.selectedSemester)}
							disabled={!(store.apiState.hasDataForTrackedEndpoints ?? false)}
							onChange={handleSemesterSelect}
						>
							{
								store.apiState.sortedSemesters.map(semester => (
									<option
										key={JSON.stringify(semester)}
										value={JSON.stringify(semester)}
									>
										{getSemesterDisplayName(semester)}
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
