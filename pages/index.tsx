import React, {useState} from 'react';
import {NextSeo} from 'next-seo';
import {VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import Table from '../components/table';

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

				<Table isHighlighted={searchValue !== ''}/>
			</VStack>
		</>
	);
};

export default HomePage;
