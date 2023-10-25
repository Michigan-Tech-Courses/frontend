import React, {useRef, useState, useMemo, useEffect} from 'react';
import {
	HStack,
	Spacer,
	Box,
	LightMode,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	IconButton,
	VStack,
	Text,
	Tooltip,
	Spinner,
} from '@chakra-ui/react';
import {CheckIcon, CopyIcon, DownloadIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import {captureToBlob} from 'src/lib/export-image';
import saveAs from 'src/lib/save-as';
import useEphemeralValue from 'src/lib/hooks/use-ephemeral-value';
import useStore from 'src/lib/state/context';
import WrappedLink from 'src/components/link';
import requestIdleCallbackGuard from 'src/lib/request-idle-callback-guard';
import BasketTable from '../table';

type ExportImageProps = {
	isOpen: boolean;
	onClose: () => void;
};

const ExportImage = ({isOpen, onClose}: ExportImageProps) => {
	const {allBasketsState: {currentBasket}, apiState} = useStore();
	const [hasCopied, setHasCopied] = useEphemeralValue(false, 500);
	const [blob, setBlob] = useState<Blob | undefined>(null);
	const [isLoading, setIsLoading] = useState(false);
	const componentToCaptureRef = useRef<HTMLDivElement>(null);

	// Enable after data loads
	useEffect(() => {
		if (apiState.hasDataForTrackedEndpoints) {
			setIsLoading(false);
		}
	}, [apiState.hasDataForTrackedEndpoints]);

	// Lazily render basket table offscreen to reduce jank
	useEffect(() => {
		if (isOpen) {
			setIsLoading(true);

			// Wait 50ms for avatars to load in (should be cached)
			requestIdleCallbackGuard(() => {
				void captureToBlob(componentToCaptureRef).then(blob => {
					setBlob(blob);
					setIsLoading(false);
				});
			});
		}
	}, [isOpen]);

	const handleImageCopy = async () => {
		if (blob) {
			// Bad lib typings?
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const item = new ClipboardItem({'image/png': blob as any});
			await navigator.clipboard.write([item]);
			setHasCopied(true);
		}
	};

	const handleImageDownload = () => {
		if (blob && currentBasket) {
			saveAs(URL.createObjectURL(blob), currentBasket.name);
		}
	};

	const canCopyImage = typeof ClipboardItem !== 'undefined';

	const pngUri = useMemo(() => blob === null ? '' : URL.createObjectURL(blob), [blob]);

	return (
		<>
			<Box pos='fixed' zIndex={100} left={-10_000}>
				<LightMode>
					<Box
						ref={componentToCaptureRef}
						color='gray.800'
						p={4}
						maxW='container.xl'
					>
						{
							isOpen && (
								<BasketTable
									isForCapture
									tableProps={{
										bgColor: 'white',
										rounded: 'none',
										shadow: 'none',
									}}/>
							)
						}
					</Box>
				</LightMode>
			</Box>

			<Modal
				isOpen={isOpen}
				size='3xl'
				autoFocus={false}
				onClose={onClose}
			>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Share Image</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<VStack spacing={4}>
							<Box pos='relative' shadow='base' m={2} rounded='md' overflow='hidden'>
								{
									isLoading ? (
										<Spinner/>
									) : (
										<img src={pngUri} alt='Courses'/>
									)
								}
							</Box>

							<HStack w='full'>
								{
									!canCopyImage && (
										<Text as='span'>
											✨ tip: looks like you may need to
											{' '}
											<WrappedLink isExternal href='/help/enable-image-copy' display='inline-block'>
												manually enable image copy
											</WrappedLink>
											{' '}
											for your browser
										</Text>
									)
								}

								<Spacer/>

								<Tooltip label='copy'>
									<IconButton
										icon={hasCopied ? <CheckIcon/> : <CopyIcon/>}
										colorScheme={hasCopied ? 'green' : undefined}
										aria-label='Copy image'
										variant='ghost'
										disabled={!canCopyImage || hasCopied}
										onClick={handleImageCopy}/>
								</Tooltip>

								<Tooltip label='download'>
									<IconButton
										icon={<DownloadIcon/>}
										aria-label='Download image'
										variant='ghost'
										onClick={handleImageDownload}/>
								</Tooltip>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default observer(ExportImage);
