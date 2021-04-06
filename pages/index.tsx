import React, {useCallback, useRef, useEffect} from 'react';
import Head from 'next/head';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';
import ErrorToaster from '../components/error-toaster';
import useStore from '../lib/state-context';

const HomePage = () => {
	const store = useStore();
	const searchBarRef = useRef<HTMLDivElement | null>(null);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	useEffect(() => {
		store.apiState.singleFetchEndpoints = ['passfaildrop'];
		store.apiState.recurringFetchEndpoints = ['courses', 'instructors', 'sections'];

		return () => {
			store.apiState.singleFetchEndpoints = [];
			store.apiState.recurringFetchEndpoints = [];
		};
	}, []);

	return (
		<>
			<NextSeo
				title="MTU Courses | All Courses"
				description="A listing of courses and sections offered at Michigan Tech"
			/>
			<Head>
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
