import React, {useMemo} from 'react';
import {HStack, Skeleton, Spacer, Text} from '@chakra-ui/react';
import {formatDistance} from 'date-fns';
import useCurrentDate from 'src/lib/hooks/use-current-date';
import InlineStat from './inline-stat';

const LastUpdatedAt = ({updatedAt}: {updatedAt: Date}) => {
	const now = useCurrentDate(5000);

	const lastUpdatedString = useMemo(() => formatDistance(updatedAt, now, {addSuffix: true}), [updatedAt, now]);

	return <Text>data last updated {lastUpdatedString}</Text>;
};

type Props = {
	isLoaded: boolean;
	matched: string;
	total: string;
	updatedAt: Date;
	label: string;
};

const DataFilterStatsBar = (options: Props) => (
	<HStack w="100%" mb={2}>
		<Skeleton isLoaded={options.isLoaded}>
			<InlineStat label="matched" number={options.matched} help={`out of ${options.total} ${options.label}`}/>
		</Skeleton>

		<Spacer/>

		<Skeleton isLoaded={options.isLoaded}>
			<LastUpdatedAt updatedAt={options.updatedAt}/>
		</Skeleton>
	</HStack>
);

export default DataFilterStatsBar;
