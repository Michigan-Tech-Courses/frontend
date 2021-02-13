import dynamic from 'next/dynamic';
import {useColorModeValue, useToken} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {IPassFailDropRecord} from '../lib/types';
import {SEMESTER_DISPLAY_MAPPING} from '../lib/constants';

const LazyLoadedResponsiveLne = dynamic(async () => import('./custom-responsive-line'));

const MyResponsiveLine = ({data}: {data: IPassFailDropRecord[]}) => {
	const [darkText, red, yellow] = useToken('colors', ['white', 'red.400', 'yellow.400']);

	const chartTheme = useColorModeValue(
		// Light theme
		{
			background: 'transparent'
		},
		// Dark theme
		{
			background: 'transparent',
			textColor: darkText,
			tooltip: {
				container: {
					color: 'black'
				}
			},
			crosshair: {
				line: {
					stroke: 'white'
				}
			}
		}
	);

	const droppedData: Array<{x: string; y: number}> = [];
	const failedData: Array<{x: string; y: number}> = [];

	data.forEach(record => {
		const key = `${SEMESTER_DISPLAY_MAPPING[record.semester]} ${record.year}`;

		droppedData.push({
			x: key,
			y: record.dropped / record.total
		});

		failedData.push({
			x: key,
			y: record.failed / record.total
		});
	});

	const transformedData = [
		{
			id: 'dropped',
			data: droppedData
		},
		{
			id: 'failed',
			data: failedData
		}
	];

	return (
		<LazyLoadedResponsiveLne
			data={transformedData}
			theme={chartTheme}
			colors={[yellow, red]}
			margin={{top: 50, right: 110, bottom: 50, left: 60}}
			xScale={{type: 'point'}}
			yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false}}
			yFormat=" >-.2%"
			axisTop={null}
			axisRight={null}
			axisBottom={{
				orient: 'bottom',
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'year',
				legendOffset: 36,
				legendPosition: 'middle'
			}}
			axisLeft={{
				orient: 'left',
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				legend: 'students',
				legendOffset: -40,
				legendPosition: 'middle'
			}}
			pointSize={10}
			pointBorderWidth={2}
			pointLabelYOffset={-12}
			useMesh={true}
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
					symbolBorderColor: 'rgba(0, 0, 0, .5)'
				}
			]}
		/>
	);
};

export default observer(MyResponsiveLine);
