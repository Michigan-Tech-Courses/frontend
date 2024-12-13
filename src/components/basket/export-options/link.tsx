import {Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	IconButton,
	useToast,
	Tooltip,
	Stack,
	HStack,
	Box,
} from '@chakra-ui/react';
import {CopyIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';
import {type IPotentialFutureTerm} from 'src/lib/types';
import Link from 'next/link';
import {useEffect} from 'react';

type ExportLinkProps = {
	isOpen: boolean;
	onClose: () => void;
};

export type BasketData = {
	term: IPotentialFutureTerm;
	name: string;
	sections: string[];
	courses: string[];
	searchQueries: string[];
};

const ExportLink = observer(({isOpen, onClose}: ExportLinkProps) => {
	const {allBasketsState: {currentBasket}} = useStore();
	const toast = useToast();
	let url = '';

	if (currentBasket) {
		const basketData: BasketData = {term: currentBasket.forTerm,
			name: currentBasket.name,
			sections: currentBasket.sections.map(element => element.id),
			courses: currentBasket.courses.map(element => element.id),
			searchQueries: currentBasket.searchQueries};

		// Get json data
		const jsonString: string = JSON.stringify(basketData);
		url = window.location.toString() + '?basket=' + encodeURIComponent(jsonString);
	}

	const handleLinkCopy = async () => {
		if (url.length > 0) {
			try {
				await navigator.clipboard.writeText(url);

				toast({
					title: 'Link Copied',
					status: 'success',
					duration: 500,
				});
			} catch (error) {
				console.error('Failed to copy link to clipboard:', error);
			}
		}
	};

	useEffect(() => {
		const copyOnOpen = async () => {
			if (isOpen) {
				await handleLinkCopy();
			}
		};

		void copyOnOpen();
	}, [isOpen]);

	return (
		<>
			<Modal
				isOpen={isOpen}
				size='3xl'
				autoFocus={false}
				onClose={onClose}
			>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Share Link</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<Stack spacing={4}>
							<Box overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
								<Link href={url}>
									{url}
								</Link>
							</Box>
							<HStack w='full' justifyContent='end'>
								<Tooltip label='copy link'>
									<IconButton aria-label='copy link' icon={<CopyIcon />} onClick={async () => {
										await handleLinkCopy();
									}}/>
								</Tooltip>
							</HStack>
						</Stack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
});

export default ExportLink;
