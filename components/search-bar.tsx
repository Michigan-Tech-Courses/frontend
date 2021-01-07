import React, {useCallback} from 'react';
import {Input, Container, InputGroup, InputLeftElement} from '@chakra-ui/react';
import {Search2Icon} from '@chakra-ui/icons';

interface ISearchBarProps {
	value: string;
	onChange: (newValue: string) => void;
}

const SearchBar = ({value, onChange}: ISearchBarProps) => {
	const bubbleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	}, [onChange]);

	return (
		<Container>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>
				<Input placeholder="Start typing..." size="lg" focusBorderColor="blue.400" value={value} onChange={bubbleChange}/>
			</InputGroup>
		</Container>
	);
};

export default SearchBar;
