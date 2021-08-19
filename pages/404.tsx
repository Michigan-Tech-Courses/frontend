import React from 'react';
import {Container, Heading, VStack, Text, Image} from '@chakra-ui/react';
import WrappedLink from '../components/link';

const NotFoundPage = () => (
	<Container>
		<VStack>
			<Heading>Not Found</Heading>

			<Image src="/images/404.webp"/>

			<Text as="span">
				Maybe try <WrappedLink href="/">going home?</WrappedLink>
			</Text>

		</VStack>
	</Container>
);

export default NotFoundPage;
