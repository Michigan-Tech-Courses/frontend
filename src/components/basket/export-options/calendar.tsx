import React, {useState} from 'react';
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
} from '@chakra-ui/react';
import saveAs from 'src/lib/save-as';
import sectionsToICS, {ALERT_TIMINGS, LocationStyle, TitleStyle} from 'src/lib/sections-to-ics';
import useStore from 'src/lib/state/context';

type ExportCalendarProps = {
	isOpen: boolean;
	onClose: () => void;
};

const ExportCalendar = ({isOpen, onClose}: ExportCalendarProps) => {
	const {allBasketsState: {currentBasket}, apiState} = useStore();
	const [titleStyle, setTitleStyle] = useState<string>(TitleStyle.CRSE_FIRST);
	const [locationStyle, setLocationStyle] = useState<string>(LocationStyle.SHORT);
	const [alertTime, setAlertTime] = useState(ALERT_TIMINGS[2].toString());

	const handleCalendarExport = (event: React.FormEvent) => {
		event.preventDefault();

		if (!currentBasket) {
			return false;
		}

		const ics = sectionsToICS(currentBasket.sections, apiState.buildings, {
			titleStyle: titleStyle as TitleStyle,
			locationStyle: locationStyle as LocationStyle,
			alertTiming: Number.parseInt(alertTime, 10) as typeof ALERT_TIMINGS[0],
		});
		saveAs(`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`, `${currentBasket.name}.ics`);
	};

	return (
		<Modal isOpen={isOpen} size="lg" onClose={onClose}>
			<ModalOverlay/>
			<ModalContent>
				<ModalHeader>Generate Calendar</ModalHeader>
				<ModalCloseButton/>
				<ModalBody as="form" onSubmit={handleCalendarExport}>
					<Stack spacing={6}>
						<Text>
							Feel free to customize how the events are generated before downloading.
						</Text>

						<FormControl>
							<FormLabel>Title style:</FormLabel>
							<RadioGroup
								as={Stack}
								value={titleStyle}
								onChange={setTitleStyle}
							>
								<Radio value={TitleStyle.CRSE_FIRST}>CS1000 (Intro to Programming)</Radio>
								<Radio value={TitleStyle.NO_CRSE}>Intro to Programming</Radio>
								<Radio value={TitleStyle.CRSE_LAST}>Into to Programming (CS1000)</Radio>
							</RadioGroup>
						</FormControl>

						<FormControl>
							<FormLabel>Location style:</FormLabel>
							<RadioGroup
								as={Stack}
								value={locationStyle}
								onChange={setLocationStyle}
							>
								<Radio value={LocationStyle.SHORT}>Walker 0120A</Radio>
								<Radio value={LocationStyle.FULL}>Walker - Arts & Humanities 0120A</Radio>
							</RadioGroup>
						</FormControl>

						<FormControl>
							<FormLabel>Alert:</FormLabel>
							<RadioGroup
								as={Stack}
								value={alertTime}
								onChange={setAlertTime}
							>
								{
									ALERT_TIMINGS.map(time => (
										<Radio key={time} value={time.toString()}>
											{time === 0 ? 'no alert' : `${time} minutes before`}
										</Radio>
									))
								}
							</RadioGroup>
						</FormControl>

						<Button type="submit" colorScheme="blue">
							Get Calendar
						</Button>
					</Stack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default observer(ExportCalendar);
