import React from 'react';
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	IconButton,
	Tooltip,
	Stack,
	HStack,
} from '@chakra-ui/react';
import {CheckIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import {BasketState} from 'src/lib/state/basket';
import {type IPotentialFutureTerm} from 'src/lib/types';
import toTitleCase from 'src/lib/to-title-case';
import {SEMESTER_DISPLAY_MAPPING} from 'src/lib/constants';
import BasketTable from '../table';
import {type BasketData} from '../export-options/link';

type ImportBasketProps = {
	basketData: BasketData;
	isOpen: boolean;
	onClose: () => void;
};

const ImportBasket = observer(({basketData, isOpen, onClose}: ImportBasketProps) => {
	const {allBasketsState} = useStore();
	const {apiState} = useStore();

	const partialBasket: Partial<BasketState> = {
		id: '0',
		name: basketData.name,
		forTerm: basketData.term,
		sectionIds: basketData.sections,
		courseIds: basketData.courses,
		searchQueries: basketData.searchQueries,
	};
	const getTermDisplayName = (term: IPotentialFutureTerm) => {
		if (term.isFuture) {
			return toTitleCase(`Future ${term.semester.toLowerCase()} Semester`);
		}

		return `${SEMESTER_DISPLAY_MAPPING[term.semester]} ${term.year}`;
	};

	const createdBasket = new BasketState(apiState, basketData.term, basketData.name, partialBasket);

	console.log(createdBasket);

	const importBasket = () => {
		const newBasket = allBasketsState.addBasket(basketData.term);

		newBasket.setName(basketData.name);

		for (const element of basketData.sections) {
			newBasket.addSection(element);
		}

		for (const element of basketData.courses) {
			newBasket.addCourse(element);
		}

		for (const element of basketData.searchQueries) {
			newBasket.addSearchQuery(element);
		}

		allBasketsState.setSelectedBasket(newBasket.id);

		apiState.setSelectedTerm(basketData.term);
		onClose();
	};

	return (
		<>
			{
				apiState.hasDataForTrackedEndpoints
			&& <Modal
				isOpen={isOpen}
				size='3xl'
				autoFocus={false}
				onClose={onClose}
			>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Import Basket - {createdBasket.name}</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<Stack spacing={4}>
							<text>
                        Term: {getTermDisplayName(createdBasket.forTerm)}
							</text>
							<BasketTable basket={createdBasket} isForCapture={true}/>
							<HStack w='full' justifyContent='end'>
								<Tooltip label='import basket'>
									<IconButton aria-label='copy link' icon={<CheckIcon />} onClick={() => {
										importBasket();
									}}/>
								</Tooltip>
							</HStack>
						</Stack>
					</ModalBody>
				</ModalContent>
			</Modal>
			}
		</>
	);
});

export default ImportBasket;
