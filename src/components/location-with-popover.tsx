import React, {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {observer} from 'mobx-react-lite';
import {
	Box,
	Button,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverTrigger,
} from '@chakra-ui/react';
import {faLocationArrow} from '@fortawesome/free-solid-svg-icons';
import {ELocationType, IBuildingFromAPI, ISectionFromAPI} from 'src/lib/api-types';
import {Props} from 'react-mapbox-gl/lib/marker';
import WrappedFontAwesomeIcon from './wrapped-font-awesome-icon';

const Marker = dynamic<Props>(async () => import('react-mapbox-gl').then(mod => mod.Marker));
const WrappedMap = dynamic(async () => import('./wrapped-map'));

type LocationWithPopoverProps = Pick<ISectionFromAPI, 'locationType' | 'room'> & {
	building?: IBuildingFromAPI;
	hasLabelOnly?: boolean;
};

const LocationWithPopover = (props: LocationWithPopoverProps) => {
	const label = useMemo(() => {
		switch (props.locationType) {
			case ELocationType.ONLINE:
				return 'Online';
			case ELocationType.REMOTE:
				return 'Remote';
			case ELocationType.PHYSICAL:
				if (props.building) {
					return `${props.building.shortName ?? ''} ${props.room ?? ''}`.trim();
				}

				return '¯\\_(ツ)_/¯';

			default:
				return '¯\\_(ツ)_/¯';
		}
	}, [props]);

	if (props.locationType === ELocationType.PHYSICAL && props.building && !props.hasLabelOnly) {
		return (
			<Popover isLazy arrowSize={16}>
				<PopoverTrigger>
					<Button
						size="sm"
						variant="ghost"
						leftIcon={<WrappedFontAwesomeIcon icon={faLocationArrow} boxSize={3}/>}
						ml={-3}
					>
						{label}
					</Button>
				</PopoverTrigger>

				<PopoverContent>
					<PopoverArrow/>
					<PopoverCloseButton zIndex={1000}/>

					<PopoverBody p={0}>

						<WrappedMap
							zoom={[16]}
							center={[props.building.lon, props.building.lat]}
							w="full"
							h={64}
						>
							<Marker coordinates={[props.building.lon, props.building.lat]}>
								<Box
									bgColor="red.500"
									borderRadius="full"
									width={5}
									height={5}
									borderWidth="thick"
									borderColor="red.400"/>
							</Marker>
						</WrappedMap>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<span>
			{label}
		</span>
	);
};

export default observer(LocationWithPopover);
