import React from 'react';
import {Icon, type IconProps} from '@chakra-ui/react';
import {FontAwesomeIcon, type FontAwesomeIconProps} from '@fortawesome/react-fontawesome';

const WrappedFontAwesomeIcon = (props: IconProps & Pick<FontAwesomeIconProps, 'icon'>) => (
	<Icon as={FontAwesomeIcon} {...props}/>
);

export default WrappedFontAwesomeIcon;
