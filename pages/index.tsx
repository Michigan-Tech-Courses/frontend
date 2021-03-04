import React, {useCallback, useEffect, useRef} from 'react';
import {NextSeo} from 'next-seo';
import {useToast, VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/state-context';

const ErrorObserver = observer(() => {
	const store = useAPI();
	const toast = useToast();
	const toastRef = useRef<React.ReactText | undefined>();

	useEffect(() => {
		if (store.apiState.errors.length > 0) {
			toastRef.current = toast({
				title: 'Error',
				description: 'There was an error fetching data.',
				status: 'error',
				duration: null,
				isClosable: false
			});
		} else if (toastRef.current) {
			toast.close(toastRef.current);
		}
	}, [store.apiState.errors.length]);

	return null;
});

const HomePage = () => {
	const searchBarRef = useRef<HTMLDivElement | null>(null);

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

			<VStack spacing={12}>
				<SearchBar innerRef={searchBarRef}/>

				<CoursesTable onScrollToTop={handleScrollToTop}/>
			</VStack>

			<ErrorObserver/>
		</>
	);
};

export default HomePage;
