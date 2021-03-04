import React, {useEffect, useRef} from 'react';
import {NextSeo} from 'next-seo';
import {useToast, VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/state-context';

const HomePage = () => {
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

	return (
		<>
			<NextSeo
				title="MTU Courses | All Courses"
				description="A listing of courses and sections offered at Michigan Tech"
			/>

			<VStack spacing={12}>
				<SearchBar/>

				<CoursesTable/>
			</VStack>
		</>
	);
};

export default observer(HomePage);
