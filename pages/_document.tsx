import Document, {Html, Head, Main, NextScript} from 'next/document';
import {ColorModeScript} from '@chakra-ui/react';

export default class CustomDocument extends Document {
	render() {
		return (
			<Html lang="en">
				<Head>
					<title>Michigan Tech Courses</title>
					<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
				</Head>

				<body>
					<ColorModeScript initialColorMode="light" />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
