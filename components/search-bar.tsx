import React, {useEffect, useRef, useState} from 'react';
import {Input, Container, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {Search2Icon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useAPI from '../lib/api-state-context';
import {useDebounce} from '../lib/use-debounce';

const SearchBar = () => {
	const [value, setValue] = useState('');
	const debouncedValue = useDebounce(value, 150);
	const inputRef = useRef<HTMLInputElement>(null);

	const store = useAPI();

	// Autofocus
	useEffect(() => {
		if (store.hasCourseData) {
			inputRef.current?.focus();
		}
	}, [store.hasCourseData]);

	useEffect(() => {
		store.setSearchValue(debouncedValue);
	}, [store.setSearchValue, debouncedValue]);

	return (
		<Container>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>

				<Input
					ref={inputRef}
					placeholder="Start typing..."
					size="lg"
					autoFocus
					value={value}
					onChange={event => {
						setValue(event.target.value);
					}}
					aria-label="Search for courses or sections"
					disabled={!store.hasCourseData}
				/>
			</InputGroup>
		</Container>
	);
};

export default observer(SearchBar);
