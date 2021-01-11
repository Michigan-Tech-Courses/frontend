import React, {useState} from 'react';
import SearchBar from '../components/search-bar';
import Table from '../components/table';

const HomePage = () => {
	const [searchValue, setSearchValue] = useState('');
	return (
		<div>
			<SearchBar value={searchValue} onChange={setSearchValue}/>

			<Table/>
		</div>
	);
};

export default HomePage;
