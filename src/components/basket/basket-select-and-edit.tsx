import React, {useCallback, useEffect, useState} from 'react';
import {
	Button,
	Editable,
	EditableInput,
	HStack,
	IconButton,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Tooltip,
	useDisclosure,
	usePrevious,
} from '@chakra-ui/react';
import {DeleteIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import EditableControls from '../editable-controls';
import BasketSelector from './basket-selector';

type BasketsSelectAndEditProps = {
	onCreateNewBasket: () => void;
};

const BasketsSelectAndEdit = observer((props: BasketsSelectAndEditProps) => {
	const deleteBasketDisclosure = useDisclosure();
	const {allBasketsState} = useStore();
	const {currentBasket} = allBasketsState;

	const [basketName, setBasketName] = useState(currentBasket?.name ?? '');

	const previousName = usePrevious(currentBasket?.name);
	useEffect(() => {
		if (currentBasket && previousName !== currentBasket.name) {
			setBasketName(currentBasket.name);
		}
	}, [currentBasket, previousName]);

	const handleDelete = useCallback(() => {
		if (!currentBasket) {
			return;
		}

		allBasketsState.removeBasket(currentBasket.id);
		const termBaskets = allBasketsState.getBasketsFor(currentBasket.forTerm);
		if (termBaskets.length > 0) {
			allBasketsState.setSelectedBasket(termBaskets[0].id);
		}

		deleteBasketDisclosure.onClose();
	}, [allBasketsState, currentBasket, deleteBasketDisclosure]);

	if (!currentBasket) {
		return <>¯\_(ツ)_/¯</>;
	}

	return (
		<>
			<Editable
				submitOnBlur
				value={basketName}
				startWithEditView={false}
				as={HStack}
				alignItems='center'
				onChange={setBasketName}
				onSubmit={newName => {
					currentBasket.setName(newName.trim());
				}}
			>
				<BasketSelector onCreateNewBasket={props.onCreateNewBasket}/>
				<EditableInput/>

				<EditableControls/>

				<Tooltip label='delete basket'>
					<IconButton
						size='xs'
						icon={<DeleteIcon/>}
						colorScheme='red'
						aria-label='Delete basket'
						onClick={deleteBasketDisclosure.onOpen}/>
				</Tooltip>
			</Editable>

			<Modal isOpen={deleteBasketDisclosure.isOpen} onClose={deleteBasketDisclosure.onClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Confirm Deletion</ModalHeader>
					<ModalBody>
						Are you sure you want to delete this basket?
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' mr={3} onClick={deleteBasketDisclosure.onClose}>
							Cancel
						</Button>
						<Button variant='ghost' colorScheme='red' onClick={handleDelete}>
							Delete Basket
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
});

export default BasketsSelectAndEdit;
