import React from 'react';
import Link from 'next/link.js';
import {Link as ChakraLink, type LinkProps, Wrap, WrapItem} from '@chakra-ui/react';
import {ExternalLinkIcon} from '@chakra-ui/icons';
import {observer} from 'mobx-react-lite';

type IWrappedLinkProps = {
	href: string;
	isExternal?: boolean;
};

const onClick = (href: string) => {
	if ((window as any).umami) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		(window as any).umami.track('click', {href});
	}
};

const WrappedLink = observer((props: LinkProps & IWrappedLinkProps) => {
	const {href, isExternal, ...otherProps} = props;

	if (href.includes(':') || isExternal) {
		// External link
		return (
			<ChakraLink {...props} isExternal onClick={() => {
				onClick(href);
			}}>
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
