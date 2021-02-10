import React, {useState} from 'react';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';

const HomePage = () => {
	const [searchValue, setSearchValue] = useState('');
	return (
		<>
			<NextSeo
				title="All Courses at Michigan Tech"
				description="A listing of courses and sections offered at Michigan Tech"
			/>

			<VStack spacing={12}>
				<SearchBar value={searchValue} onChange={setSearchValue}/>

				<CoursesTable isHighlighted={searchValue !== ''}/>
			</VStack>
		</>
	);
};

export default HomePage;
