import React, {useEffect} from 'react';
import {GetServerSideProps} from 'next';
import {useRouter} from 'next/router';
import {NextSeo} from 'next-seo';
import useStore from 'src/lib/state/context';
import {decodeShareable} from 'src/lib/sharables';
import API, {IFindFirstCourseParameters} from 'src/lib/api';
import {getCoursePreviewUrl} from 'src/lib/preview-url';
import {CustomNextPage} from 'src/lib/types';
import {IFullCourseFromAPI} from 'src/lib/api-types';

interface Props {
	sharedCourse?: IFullCourseFromAPI;
	previewImg?: string;
}

const SharedPage: CustomNextPage<Props> = props => {
	const router = useRouter();
	const {uiState, apiState} = useStore();
	const {sharedCourse} = props;

	useEffect(() => {
		if (sharedCourse) {
			apiState.setSelectedTerm({
				semester: sharedCourse.semester,
				year: sharedCourse.year,
			});
			uiState.setSearchValue(`${sharedCourse.subject}${sharedCourse.crse}`);
		}

		void router.replace('/');
	}, [sharedCourse, router, apiState, uiState]);

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
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async context => {
	if (context.query.share && context.req) {
		const shareable = decodeShareable(context.query.share as string);

		switch (shareable.type) {
			case 'SHARE_COURSE': {
				let parameters: IFindFirstCourseParameters = {
					subject: shareable.data.subject,
					crse: shareable.data.crse,
				};
				if (!shareable.data.term.isFuture) {
					parameters = {
						...parameters,
						...shareable.data.term,
					};
				}

				const course = await API.findFirstCourse(parameters);

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

export default SharedPage;
