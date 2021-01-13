import React, {useState} from 'react';
import {VStack} from '@chakra-ui/react';
import SearchBar from '../components/search-bar';
import Table from '../components/table';

const HomePage = () => {
	const [searchValue, setSearchValue] = useState('');
	return (
		<VStack spacing={12}>
			<SearchBar value={searchValue} onChange={setSearchValue}/>

			<Table/>
		</VStack>
	);
};

export default HomePage;
