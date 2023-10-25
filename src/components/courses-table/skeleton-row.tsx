import React from 'react';
import {Tr, Td, IconButton, Skeleton, Box} from '@chakra-ui/react';
import {InfoIcon} from '@chakra-ui/icons';

const SkeletonRow = () => (
	<Tr>
		<Td>
			<Skeleton>
				CS1000
			</Skeleton>
		</Td>
		<Td whiteSpace='nowrap'>
			<Skeleton>
				Introduction to Programming I
			</Skeleton>
		</Td>
		<Td isNumeric><Skeleton>3</Skeleton></Td>
		<Td display={{base: 'none', md: 'table-cell'}} width='40%' position='relative'>
			<Box
				position='absolute'
				d='inline-flex'
				pl={6}
				alignItems='center'
				left={0}
				right={0}
				top={0}
				bottom={0}
			>
				<Skeleton
					whiteSpace='nowrap'
					overflow='hidden'
					textOverflow='ellipsis'
				>
					An introduction to programming with Java. An introduction to programming with Java. An introduction to programming with Java. An introduction to programming with Java. An introduction to programming with Java.
				</Skeleton>
			</Box>
		</Td>
		<Td style={{textAlign: 'right'}}>
			<Skeleton>
				<IconButton
					variant='ghost'
					colorScheme='blue'
					aria-label='Loading...'
					data-testid='course-details-button'
				>
					<InfoIcon/>
				</IconButton>
			</Skeleton>
		</Td>
	</Tr>
);

export default SkeletonRow;
