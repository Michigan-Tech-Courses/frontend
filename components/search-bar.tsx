import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Input, Container, InputGroup, InputLeftElement, Text, Kbd, Button, HStack, IconButton, Box, Tooltip, Fade} from '@chakra-ui/react';
import {Modal, ModalOverlay} from '@chakra-ui/modal';
import {CloseIcon, DeleteIcon, Search2Icon, StarIcon} from '@chakra-ui/icons';
import useHeldKey from '../lib/hooks/use-held-key';

type SearchBarProps = {
	innerRef: React.Ref<HTMLDivElement>;
	children?: React.ReactElement;
	placeholder: string;
	isEnabled: boolean;
	onChange: (newValue: string) => void;
	value: string;
	onQuerySaveOrDelete?: () => void;
	isQuerySaved?: boolean;
};

const SearchBar = (props: SearchBarProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const [showHelp, setShowHelp] = useState(false);
	const [isKeyHeld, handleKeydown] = useHeldKey({key: '/'});

	// Autofocus
	useEffect(() => {
		if (props.isEnabled) {
			inputRef.current?.focus();
		}
	}, [props.isEnabled]);

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
		<Container ref={props.innerRef}>
			<InputGroup boxShadow="md" borderRadius="md" size="lg">
				<InputLeftElement
					pointerEvents="none"
					children={<Search2Icon color="gray.300" />}
				/>

				<Input
					ref={inputRef}
					placeholder={props.placeholder}
					size="lg"
					autoFocus
					value={props.value}
					onChange={event => {
						props.onChange(event.target.value);
					}}
					aria-label="Search for courses or sections"
					disabled={!props.isEnabled}
					onKeyDown={handleKeydown}
					pr={props.onQuerySaveOrDelete ? 20 : 12}
				/>

				<Box
					pos="absolute"
					display={'flex'}
					justifyContent="center"
					alignItems="center"
					height="full"
					right={4}
					zIndex={10}>
					<Fade in={props.value !== ''}>
						{
							props.onQuerySaveOrDelete && (
								<Tooltip label={props.isQuerySaved ? 'remove query from basket' : 'save query to basket'}>
									<IconButton
										colorScheme={props.isQuerySaved ? 'red' : 'purple'}
										icon={props.isQuerySaved ? <DeleteIcon/> : <StarIcon/>}
										aria-label={props.isQuerySaved ? 'Remove from basket' : 'Save to basket'}
										rounded="full"
										size="xs"
										mr={2}
										onClick={props.onQuerySaveOrDelete}
									/>
								</Tooltip>
							)
						}

						<IconButton
							icon={<CloseIcon/>}
							aria-label="Clear query"
							rounded="full"
							size="xs"
							onClick={() => {
								props.onChange('');
							}}/>
					</Fade>
				</Box>
			</InputGroup>

			{props.children && (
				<HStack mt={3} w="100%" justifyContent="center">
					<Text>
					hold <Kbd>/</Kbd> to see
					</Text>
					<Button size="sm" onClick={handleShowHelp}>available filters</Button>
				</HStack>
			)}

			<Modal isOpen={showHelp} onClose={handleModalClose} size="xl">
				<ModalOverlay/>
				{props.children}
			</Modal>
		</Container>
	);
};

export default SearchBar;
