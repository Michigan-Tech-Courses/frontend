import React, {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {useColorModeValue, useToken} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {IPassFailDropRecord} from 'src/lib/api-types';
import {SEMESTER_DISPLAY_MAPPING} from 'src/lib/constants';

const LazyLoadedResponsiveLine = dynamic(async () => import('./custom-responsive-line'));

const MyResponsiveLine = ({data}: {data: IPassFailDropRecord[]}) => {
	const [darkText, red, yellow] = useToken('colors', ['white', 'red.400', 'yellow.400']) as string[];

	const chartTheme = useColorModeValue(
		// Light theme
		{
			background: 'transparent',
		},
		// Dark theme
		{
			background: 'transparent',
			textColor: darkText,
			tooltip: {
				container: {
					color: 'black',
				},
			},
			crosshair: {
				line: {
					stroke: 'white',
				},
			},
		},
	);

	const transformedData = useMemo(() => {
		const droppedData: Array<{x: string; y: number}> = [];
		const failedData: Array<{x: string; y: number}> = [];

		for (const record of data) {
			const key = `${SEMESTER_DISPLAY_MAPPING[record.semester]} ${record.year}`;

			droppedData.push({
				x: key,
				y: record.dropped / record.total,
			});

			failedData.push({
				x: key,
				y: record.failed / record.total,
			});
		}

		return [
			{
				id: 'dropped',
				data: droppedData,
			},
			{
				id: 'failed',
				data: failedData,
			},
		];
	}, [data]);

	return (
		<LazyLoadedResponsiveLine
			useMesh
			data={transformedData}
			theme={chartTheme}
			colors={[yellow, red]}
			margin={{top: 50, right: 110, bottom: 50, left: 60}}
			xScale={{type: 'point'}}
			yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false}}
			yFormat=" >-.2%"
			axisTop={null}
			axisRight={null}
			axisLeft={{
				format: '>-.2%',
			}}
			pointSize={10}
			pointBorderWidth={2}
			pointLabelYOffset={-12}
			legends={[
				{
					anchor: 'right',
					direction: 'column',
					justify: false,
					translateX: 100,
					translateY: 0,
					itemsSpacing: 0,
					itemDirection: 'left-to-right',
					itemWidth: 80,
					itemHeight: 20,
					itemOpacity: 0.75,
					symbolSize: 12,
					symbolShape: 'circle',
					symbolBorderColor: 'rgba(0, 0, 0, .5)',
				},
			]}
		/>
	);
};

export default observer(MyResponsiveLine);
