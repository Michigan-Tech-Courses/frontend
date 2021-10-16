import React from 'react';
import {
	Button,
	EditableInput,
	EditablePreview,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useEditableControls,
} from '@chakra-ui/react';
import {ChevronDownIcon, AddIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';
import useStore from 'src/lib/state/context';

type BasketSelectorProps = {
	onCreateNewBasket: () => void;
};

const BasketSelector = observer((props: BasketSelectorProps) => {
	const {isEditing} = useEditableControls();
	const {allBasketsState, apiState} = useStore();
	const {currentBasket} = allBasketsState;

	if (!currentBasket) {
		return <>¯\_(ツ)_/¯</>;
	}

	return (
		<Menu>
			{({isOpen}) => (
				<>
					<MenuButton
						as={Button}
						rightIcon={<ChevronDownIcon
							transform={isOpen ? 'rotate(180deg)' : ''}
							transitionProperty="transform"
							transitionDuration="normal"/>}
						display={isEditing ? 'none' : 'block'}
					>
						<EditablePreview/>
						<EditableInput/>
					</MenuButton>
					<MenuList>
						<MenuItem icon={<AddIcon/>} onClick={props.onCreateNewBasket}>
							Add basket
						</MenuItem>

						{
							apiState.selectedTerm && allBasketsState.getBasketsFor(apiState.selectedTerm).map(basket => (
								<MenuItem
									key={basket.id}
									onClick={() => {
										allBasketsState.setSelectedBasket(basket.id);
									}}
								>
									{basket.name}
								</MenuItem>
							))
						}
					</MenuList>
				</>
			)}
		</Menu>
	);
});

export default BasketSelector;
