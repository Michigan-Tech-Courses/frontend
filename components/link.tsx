import React from 'react';
import Link from 'next/link';
import {Link as ChakraLink, LinkProps} from '@chakra-ui/react';

interface IWrappedLinkProps {
	href: string;
}

const WrappedLink = (props: LinkProps & IWrappedLinkProps) => {
	const {href, ...otherProps} = props;

	if (href.startsWith('http')) {
		// External link
		return (
			<ChakraLink {...props} isExternal/>
		);
	}

	return (
		<Link passHref href={href}>
			<ChakraLink {...otherProps}/>
		</Link>
	);
};

export default WrappedLink;
