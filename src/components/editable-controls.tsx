import React from 'react';
import {
	ButtonGroup,
	IconButton,
	useEditableControls,
	Flex,
	Tooltip,
} from '@chakra-ui/react';
import {CheckIcon, CloseIcon, EditIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';

const EditableControls = observer(() => {
	const {
		isEditing,
		getSubmitButtonProps,
		getCancelButtonProps,
		getEditButtonProps,
	} = useEditableControls();

	return isEditing ? (
		<ButtonGroup justifyContent='center' size='xs'>
			<IconButton icon={<CheckIcon/>} {...getSubmitButtonProps()} aria-label='save'/>
			<IconButton icon={<CloseIcon/>} {...getCancelButtonProps()} aria-label='cancel'/>
		</ButtonGroup>
	) : (
		<Flex justifyContent='center'>
			<Tooltip label='edit basket name'>
				<IconButton size='xs' icon={<EditIcon/>} {...getEditButtonProps()} aria-label='edit'/>
			</Tooltip>
		</Flex>
	);
});

export default EditableControls;
