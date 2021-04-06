import React, {useCallback, useEffect, useRef} from 'react';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import useStore from '../lib/state-context';
import ErrorToaster from '../components/error-toaster';
import SearchBar from '../components/search-bar';

const TransferCourses = () => {
	const store = useStore();
	const searchBarRef = useRef<HTMLDivElement | null>(null);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	useEffect(() => {
		store.apiState.recurringFetchEndpoints = ['transfer-courses'];

		return () => {
			store.apiState.recurringFetchEndpoints = [];
		};
	}, []);

	return (
		<>
			<NextSeo
				title="MTU Courses | Transfer Courses"
				description="A listing of courses that can transfer to Michigan Tech from other universities."
			/>

			<VStack spacing={12}>
				<SearchBar
					innerRef={searchBarRef}
					isEnabled={store.transferCoursesState.hasData}
					placeholder="Search by state, college, subject, or anything else..."/>

				{/* <CoursesTable onScrollToTop={handleScrollToTop}/> */}
			</VStack>

			<ErrorToaster/>
		</>
	);
};

export default observer(TransferCourses);
