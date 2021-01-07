import React, {useState} from 'react';
import SearchBar from '../components/search-bar';

const HomePage = () => {
	const [searchValue, setSearchValue] = useState('');
	return (
		<div>
			<SearchBar value={searchValue} onChange={setSearchValue}/>
		</div>
	);
};

export default HomePage;
