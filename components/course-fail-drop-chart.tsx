import dynamic from 'next/dynamic';
import {useColorModeValue, useToken} from '@chakra-ui/react';

const LazyLoadedResponsiveLne = dynamic(async () => import('./custom-responsive-line'));

const data = [
	{
		id: 'dropped',
		data: [
			{
				x: '2015',
				y: 20
			},
			{
				x: '2016',
				y: 12
			},
			{
				x: '2017',
				y: 22
			},
			{
				x: '2018',
				y: 16
			},
			{
				x: '2019',
				y: 5
			},
			{
				x: '2020',
				y: 7
			}
		]
	},
	{
		id: 'failed',
		data: [
			{
				x: '2015',
				y: 3
			},
			{
				x: '2016',
				y: 5
			},
			{
				x: '2017',
				y: 1
			},
			{
				x: '2018',
				y: 5
			},
			{
				x: '2019',
				y: 7
			},
			{
				x: '2020',
				y: 12
			}
		]
	}
];

const MyResponsiveLine = () => {
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

	return (
		<LazyLoadedResponsiveLne
			data={data}
			theme={chartTheme}
			colors={[yellow, red]}
			margin={{top: 50, right: 110, bottom: 50, left: 60}}
			xScale={{type: 'point'}}
			yScale={{type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false}}
			yFormat=" >-.0f"
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

export default MyResponsiveLine;
