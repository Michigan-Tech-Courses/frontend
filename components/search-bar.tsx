import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Input, Container, InputGroup, InputLeftElement, Text, Kbd, Button, HStack} from '@chakra-ui/react';
import {Modal, ModalOverlay} from '@chakra-ui/modal';
import {Search2Icon} from '@chakra-ui/icons';
import useHeldKey from '../lib/use-held-key';

type Props = {
	innerRef: React.Ref<HTMLDivElement>;
	children?: React.ReactElement;
	placeholder: string;
	isEnabled: boolean;
	onChange: (newValue: string) => void;
	value: string;
};

const SearchBar = ({innerRef, children, placeholder, isEnabled, onChange, value}: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const [showHelp, setShowHelp] = useState(false);
	const [isKeyHeld, handleKeydown] = useHeldKey({key: '/'});

	// Autofocus
	useEffect(() => {
		if (isEnabled) {
			inputRef.current?.focus();
		}
	}, [isEnabled]);

	useEffect(() => {
		if (isKeyHeld) {
			setShowHelp(true);
		} else {
			setShowHelp(false);
		}
	}, [isKeyHeld]);

	const handleShowHelp = useCallback(() => {
		setShowHelp(true);
	}, []);

	const handleModalClose = useCallback(() => {
		setShowHelp(false);
	}, []);

	return (
		<Container ref={innerRef}>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>

				<Input
					ref={inputRef}
					placeholder={placeholder}
					size="lg"
					autoFocus
					value={value}
					onChange={event => {
						onChange(event.target.value);
					}}
					aria-label="Search for courses or sections"
					disabled={!isEnabled}
					onKeyDown={handleKeydown}
				/>
			</InputGroup>

			{children && (
				<HStack mt={3} w="100%" justifyContent="center">
					<Text>
					hold <Kbd>/</Kbd> to see
					</Text>
					<Button size="sm" onClick={handleShowHelp}>available filters</Button>
				</HStack>
			)}

			<Modal isOpen={showHelp} onClose={handleModalClose} size="xl">
				<ModalOverlay/>
				{children}
			</Modal>
		</Container>
	);
};

export default SearchBar;
