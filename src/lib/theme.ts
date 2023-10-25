import {type ComponentStyleConfig, extendTheme} from '@chakra-ui/react';
import {createBreakpoints} from '@chakra-ui/theme-tools';

const FormLabel: ComponentStyleConfig = {
	baseStyle: {
		fontWeight: 'bold',
	},
};

const Link: ComponentStyleConfig = {
	baseStyle: ({colorMode}) => ({
		color: colorMode === 'light' ? 'blue.500' : 'blue.300',
	}),
};

const theme = extendTheme({
	colors: {
		brand: {
			50: '#fffae4',
			100: '#ffeea8',
			200: '#ffdf60',
			300: '#ffcd06',
			400: '#eebe00',
			500: '#d9ae00',
			600: '#c29b00',
			700: '#a78500',
			800: '#836900',
			900: '#4d3e00',
		},
	},
	breakpoints: createBreakpoints({
		sm: '30em',
		md: '48em',
		lg: '62em',
		xl: '80em',
		'2xl': '96em',
		'4xl': '192em',
	}),
	sizes: {
		container: {
			'2xl': '1600px',
		},
	},
	components: {
		FormLabel,
		Link,
	},
});

export default theme;
