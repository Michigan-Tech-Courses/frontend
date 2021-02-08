import React from 'react';
import {Wrap, WrapItem} from '@chakra-ui/react';
import {StarIcon} from '@chakra-ui/icons';

const round = (number: number, increment: number) => {
	return Math.ceil(number / increment) * increment;
};

const getColorsForRating = (rating: number): string[] => {
	const remapped = round(rating * 5, 0.5);
	const colors = [];

	for (let i = 0; i < 5; i++) {
		const difference = remapped - i;

		if (difference === 0.5) {
			colors.push('yellow.300');
		} else if (difference < 0) {
			colors.push('yellow.200');
		} else {
			colors.push('yellow.400');
		}
	}

	return colors;
};

const StarRating = ({rating}: {rating: number}) => {
	return (
		<Wrap align="center">
			{
				getColorsForRating(rating).map((color, i) => (
					<WrapItem key={i}>
						<StarIcon color={color}/>
					</WrapItem>
				))
			}
		</Wrap>
	);
};

export default StarRating;
