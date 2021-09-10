import React from 'react';
import {Except} from 'type-fest';
import {useColorModeValue, chakra} from '@chakra-ui/react';
import ReactMapboxGl from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// eslint-disable-next-line new-cap
const Map = ReactMapboxGl({
	accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
});

const ColorModeAwareMap = (props: Except<ConstructorParameters<typeof Map>[0], 'style'>) => {
	const mapStyle = useColorModeValue('mapbox://styles/mapbox/light-v9', 'mapbox://styles/mapbox/dark-v9');

	return <Map {...props} style={mapStyle}/>;
};

const WrappedMap = chakra(ColorModeAwareMap);

export default WrappedMap;

export {Marker} from 'react-mapbox-gl';
