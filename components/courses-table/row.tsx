import React, {useEffect, useMemo, useState} from 'react';
import {Tr, Td, IconButton, Text, useDisclosure, usePrevious} from '@chakra-ui/react';
import {InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import styles from './styles/table.module.scss';
import getCreditsStr from '../../lib/get-credits-str';
import {ICourseWithFilteredSections} from '../../lib/ui-state';
import DetailsRow from './details-row';

const TableRow = observer(({course}: {course: ICourseWithFilteredSections}) => {
	const {isOpen, onToggle} = useDisclosure();
	const [onlyShowSections, setOnlyShowSections] = useState(false);
	const wasPreviouslyFiltered = usePrevious(course.sections.wasFiltered);

	const sections = course.sections.all;

	const creditsString: string = useMemo(() => {
		if (sections.length === 0) {
			return '';
		}

		let min = 10000;
		let max = 0;
		sections.forEach(s => {
			if (s.minCredits < min) {
				min = s.minCredits;
			}

			if (s.maxCredits > max) {
				max = s.maxCredits;
			}
		});

		return getCreditsStr(min, max);
	}, [sections]);

	useEffect(() => {
		if (course.sections.wasFiltered !== wasPreviouslyFiltered) {
			if (course.sections.wasFiltered) {
				setOnlyShowSections(true);

				if (!isOpen) {
					onToggle();
				}
			} else {
				if (isOpen) {
					onToggle();
				}

				setOnlyShowSections(false);
			}
		}
	}, [course.sections.wasFiltered, wasPreviouslyFiltered, isOpen, onToggle]);

	return (
		<>
			<Tr className={isOpen ? styles.hideBottomBorder : ''}>
				<Td>
					<span style={{width: '10ch', display: 'inline-block'}}>
						{course.subject}<b>{course.crse}</b>
					</span>
				</Td>
				<Td whiteSpace="nowrap">
					{course.title}
				</Td>
				<Td isNumeric>{creditsString}</Td>
				<Td display={{base: 'none', md: 'table-cell'}}>
					<Text noOfLines={1} as="span">{course.description}</Text>
				</Td>
				<Td style={{textAlign: 'right'}}>
					<IconButton
						variant="ghost"
						colorScheme="blue"
						onClick={onToggle}
						aria-label={isOpen ? 'Hide course details' : 'Show course details'}
						isActive={isOpen}
						data-testid="course-details-button">
						{isOpen ? <InfoIcon/> : <InfoOutlineIcon/>}
					</IconButton>
				</Td>
			</Tr>

			{isOpen && <DetailsRow course={course} onlyShowSections={onlyShowSections} onShowEverything={() => {
				setOnlyShowSections(false);
			}}/>}
		</>
	);
});

export default TableRow;
