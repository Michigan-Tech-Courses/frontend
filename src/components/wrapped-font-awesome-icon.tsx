import React from 'react';
import {Icon, IconProps} from '@chakra-ui/react';
import {FontAwesomeIcon, FontAwesomeIconProps} from '@fortawesome/react-fontawesome';

const WrappedFontAwesomeIcon = (props: IconProps & Pick<FontAwesomeIconProps, 'icon'>) => {
	return (
		<Icon as={FontAwesomeIcon} {...props}/>
	);
};

export default WrappedFontAwesomeIcon;
