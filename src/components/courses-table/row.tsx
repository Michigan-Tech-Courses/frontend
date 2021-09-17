import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {Tr, Td, IconButton, useDisclosure, usePrevious} from '@chakra-ui/react';
import {InfoIcon, InfoOutlineIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import getCreditsStr from 'src/lib/get-credits-str';
import {ICourseWithFilteredSections} from 'src/lib/state/ui';
import styles from './styles/table.module.scss';
import DetailsRow from './details-row';

const TableRow = observer(({course, onShareCourse}: {course: ICourseWithFilteredSections; onShareCourse: () => void}) => {
	const {isOpen, onToggle} = useDisclosure();
	const [onlyShowSections, setOnlyShowSections] = useState(false);
	const wasPreviouslyFiltered = usePrevious(course.sections.wasFiltered);

	const sections = course.sections.all;

	const creditsString: string = useMemo(() => {
		if (sections.length === 0) {
			return '';
		}

		let min = 10_000;
		let max = 0;
		for (const s of sections) {
			if (s.minCredits < min) {
				min = s.minCredits;
			}

			if (s.maxCredits > max) {
				max = s.maxCredits;
			}
		}

		return getCreditsStr(min, max);
	}, [sections]);

	// TODO: can this use useEffect instead?
	useLayoutEffect(() => {
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

	const handleShowEverything = useCallback(() => {
		setOnlyShowSections(false);
	}, []);

	return (
		<>
			<Tr className={isOpen ? styles.hideBottomBorder : ''}>
				<Td>
					{course.course.subject}<b>{course.course.crse}</b>
				</Td>
				<Td>
					{course.course.title}
				</Td>
				<Td display={{base: 'none', md: 'table-cell'}}>
					{course.course.description}
				</Td>
				<Td isNumeric>{creditsString}</Td>
				<Td isNumeric>
					<IconButton
						variant="ghost"
						colorScheme="blue"
						aria-label={isOpen ? 'Hide course details' : 'Show course details'}
						isActive={isOpen}
						data-testid="course-details-button"
						onClick={onToggle}
					>
						{isOpen ? <InfoIcon/> : <InfoOutlineIcon/>}
					</IconButton>
				</Td>
			</Tr>

			{isOpen && <DetailsRow course={course} onlyShowSections={onlyShowSections} onShowEverything={handleShowEverything} onShareCourse={onShareCourse}/>}
		</>
	);
});

export default TableRow;
