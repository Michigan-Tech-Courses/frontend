import React, {useMemo} from 'react';
import {HStack, Skeleton, Spacer, Text} from '@chakra-ui/react';
import InlineStat from './inline-stat';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import useCurrentDate from '../lib/hooks/use-current-date';

dayjs.extend(relativeTime);

const LastUpdatedAt = ({updatedAt}: {updatedAt: Date}) => {
	const now = useCurrentDate(5000);

	const lastUpdatedString = useMemo(() => dayjs(updatedAt).from(now), [updatedAt, now]);

	return <Text>data last updated {lastUpdatedString}</Text>;
};

type Props = {
	isLoaded: boolean;
	matched: string;
	total: string;
	updatedAt: Date;
	label: string;
};

const DataFilterStatsBar = (options: Props) => {
	return (
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
};

export default DataFilterStatsBar;
