import React, {useEffect} from 'react';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
} from '@chakra-ui/react';
import Bowser from 'bowser';

const MobileDeviceWarning = () => {
	const {isOpen, onClose, onOpen} = useDisclosure();

	useEffect(() => {
		const browser = Bowser.getParser(window.navigator.userAgent);

		if (browser.getPlatform().type !== 'desktop') {
			onOpen();
		}
	}, [onOpen]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay/>
			<ModalContent>
				<ModalHeader>Warning</ModalHeader>
				<ModalBody>
					This site is primarily made for laptop and desktop use. There's just too much information to effectively display it on mobile devices.
				</ModalBody>

				<ModalFooter>
					<Button colorScheme="blue" variant="ghost" onClick={onClose}>
						I understand
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default MobileDeviceWarning;
