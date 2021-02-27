import React from 'react';
import Link from 'next/link.js';
import {Link as ChakraLink, LinkProps, Wrap, WrapItem} from '@chakra-ui/react';
import {ExternalLinkIcon} from '@chakra-ui/icons';

interface IWrappedLinkProps {
	href: string;
}

const WrappedLink = (props: LinkProps & IWrappedLinkProps) => {
	const {href, ...otherProps} = props;

	if (href.includes(':')) {
		// External link
		return (
			<ChakraLink {...props} isExternal>
				<Wrap align="center">
					<WrapItem>
						{props.children}
					</WrapItem>

					<WrapItem>
						<ExternalLinkIcon/>
					</WrapItem>
				</Wrap>
			</ChakraLink>
		);
	}

	return (
		<Link passHref href={href}>
			<ChakraLink {...otherProps}/>
		</Link>
	);
};

export default WrappedLink;
