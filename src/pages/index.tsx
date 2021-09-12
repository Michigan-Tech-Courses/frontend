import React, {useCallback, useRef, useEffect, useState} from 'react';
import {GetServerSideProps} from 'next';
import Head from 'next/head';
import {NextSeo} from 'next-seo';
import {
	Box,
	Code,
	Heading,
	VStack,
	Text,
	useToast,
	ModalContent,
	ModalBody,
	ModalCloseButton,
	ModalHeader,
	Divider,
} from '@chakra-ui/react';
import {observer} from 'mobx-react-lite';
import SearchBar from 'src/components/search-bar';
import CoursesTable from 'src/components/courses-table';
import ErrorToaster from 'src/components/error-toaster';
import useStore from 'src/lib/state-context';
import {decodeShareable} from 'src/lib/sharables';
import API from 'src/lib/api';
import {getCoursePreviewUrl} from 'src/lib/preview-url';
import Basket from 'src/components/basket';
import {CustomNextPage} from 'src/lib/types';
import ScrollTopDetector from 'src/components/scroll-top-detector';
import {IFullCourseFromAPI} from 'src/lib/api-types';

const FILTER_EXAMPLES = [
	{
		label: 'Subject',
		examples: [
			{
				label: 'filter by Computer Science courses',
				query: 'subject:cs',
			},
		],
	},
	{
		label: 'Course Level',
		examples: [
			{
				label: 'filter only by 1000-2000 level courses',
				query: 'level:1000',
			},
			{
				label: 'filter by courses that are at least 1000 level',
				query: 'level:1000+',
			},
			{
				label: 'filter by courses that are between 1000 and 3000 level',
				query: 'level:1000-3000',
			},
		],
	},
	{
		label: 'Section Seats',
		examples: [
			{
				label: 'filter by sections with available seats',
				query: 'has:seats',
			},
		],
	},
	{
		label: 'Location',
		examples: [
			{
				label: 'filter by sections offered in-person',
				query: 'is:classroom',
			},
			{
				label: 'filter by online sections (recorded lectures)',
				query: 'is:online',
			},
			{
				label: 'filter by remote sections (live lectures but online)',
				query: 'is:remote',
			},
		],
	},
	{
		label: 'Credits',
		examples: [
			{
				label: 'filter by 3 credit sections',
				query: 'credits:3',
			},
			{
				label: 'filter by sections that are at least 3 credits',
				query: 'credits:3+',
			},
			{
				label: 'filter by sections that are between 1 and 3 credits',
				query: 'credits:1-3',
			},
		],
	},
	{
		label: 'Schedule',
		examples: [
			{
				label: 'filter by sections that have a listed schedule',
				query: 'has:time',
			},
		],
	},
	{
		label: 'Basket',
		examples: [
			{
				label: 'filter by sections that are schedule-compatible with saved sections in your basket',
				query: 'is:compatible',
			},
		],
	},
];

const isFirstRender = typeof window === 'undefined';

interface Props {
	sharedCourse?: IFullCourseFromAPI;
	previewImg?: string;
}

const MainContent = () => {
	const [numberOfScrolledColumns, setNumberOfScrolledColumns] = useState(0);
	const courseTableContainerRef = useRef<HTMLDivElement | null>(null);

	const handleScrollToTop = useCallback(() => {
		if (courseTableContainerRef.current) {
			courseTableContainerRef.current.scrollTop = 0;
		}
	}, []);

	return (
		<>
			<Divider
				mt={2}
				pb={4}
				h={2}
				shadow="md"
				borderColor="transparent"
				transitionProperty="opacity"
				transitionDuration="normal"
				opacity={numberOfScrolledColumns > 0 ? 1 : 0}/>

			<Box display="flex" overflow="hidden">
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
						display="flex"
						justifyContent={{base: 'center', '4xl': 'revert'}}
						overflow="scroll"
						flex={1}
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
						overflow="auto"
						flex={{base: 0, '4xl': 1}}
						pb={{'4xl': 16}}
					>
						<Basket/>
					</Box>
				</ScrollTopDetector>
			</Box>
		</>
	);
};

