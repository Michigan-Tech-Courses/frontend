import React, {useCallback, useEffect, useRef} from 'react';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import Head from 'next/head';
import useStore from '../lib/state-context';
import ErrorToaster from '../components/error-toaster';
import SearchBar from '../components/search-bar';
import TransferCoursesTable from '../components/transfer-courses-table';

const isFirstRender = typeof window === 'undefined';

const TransferCourses = () => {
	const store = useStore();
	const searchBarRef = useRef<HTMLDivElement | null>(null);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	const handleSearchChange = useCallback((newValue: string) => {
		store.transferCoursesState.setSearchValue(newValue);
	}, [store]);

	useEffect(() => {
		store.apiState.setRecurringFetchEndpoints(['transfer-courses']);

		return () => {
			store.apiState.setRecurringFetchEndpoints([]);
		};
	}, []);

	return (
		<>
			<NextSeo
				title="MTU Courses | Transfer Courses"
				description="A listing of courses that can transfer to Michigan Tech from other universities."
			/>

			<Head>
				{isFirstRender && (
					<>
						<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/transfer-courses`} as="fetch" crossOrigin="anonymous"/>
					</>
				)}
			</Head>

			<VStack spacing={12}>
				<SearchBar
					innerRef={searchBarRef}
					isEnabled={store.transferCoursesState.hasData}
					placeholder="Search by state, college, subject, or anything else..."
					value={store.transferCoursesState.searchValue}
					onChange={handleSearchChange}
				/>

				<TransferCoursesTable onScrollToTop={handleScrollToTop}/>
			</VStack>

			<ErrorToaster/>
		</>
	);
};

export default observer(TransferCourses);
