import React, {Dispatch, SetStateAction} from 'react';
import {ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon} from '@chakra-ui/icons';
import {TableCaption, HStack, IconButton, Spacer, Skeleton, Select, Text} from '@chakra-ui/react';

type Props = {
	page: number;
	pageSize: number;
	setPage: Dispatch<SetStateAction<number>>;
	isEnabled: boolean;
	numberOfPages: number;
	onPageSizeChange: (newSize: number) => void;
	availableSizes: number[];
};

const TablePageControls = ({page, pageSize, setPage, isEnabled, numberOfPages, onPageSizeChange, availableSizes}: Props) => (
	<TableCaption p="0" mb={4}>
		<HStack w="100%">
			<IconButton
				aria-label="Go to begining"
				size="sm"
				isDisabled={page === 0 || !isEnabled}
				onClick={() => {
					setPage(0);
				}}
			>
				<ArrowLeftIcon/>
			</IconButton>

			<IconButton
				aria-label="Move back a page"
				size="sm"
				isDisabled={page === 0 || !isEnabled}
				onClick={() => {
					setPage(p => p - 1);
				}}
			>
				<ChevronLeftIcon/>
			</IconButton>

			<Spacer/>

			<HStack>
				<Skeleton isLoaded={isEnabled}>
					<Text>page {page + 1} of {numberOfPages}</Text>
				</Skeleton>

				<Select
					w="auto"
					size="sm"
					aria-label="Change number of rows per page"
					value={pageSize}
					disabled={!isEnabled}
					onChange={event => {
						onPageSizeChange(Number.parseInt(event.target.value, 10));
					}}
				>
					{availableSizes.map(o => (
						<option key={o} value={o} defaultChecked={o === pageSize}>{o}</option>
					))}
				</Select>
			</HStack>

			<Spacer/>

			<IconButton
				aria-label="Move forward a page"
				size="sm"
				isDisabled={page === numberOfPages - 1 || !isEnabled}
				onClick={() => {
					setPage(p => p + 1);
				}}
			>
				<ChevronRightIcon/>
			</IconButton>

			<IconButton
				aria-label="Go to end"
				size="sm"
				isDisabled={page === numberOfPages - 1 || !isEnabled}
				onClick={() => {
					setPage(numberOfPages - 1);
				}}
			>
				<ArrowRightIcon/>
			</IconButton>
		</HStack>
	</TableCaption>
);

export default React.memo(TablePageControls);
