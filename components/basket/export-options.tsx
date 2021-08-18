import React, {useRef, useState, useMemo} from 'react';
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
	Portal
} from '@chakra-ui/react';
import {CheckIcon, ChevronDownIcon, CopyIcon, DownloadIcon} from '@chakra-ui/icons';
import {faShare} from '@fortawesome/free-solid-svg-icons';
import {observer} from 'mobx-react-lite';
import {captureToBlob} from '../../lib/export-image';
import saveAs from '../../lib/save-as';
import useEphemeralValue from '../../lib/hooks/use-ephemeral-value';
import useStore from '../../lib/state-context';

import BasketTable from './table';
import WrappedLink from '../link';
import sectionsToICS from '../../lib/sections-to-ics';
import WrappedFontAwesomeIcon from '../wrapped-font-awesome-icon';

const ExportOptions = () => {
	const {basketState} = useStore();
	const [hasCopied, setHasCopied] = useEphemeralValue(false, 500);
	const [isLoading, setIsLoading] = useState(false);
	const [blob, setBlob] = useState<Blob | null>(null);
	const {isOpen, onOpen, onClose} = useDisclosure();
	const componentToCaptureRef = useRef<HTMLDivElement>(null);

	const handleImageExport = async () => {
		setIsLoading(true);
		const blob = await captureToBlob(componentToCaptureRef);
		setBlob(blob);
		onOpen();
		setIsLoading(false);
	};

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
			const item = new ClipboardItem({'image/png': blob});
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
			<Menu>
				{({isOpen}) => (
					<>
						<MenuButton
							as={Button}
							disabled={basketState.numOfItems === 0}
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

			<Portal>
				<LightMode>
					<Box ref={componentToCaptureRef} color="gray.800" p={4} maxW="container.xl">
						<BasketTable
							isForCapture
							tableProps={{
								bgColor: 'white',
								rounded: 'none',
								shadow: 'none'
							}}/>
					</Box>
				</LightMode>
			</Portal>

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
