import React, {useRef, useState, useMemo, useEffect} from 'react';
import {
	Menu,
	HStack,
	Spacer,
	Button,
	MenuButton,
	MenuItem,
	MenuList,
	Box,
	LightMode,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
	IconButton,
	VStack,
	Text,
	Tooltip,
} from '@chakra-ui/react';
import {CheckIcon, ChevronDownIcon, CopyIcon, DownloadIcon} from '@chakra-ui/icons';
import {faShare} from '@fortawesome/free-solid-svg-icons';
import {observer} from 'mobx-react-lite';
import {captureToBlob} from 'src/lib/export-image';
import saveAs from 'src/lib/save-as';
import useEphemeralValue from 'src/lib/hooks/use-ephemeral-value';
import useStore from 'src/lib/state/context';

import WrappedLink from 'src/components/link';
import sectionsToICS from 'src/lib/sections-to-ics';
import WrappedFontAwesomeIcon from 'src/components/wrapped-font-awesome-icon';
import BasketTable from './table';

const ExportOptions = () => {
	const {basketState, apiState} = useStore();
	const [hasCopied, setHasCopied] = useEphemeralValue(false, 500);
	const [isLoading, setIsLoading] = useState(true);
	const [blob, setBlob] = useState<Blob | null>(null);
	const {isOpen, onOpen, onClose} = useDisclosure();
	const componentToCaptureRef = useRef<HTMLDivElement>(null);
	// Lazily render basket table offscreen to reduce jank
	const [shouldRenderComponentForCapture, setShouldRenderComponentForCapture] = useState(false);

	// Enable after data loads
	useEffect(() => {
		if (apiState.hasDataForTrackedEndpoints) {
			setIsLoading(false);
		}
	}, [apiState.hasDataForTrackedEndpoints]);

	const handleImageExport = async () => {
		setIsLoading(true);
		setShouldRenderComponentForCapture(true);
	};

	useEffect(() => {
		// Complete actions from handleImageExport()
		if (shouldRenderComponentForCapture) {
			void captureToBlob(componentToCaptureRef).then(blob => {
				setBlob(blob);
				onOpen();
				setIsLoading(false);
				setShouldRenderComponentForCapture(false);
			});
		}
	}, [shouldRenderComponentForCapture, onOpen]);

	const handleCSVExport = () => {
		const tsv = basketState.toTSV();
		saveAs(`data:text/plain;charset=utf-8,${encodeURIComponent(tsv)}`, `${basketState.name}.tsv`);
	};

	const handleCalendarExport = () => {
		const ics = sectionsToICS(basketState.sections);
		saveAs(`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`, `${basketState.name}.ics`);
	};

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
		if (blob) {
			saveAs(URL.createObjectURL(blob), basketState.name);
		}
	};

	const canCopyImage = typeof ClipboardItem !== 'undefined';

	const pngUri = useMemo(() => blob === null ? '' : URL.createObjectURL(blob), [blob]);

	return (
		<>
			<Box>
				<Menu>
					{({isOpen}) => (
						<>
							<MenuButton
								as={Button}
								variant="ghost"
								colorScheme="brand"
								leftIcon={<WrappedFontAwesomeIcon icon={faShare}/>}
								rightIcon={<ChevronDownIcon
									transform={isOpen ? 'rotate(180deg)' : ''}
									transitionProperty="transform"
									transitionDuration="normal"/>}
								isLoading={isLoading}
							>
								Share & Export
							</MenuButton>
							<MenuList>
								<MenuItem onClick={handleImageExport}>Image</MenuItem>
								<MenuItem onClick={handleCalendarExport}>Calendar</MenuItem>
								<MenuItem onClick={handleCSVExport}>CSV</MenuItem>
							</MenuList>
						</>
					)}
				</Menu>
			</Box>

			<Box pos="fixed" zIndex={100} left={-10_000}>
				<LightMode>
					<Box
						ref={componentToCaptureRef}
						color="gray.800"
						p={4}
						maxW="container.xl"
					>
						{
							shouldRenderComponentForCapture && (
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

			<Modal isOpen={isOpen} size="3xl" onClose={onClose}>
				<ModalOverlay/>
				<ModalContent>
					<ModalHeader>Share Image</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<VStack spacing={4}>
							<Box pos="relative" shadow="base" m={2} rounded="md" overflow="hidden">
								<img src={pngUri} alt="Courses"/>
							</Box>

							<HStack w="full">
								{
									!canCopyImage && (
										<Text as="span">
											✨ tip: looks like you may need to
											{' '}
											<WrappedLink isExternal href="/help/enable-image-copy" display="inline-block">
												manually enable image copy
											</WrappedLink>
											{' '}
											for your browser
										</Text>
									)
								}

								<Spacer/>

								<Tooltip label="copy">
									<IconButton
										icon={hasCopied ? <CheckIcon/> : <CopyIcon/>}
										colorScheme={hasCopied ? 'green' : undefined}
										aria-label="Copy image"
										variant="ghost"
										disabled={!canCopyImage || hasCopied}
										onClick={handleImageCopy}/>
								</Tooltip>

								<Tooltip label="download">
									<IconButton
										icon={<DownloadIcon/>}
										aria-label="Download image"
										variant="ghost"
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

export default observer(ExportOptions);
