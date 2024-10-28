import React, {useEffect, useState} from 'react';
import Image from 'next/image';
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
import {observer} from 'mobx-react-lite';
import GooglePlay from 'public/images/google-play-button.png';

const MobileDeviceWarning = observer(() => {
	const {isOpen, onClose, onOpen} = useDisclosure();
	const [isAndroid, setIsAndroid] = useState(false);

	useEffect(() => {
		const browser = Bowser.getParser(window.navigator.userAgent);
		setIsAndroid(browser.parseOS().name === 'Android');

		if (browser.getPlatform().type !== 'desktop') {
			onOpen();
		}
	}, [onOpen]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Warning</ModalHeader>
				<ModalBody>
          This site is primarily made for laptop and desktop use. There's just
          too much information to effectively display it on mobile devices.
					{isAndroid && (
						<>
							<br />
							<br />
              Alternatively you can install the 3rd Party Michigan Tech Courses
              Mobile app for Android.
							<br />
							<br />
							<a
								href='https://play.google.com/store/apps/details?id=com.mtucoursesmobile.michigantechcourses'
								target='_blank'
								rel='noopener noreferrer'
							>
								<Image
									width={162}
									height={48}
									src={GooglePlay}
									alt='Google Play Logo'
								/>
							</a>
						</>
					)}
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='blue' variant='ghost' onClick={onClose}>
            I understand
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default MobileDeviceWarning;
