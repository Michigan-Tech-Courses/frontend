import React from 'react';
import Link from 'next/link.js';
import {Link as ChakraLink, type LinkProps, Wrap, WrapItem} from '@chakra-ui/react';
import {ExternalLinkIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';

type IWrappedLinkProps = {
	href: string;
	isExternal?: boolean;
};

const WrappedLink = observer((props: LinkProps & IWrappedLinkProps) => {
	const {href, isExternal, ...otherProps} = props;

	if (href.includes(':') || isExternal) {
		// External link
		return (
			<ChakraLink {...props} isExternal>
				<Wrap align='center'>
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
});

export default WrappedLink;
