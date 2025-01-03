import React, {useCallback, useRef, useState, useEffect} from 'react';
import Head from 'next/head';
import {Box, Divider, useDisclosure} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import {NextSeo} from 'next-seo';
import CoursesTable from 'src/components/courses-table';
import ErrorToaster from 'src/components/error-toaster';
import useStore from 'src/lib/state/context';
import Basket from 'src/components/basket';
import ScrollTopDetector from 'src/components/scroll-top-detector';
import CoursesSearchBar from 'src/components/search-bar/courses';
import {useRouter} from 'next/router';
import {type BasketData} from 'src/components/basket/export-options/link';
import ImportBasket from 'src/components/basket/import/import';
import {instanceOf} from 'prop-types';

const isFirstRender = typeof window === 'undefined';

const MainContent = observer(() => {
	const [numberOfScrolledColumns, setNumberOfScrolledColumns] = useState(0);
	const courseTableContainerRef = useRef<HTMLDivElement>(null);
	const {apiState} = useStore();
	const router = useRouter();
	const {isOpen, onOpen, onClose} = useDisclosure();
	const [importBasketData, setImportBasketData] = useState<BasketData | undefined>(undefined);

	if (router?.query.basket && importBasketData === undefined) {
		const parsedBasket = JSON.parse(router.query.basket.toString()) as BasketData;
		setImportBasketData(parsedBasket);
		void router.replace('/');

		// Change term to basket term so that it can get the data for it
		if (parsedBasket !== undefined) {
			apiState.setSelectedTerm(parsedBasket.term);
		}
	}

	const closeImport = () => {
		setImportBasketData(undefined);
		onClose();
	};

	// Wait for data to be loaded to open import basket
	useEffect(() => {
		if (apiState.hasDataForTrackedEndpoints && importBasketData !== null) {
			onOpen();
		}
	}, [apiState.hasDataForTrackedEndpoints]);

	const handleScrollToTop = useCallback(() => {
		if (courseTableContainerRef.current) {
			courseTableContainerRef.current.scrollTop = 0;
		}
	}, []);

	return (
		<>
			<NextSeo
				title='MTU Courses | All Courses'
				description='A listing of courses and sections offered at Michigan Tech'
			/>

			<Divider
				mt={2}
				pb={4}
				h={2}
				shadow='md'
				borderColor='transparent'
				transitionProperty='opacity'
				transitionDuration='normal'
				opacity={numberOfScrolledColumns > 0 ? 1 : 0}/>

			<Box display='flex' overflow='hidden'>
				<ScrollTopDetector
					onTop={() => {
						setNumberOfScrolledColumns(n => n - 1);
					}}
					onScrolled={() => {
						setNumberOfScrolledColumns(n => n + 1);
					}}
				>
					<Box
						ref={courseTableContainerRef}
						px={6}
						pt={2}
						pb={{base: 8, '4xl': 'revert'}}
						display='flex'
						justifyContent={{base: 'center', '4xl': 'revert'}}
						flex={1}
						overflow='auto'
					>
						<CoursesTable onScrollToTop={handleScrollToTop}/>
					</Box>
				</ScrollTopDetector>

				<ScrollTopDetector
					onTop={() => {
						setNumberOfScrolledColumns(n => n - 1);
					}}
					onScrolled={() => {
						setNumberOfScrolledColumns(n => n + 1);
					}}
				>
					<Box
						px={{'4xl': 6}}
						pt={{'4xl': 2}}
						flex={{base: 0, '4xl': 1}}
						pb={{'4xl': 16}}
					>
						<Basket/>
					</Box>
				</ScrollTopDetector>
			</Box>
			{ importBasketData !== undefined
                && <ImportBasket basketData={importBasketData} isOpen={isOpen} onClose={closeImport}/>
			}
		</>
	);
});

const HomePage = observer(() => {
	const {apiState} = useStore();

	useEffect(() => {
		apiState.setSingleFetchEndpoints(['passfaildrop', 'buildings']);

		if (apiState.selectedTerm?.isFuture) {
			apiState.setRecurringFetchEndpoints(['courses']);
		} else {
			apiState.setRecurringFetchEndpoints(['courses', 'instructors', 'sections']);
		}

		return () => {
			apiState.setSingleFetchEndpoints([]);
			apiState.setRecurringFetchEndpoints([]);
		};
	}, [apiState.selectedTerm, apiState]);

	return (
		<>
			<Head>
				{isFirstRender && (
					<>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/semesters`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/instructors`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/passfaildrop`} as='fetch' crossOrigin='anonymous'/>
						<link rel='preload' href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/buildings`} as='fetch' crossOrigin='anonymous'/>
					</>
				)}
			</Head>

			<MainContent/>

			<ErrorToaster/>
		</>
	);
});

(HomePage as any).useStaticHeight = true;

export default HomePage;
