import React, {useCallback, useRef, useEffect, useState} from 'react';
import Head from 'next/head';
import {NextSeo} from 'next-seo';
import {Box, Code, Heading, VStack, Text, useToast, usePrevious} from '@chakra-ui/react';
import {ModalContent, ModalBody, ModalCloseButton, ModalHeader} from '@chakra-ui/modal';
import {observer} from 'mobx-react-lite';
import SearchBar from '../components/search-bar';
import CoursesTable from '../components/courses-table';
import ErrorToaster from '../components/error-toaster';
import useStore from '../lib/state-context';
import {NextPage} from 'next';
import {decodeShareable} from '../lib/sharables';
import API from '../lib/api';
import {TSeedCourse} from '../lib/api-state';
import {getCoursePreviewUrl} from '../lib/preview-url';
import Basket from '../components/basket';

const FILTER_EXAMPLES = [
	{
		label: 'Subject',
		examples: [
			{
				label: 'filter by Computer Science courses',
				query: 'subject:cs'
			}
		]
	},
	{
		label: 'Course Level',
		examples: [
			{
				label: 'filter only by 1000-2000 level courses',
				query: 'level:1000'
			},
			{
				label: 'filter by courses that are at least 1000 level',
				query: 'level:1000+'
			},
			{
				label: 'filter by courses that are between 1000 and 3000 level',
				query: 'level:1000-3000'
			}
		]
	},
	{
		label: 'Section Seats',
		examples: [
			{
				label: 'filter by sections with available seats',
				query: 'has:seats'
			}
		]
	},
	{
		label: 'Credits',
		examples: [
			{
				label: 'filter by 3 credit sections',
				query: 'credits:3'
			},
			{
				label: 'filter by sections that are at least 3 credits',
				query: 'credits:3+'
			},
			{
				label: 'filter by sections that are between 1 and 3 credits',
				query: 'credits:1-3'
			}
		]
	}
];

const isFirstRender = typeof window === 'undefined';

interface Props {
	seedCourse?: TSeedCourse;
	previewImg?: string;
}

const HomePage: NextPage<Props> = props => {
	const toast = useToast();
	const toastRef = useRef<string | number>();
	const [seedCourse, setSeedCourse] = useState(props.seedCourse);
	const previousSeedCourse = usePrevious(seedCourse);
	const {uiState, apiState, basketState} = useStore();
	const searchBarRef = useRef<HTMLDivElement | null>(null);

	const handleScrollToTop = useCallback(() => {
		if (searchBarRef.current) {
			const y = searchBarRef.current.getBoundingClientRect().top + window.pageYOffset - 30;

			window.scrollTo({top: y, behavior: 'smooth'});
		}
	}, [searchBarRef]);

	const handleSearchChange = useCallback((newValue: string) => {
		uiState.setSearchValue(newValue);
	}, [uiState]);

	const handleQuerySave = useCallback(() => {
		basketState.addSearchQuery(uiState.searchValue);
	}, [uiState.searchValue]);

	useEffect(() => {
		if (seedCourse) {
			apiState.setSeedCourse(seedCourse);
			uiState.setSearchValue(`${seedCourse.course.subject}${seedCourse.course.crse}`);

			if (!toastRef.current) {
				toastRef.current = toast({
					title: 'Load Data',
					description: 'Only data for one course is loaded right now. Close this notification to load all data.',
					duration: null,
					isClosable: true,
					onCloseComplete: () => {
						setSeedCourse(undefined);
						window.history.pushState({}, document.title, '/');
					}
				});
			}
		} else {
			apiState.setSingleFetchEndpoints(['passfaildrop'], previousSeedCourse !== seedCourse);
			apiState.setRecurringFetchEndpoints(['courses', 'instructors', 'sections'], previousSeedCourse !== seedCourse);

			return () => {
				apiState.setSingleFetchEndpoints([]);
				apiState.setRecurringFetchEndpoints([]);
			};
		}
	}, [seedCourse, previousSeedCourse, toast]);

	return (
		<>
			{
				seedCourse ? (
					<NextSeo
						title={`${seedCourse.course.title} at Michigan Tech`}
						description={seedCourse.course.description ?? ''}
						openGraph={{
							type: 'website',
							title: `${seedCourse.course.title} at Michigan Tech`,
							description: seedCourse.course.description ?? '',
							images: props.previewImg ? [{
								url: props.previewImg
							}] : []
						}}
						twitter={{
							cardType: 'summary_large_image'
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
					</>
				)}
			</Head>

			<VStack spacing={12}>
				<SearchBar
					innerRef={searchBarRef}
					placeholder="Search by instructor, subject, section, or anything else..."
					isEnabled={apiState.hasDataForTrackedEndpoints}
					value={uiState.searchValue}
					onChange={handleSearchChange}
					onQuerySave={handleQuerySave}
				>
					<ModalContent p={8}>
						<ModalHeader>Filter Cheatsheet</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<VStack spacing={8} alignItems="flex-start">
								{
									FILTER_EXAMPLES.map(exampleGroup => (
										<VStack key={exampleGroup.label} alignItems="flex-start" w="100%" spacing={3}>
											<Heading size="sm">{exampleGroup.label}</Heading>

											{exampleGroup.examples.map(example => (
												<Box display="flex" key={example.label} w="100%">
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

				<CoursesTable onScrollToTop={handleScrollToTop}/>
			</VStack>

			<Basket/>

			<ErrorToaster/>
		</>
	);
};

// Use instead of getServerSideProps so next export still works.
// Only actually runs on server because we check for context.req.
// TODO: huh? if it's only running on the server why can't we use getServerSideProps...
HomePage.getInitialProps = async context => {
	if (context.query.share && context.req) {
		const shareable = decodeShareable(context.query.share as string);

		switch (shareable.type) {
			case 'SHARE_COURSE': {
				const [course, stats] = await Promise.all([
					API.findFirstCourse(shareable.data),
					API.getStats({crse: shareable.data.crse, subject: shareable.data.subject})
				]);

				if (course) {
					return {
						seedCourse: {course, stats},
						previewImg: getCoursePreviewUrl(course, context.req)
					};
				}

				break;
			}

			default:
				break;
		}
	}

	return {};
};

export default observer(HomePage);
