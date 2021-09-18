import React, {useState, useEffect} from 'react';
import {
	Menu,
	Button,
	MenuButton,
	MenuItem,
	MenuList,
	Box,
	useDisclosure,
} from '@chakra-ui/react';
import {ChevronDownIcon} from '@chakra-ui/icons';
import {faShare} from '@fortawesome/free-solid-svg-icons';
import {observer} from 'mobx-react-lite';
import saveAs from 'src/lib/save-as';
import useStore from 'src/lib/state/context';
import WrappedFontAwesomeIcon from 'src/components/wrapped-font-awesome-icon';
import ExportImage from './image';
import ExportCalendar from './calendar';

const ExportOptions = () => {
	const {basketState, apiState} = useStore();
	const [isLoading, setIsLoading] = useState(true);
	const imageDisclosure = useDisclosure();
	const calendarDisclosure = useDisclosure();

	// Enable after data loads
	useEffect(() => {
		if (apiState.hasDataForTrackedEndpoints) {
			setIsLoading(false);
		}
	}, [apiState.hasDataForTrackedEndpoints]);

	const handleCSVExport = () => {
		const tsv = basketState.toTSV();
		saveAs(`data:text/plain;charset=utf-8,${encodeURIComponent(tsv)}`, `${basketState.name}.tsv`);
	};

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
								<MenuItem onClick={imageDisclosure.onOpen}>Image</MenuItem>
								<MenuItem onClick={calendarDisclosure.onOpen}>Calendar</MenuItem>
								<MenuItem onClick={handleCSVExport}>CSV</MenuItem>
							</MenuList>
						</>
					)}
				</Menu>
			</Box>

			<ExportImage
				isOpen={imageDisclosure.isOpen}
				onClose={imageDisclosure.onClose}/>

			<ExportCalendar
				isOpen={calendarDisclosure.isOpen}
				onClose={calendarDisclosure.onClose}/>
		</>
	);
};

export default observer(ExportOptions);
