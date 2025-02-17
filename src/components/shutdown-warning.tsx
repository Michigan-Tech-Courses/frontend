import {Button, AlertDialog, useDisclosure, AlertDialogOverlay, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import WrappedLink from './link';

export const ShutdownWarning = observer(() => {
	const {isOpen, onClose} = useDisclosure({defaultIsOpen: true});

	return (
		<AlertDialog
			isOpen={isOpen}
			onClose={onClose}
			leastDestructiveRef={undefined}
		>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
          Shutdown notice
					</AlertDialogHeader>

					<AlertDialogBody>
						<p style={{marginBottom: '1rem'}}>
            I will be shutting down this website at the end of April 2025. Data from previous semester will still be available, but no new data will be added.
						</p>
						<p style={{marginBottom: '1rem'}}>
            I emailed the Dean of the College of Computing a few months ago to see if they would be interested in taking over this website. He was aware that many students use this but seemed uninterested in running it.
						</p>
						<p>
            If you want Michigan Tech Courses to stay active, please email <WrappedLink href='mailto:deanofstudents@mtu.edu' display='inline-block'>deanofstudents@mtu.edu</WrappedLink> and ask that they reconsider. You can also reach me at <WrappedLink href='mailto:mtisom@mtu.edu' display='inline-block'>mtisom@mtu.edu</WrappedLink>.
						</p>
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button onClick={onClose}>
            ok :(
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
});
