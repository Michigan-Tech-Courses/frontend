import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	Button,
	FormControl,
	FormLabel,
	Stack,
	Text,
	Radio,
	RadioGroup,
	usePrevious,
	Box,
	Input,
	Kbd,
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from '@chakra-ui/react';
import Bowser from 'bowser';
import useStore from 'src/lib/state/context';
import WrappedLink from 'src/components/link';
import saveKeyboardScriptFor, {SupportedSoftware} from 'src/lib/save-keyboard-script-for-software';

type CRNScriptProps = {
	isOpen: boolean;
	onClose: () => void;
};

type OS = 'Windows' | 'Linux' | 'macOS';

type Software = {
	label: SupportedSoftware;
	href: string;
};

const SOFTWARES: Record<OS, Software[]> = {
	Windows: [
		{
			label: 'AutoHotkey',
			href: 'https://www.autohotkey.com/',
		},
	],
	Linux: [
		{
			label: 'Autokey',
			href: 'https://github.com/autokey/autokey',
		},
	],
	macOS: [],
};

const CRNScript = ({isOpen, onClose}: CRNScriptProps) => {
	const {basketState} = useStore();
	const [shortcutKey, setShortcutKey] = useState('c');
	const [platform, setPlatform] = useState<OS>('Windows');
	const [softwareLabel, setSoftwareLabel] = useState<Software['label']>();

	useEffect(() => {
		const browser = Bowser.getParser(window.navigator.userAgent);
		const {name} = browser.getOS();
		if (name) {
			setPlatform(name as OS);
		}
	}, []);

	// Update selected software when changing platforms
	const previousPlatform = usePrevious(platform);
	useEffect(() => {
		if (previousPlatform && previousPlatform !== platform && !SOFTWARES[platform].some(s => s.label === softwareLabel)) {
			setSoftwareLabel(SOFTWARES[platform][0]?.label ?? undefined);
		}
	}, [previousPlatform, platform, softwareLabel]);

	const isFormValid = useMemo(() => platform && softwareLabel, [platform, softwareLabel]);

	const handleSubmit = useCallback((event: React.FormEvent) => {
		event.preventDefault();

		if (!softwareLabel) {
			return;
		}

		saveKeyboardScriptFor(
			softwareLabel,
			basketState.sections.slice(0, 10),
			basketState.name,
			shortcutKey,
		);
	}, [softwareLabel, basketState, shortcutKey]);

	return (
		<Modal isOpen={isOpen} size="lg" onClose={onClose}>
			<ModalOverlay/>
			<ModalContent>
				<ModalHeader>Generate keyboard macro</ModalHeader>
				<ModalCloseButton/>
				<ModalBody as="form" onSubmit={handleSubmit}>
					<Stack spacing={6}>
						<Stack spacing={2}>
							<Text>
								A keyboard macro can be used to register for all your courses at the press of a button, rather than copy/pasting each CRN individually. It's less error prone and might even give you a slight advantage when registering for sections that quickly fill.
							</Text>

							<Box>
								Want to <WrappedLink isExternal href="/help/registration-script" display="inline-block">test your macro</WrappedLink>?
							</Box>

							<Box>
								Don't see your favorite macro software listed? <WrappedLink href="https://github.com/Michigan-Tech-Courses/frontend/issues" display="inline-block">Open an issue.</WrappedLink>
							</Box>
						</Stack>

						{
							basketState.sectionIds.length > 10 && (
								<Alert status="warning" rounded="md">
									<AlertIcon/>
									<AlertTitle>Warning:</AlertTitle>
									<AlertDescription>
										You have more than 10 sections. The registration only supports entering 10 sections at a time, so the generated script will only cover the first 10 sections.
									</AlertDescription>
								</Alert>
							)
						}

						<FormControl>
							<FormLabel>Shortcut:</FormLabel>
							<Box>
								<Kbd>alt</Kbd>
								{' + '}
								<Input
									value={shortcutKey}
									size="sm"
									w="4ch"
									textAlign="center"
									maxLength={1}
									onChange={event => {
										setShortcutKey(event.target.value);
									}}/>
							</Box>
						</FormControl>

						<FormControl>
							<FormLabel>Operating system:</FormLabel>

							<RadioGroup
								as={Stack}
								value={platform}
								onChange={nextValue => {
									setPlatform(nextValue as OS);
								}}
							>
								<Radio value="Windows">🪟 Windows</Radio>
								<Radio value="macOS">🍎 macOS</Radio>
								<Radio value="Linux">🐧 Linux</Radio>
							</RadioGroup>
						</FormControl>

						<FormControl>
							<FormLabel>Software:</FormLabel>
							<RadioGroup
								as={Stack}
								value={softwareLabel}
								onChange={nextValue => {
									setSoftwareLabel(nextValue as SupportedSoftware);
								}}
							>
								{
									SOFTWARES[platform].map(software => (
										<Radio key={software.label} value={software.label}>
											<WrappedLink href={software.href}>
												{software.label}
											</WrappedLink>
										</Radio>
									))
								}
							</RadioGroup>

							{
								SOFTWARES[platform].length === 0 && (
									<Text>Not currently supported. 😔</Text>
								)
							}
						</FormControl>

						<Button
							type="submit"
							colorScheme="blue"
							isDisabled={!isFormValid}
						>
							Get Macro Script
						</Button>
					</Stack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default observer(CRNScript);
