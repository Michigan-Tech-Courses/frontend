import React, {useEffect} from 'react';
import {NextSeo} from 'next-seo';
import useStore from '../lib/state-context';

const TransferCourses = () => {
	const store = useStore();
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
		</>
	);
};

export default TransferCourses;
