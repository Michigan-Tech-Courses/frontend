import React from 'react';
import Document, {Html, Head, Main, NextScript} from 'next/document';
import {ColorModeScript} from '@chakra-ui/react';

export default class CustomDocument extends Document {
	render() {
		return (
			<Html lang='en'>
				<Head/>

				<body>
					<ColorModeScript initialColorMode='system'/>
					<Main/>
					<NextScript/>
				</body>
			</Html>
		);
	}
}