const HomePage: CustomNextPage<Props> = props => {
	const toast = useToast();
	const {uiState, apiState, basketState} = useStore();

	const handleSearchChange = useCallback((newValue: string) => {
		uiState.setSearchValue(newValue);
	}, [uiState]);

	const handleQuerySaveOrDelete = useCallback(() => {
		if (basketState.searchQueries.includes(uiState.searchValue)) {
			basketState.removeSearchQuery(uiState.searchValue);
		} else {
			basketState.addSearchQuery(uiState.searchValue);
		}
	}, [basketState, uiState.searchValue]);

	const isQuerySaved = uiState.searchValue === '' ? false : basketState.searchQueries.includes(uiState.searchValue);

	const {sharedCourse} = props;

	useEffect(() => {
		if (sharedCourse) {
			apiState.setSelectedSemester({
				semester: sharedCourse.semester,
				year: sharedCourse.year,
			});
			uiState.setSearchValue(`${sharedCourse.subject}${sharedCourse.crse}`);
		}

		apiState.setSingleFetchEndpoints(['passfaildrop', 'buildings']);
		apiState.setRecurringFetchEndpoints(['courses', 'instructors', 'sections']);

		return () => {
			apiState.setSingleFetchEndpoints([]);
			apiState.setRecurringFetchEndpoints([]);
		};
	}, [sharedCourse, toast, apiState, uiState]);

	return (
		<>
			{
				sharedCourse ? (
					<NextSeo
						title={`${sharedCourse.title} at Michigan Tech`}
						description={sharedCourse.description ?? ''}
						openGraph={{
							type: 'website',
							title: `${sharedCourse.title} at Michigan Tech`,
							description: sharedCourse.description ?? '',
							images: props.previewImg ? [{
								url: props.previewImg,
							}] : [],
						}}
						twitter={{
							cardType: 'summary_large_image',
						}}
					/>
				) : (
					<NextSeo
						title="MTU Courses | All Courses"
						description="A listing of courses and sections offered at Michigan Tech"
					/>
				)
			}
			{
				props.previewImg && (
					<meta name="twitter:image" content={props.previewImg}/>
				)
			}

			<Head>
				{isFirstRender && (
					<>
						<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/semesters`} as="fetch" crossOrigin="anonymous"/>
						<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/instructors`} as="fetch" crossOrigin="anonymous"/>
						<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/passfaildrop`} as="fetch" crossOrigin="anonymous"/>
						<link rel="preload" href={`${process.env.NEXT_PUBLIC_API_ENDPOINT!}/buildings`} as="fetch" crossOrigin="anonymous"/>
					</>
				)}
			</Head>

			<SearchBar
				placeholder="Search by instructor, subject, section, or anything else..."
				isEnabled={apiState.hasDataForTrackedEndpoints}
				value={uiState.searchValue}
				isQuerySaved={isQuerySaved}
				onChange={handleSearchChange}
				onQuerySaveOrDelete={handleQuerySaveOrDelete}
			>
				<ModalContent p={8}>
					<ModalHeader>Filter Cheatsheet</ModalHeader>
					<ModalCloseButton/>
					<ModalBody>
						<VStack spacing={8} alignItems="flex-start">
							{
								FILTER_EXAMPLES.map(exampleGroup => (
									<VStack key={exampleGroup.label} alignItems="flex-start" w="100%" spacing={3}>
										<Heading size="sm">{exampleGroup.label}</Heading>

										{exampleGroup.examples.map(example => (
											<Box key={example.label} display="flex" w="100%">
												<Box w="20ch">
													<Code>{example.query}</Code>
												</Box>

												<Text w="100%">{example.label}</Text>
											</Box>
										))}
									</VStack>
								))
							}

							<Box>
								<Heading size="md" mb={2}>Tips</Heading>

								<Text>
									Don't be afraid to mix and match! Queries like <Code>subject:cs has:seats ureel</Code> work just fine.
								</Text>
							</Box>
						</VStack>
					</ModalBody>
				</ModalContent>
			</SearchBar>

			<MainContent/>
			<ErrorToaster/>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async context => {
	if (context.query.share && context.req) {
		const shareable = decodeShareable(context.query.share as string);

		switch (shareable.type) {
			case 'SHARE_COURSE': {
				const [course] = await Promise.all([
					API.findFirstCourse(shareable.data),
				]);

				if (course) {
					return {
						props: {
							sharedCourse: course,
							previewImg: getCoursePreviewUrl(course, context.req),
						},
					};
				}

				break;
			}

			default:
				break;
		}
	}

	return {props: {}};
};

HomePage.useStaticHeight = true;

export default observer(HomePage);
