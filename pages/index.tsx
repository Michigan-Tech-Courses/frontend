import React, {useCallback, useRef, useState, useEffect} from 'react';
import Head from 'next/head';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';
import ErrorToaster from '../components/error-toaster';
import useRevalidation from '../lib/use-revalidation';
import useStore from '../lib/state-context';

const HomePage = () => {
	const searchBarRef = useRef<HTMLDivElement | null>(null);
	const state = useStore();

	const [readyToRevalidate, setReadyToRevalidate] = useState(false);
	useRevalidation(readyToRevalidate, async () => state.apiState.revalidate());

	// Upon mount, fetch semesters and set default semester
	useEffect(() => {
		if (state.apiState.availableSemesters.length === 0) {
			void state.apiState.getSemesters().then(async () => {
				const semesters = state.apiState.sortedSemesters;

				if (semesters) {
					state.apiState.setSelectedSemester(semesters[semesters.length - 1]);
				}

				setReadyToRevalidate(true);
			});
		}
	}, []);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	return (
		<>
			<NextSeo
				title="MTU Courses | All Courses"
				description="A listing of courses and sections offered at Michigan Tech"
			/>
			<Head>
				<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/instructors`} as="fetch" crossOrigin="anonymous"/>
				<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/passfaildrop`} as="fetch" crossOrigin="anonymous"/>
				<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/semesters`} as="fetch" crossOrigin="anonymous"/>
			</Head>

			<VStack spacing={12}>
				<SearchBar innerRef={searchBarRef}/>

				<CoursesTable onScrollToTop={handleScrollToTop}/>
			</VStack>

			<ErrorToaster/>
		</>
	);
};

export default HomePage;
