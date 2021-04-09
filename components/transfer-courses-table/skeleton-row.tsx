import React from 'react';
import {Tr, Td, Skeleton} from '@chakra-ui/react';

const SkeletonRow = () => (
	<Tr>
		<Td>
			<Skeleton>
				CS1000
			</Skeleton>
		</Td>
		<Td>
			<Skeleton>
				CS1000
			</Skeleton>
		</Td>
		<Td whiteSpace="nowrap">
			<Skeleton>
				Introduction to Programming I
			</Skeleton>
		</Td>
		<Td>
			<Skeleton>
				University of MI
			</Skeleton>
		</Td>
		<Td>
			<Skeleton>
				MI
			</Skeleton>
		</Td>
		<Td isNumeric><Skeleton>3</Skeleton></Td>
	</Tr>
);

export default SkeletonRow;
