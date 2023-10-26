import React, {useCallback, useEffect, useRef} from 'react';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import Head from 'next/head';
import useStore from 'src/lib/state/context';
import ErrorToaster from 'src/components/error-toaster';
import DefaultSearchBar from 'src/components/search-bar/default';
import TransferCoursesTable from 'src/components/transfer-courses-table';

const isFirstRender = typeof window === 'undefined';

const TransferCourses = () => {
	const {transferCoursesState, apiState} = useStore();
	const searchBarRef = useRef<HTMLDivElement>(null);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	const handleSearchChange = useCallback((newValue: string) => {
		transferCoursesState.setSearchValue(newValue);
	}, [transferCoursesState]);

	useEffect(() => {
		apiState.setRecurringFetchEndpoints(['transfer-courses']);

		return () => {
			apiState.setRecurringFetchEndpoints([]);
		};
	}, [apiState]);

	return (
		<>
			<NextSeo
				title='MTU Courses | Transfer Courses'
				description='A listing of courses that can transfer to Michigan Tech from other universities.'
			/>

			<Head>
				{isFirstRender && (
					<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/transfer-courses`} as='fetch' crossOrigin='anonymous'/>
				)}
			</Head>

			<VStack spacing={12}>
				<DefaultSearchBar
					innerRef={searchBarRef}
					isEnabled={transferCoursesState.hasData}
					placeholder='Search by state, college, subject, or anything else...'
					value={transferCoursesState.searchValue}
					onChange={handleSearchChange}
				/>

				<TransferCoursesTable onScrollToTop={handleScrollToTop}/>
			</VStack>

			<ErrorToaster/>
		</>
	);
};

export default observer(TransferCourses);
