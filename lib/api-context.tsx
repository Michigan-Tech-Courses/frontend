import {useState, useEffect, createContext, useContext, useCallback, useMemo} from 'react';
import {Except} from 'type-fest';
import useWindowFocus from './use-window-focus';
import useInterval from './use-interval';
import {ICourseFromAPI, IInstructorFromAPI, IPassFailDropFromAPI, ISectionFromAPI} from './types';
import mergeByProperty from './merge-by-property';
import {ArrayMap} from './arr-map';

interface IAPIData {
	instructors: IInstructorFromAPI[];
	passfaildrop: IPassFailDropFromAPI;
	sections: ISectionFromAPI[];
	courses: ICourseFromAPI[];
}

const ENDPOINTS: Array<{url: string; key: keyof IAPIData}> = [
	{
		url: '/instructors',
		key: 'instructors'
	},
	{
		url: '/passfaildrop',
		key: 'passfaildrop'
	},
	{
		url: '/sections',
		key: 'sections'
	},
	{
		url: '/courses',
		key: 'courses'
	}
];

const useAPISingleton = () => {
	const [errors, setErrors] = useState<Error[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<IAPIData | null>(null);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

	const [shouldRefetchAtInterval, setShouldRefetchAtInterval] = useState(true);

	const revalidate = async () => {
		setIsLoading(true);
		let successfulHits = 0;

		// Don't need to update everything
		const endpointsToProcess = ENDPOINTS.filter(endpoint => !(endpoint.url === '/passfaildrop' && data?.passfaildrop));

		const startedUpdatingAt = new Date();

		const results = await Promise.all(endpointsToProcess.map(async ({url, key}) => {
			try {
				const u = new URL(url, process.env.NEXT_PUBLIC_API_ENDPOINT);

				if (lastUpdatedAt) {
					u.searchParams.append('updatedSince', (lastUpdatedAt).toISOString());
				}

				const result = await (await fetch(u.toString())).json();

				successfulHits++;

				return {result, key};
			} catch (error: unknown) {
				setErrors(currentErrors => [...currentErrors, error as Error]);
			}
		}));

		// Can't do new Date() directly here because of race condition
		setLastUpdatedAt(startedUpdatingAt);

		// Transform array to object
		// Only update state if at least one endpoint changed
		// TODO: can be further optimized by breaking out each key into a seperate state var
		if (results.some(r => r?.result.constructor === Object || r?.result.length !== 0)) {
			const keyedResults = results.reduce<IAPIData>((accum, result) => {
				const key: keyof IAPIData = result?.key!;
				const existingValue = accum[key]!;

				if (key === 'passfaildrop') {
					accum[key] = result?.result;
				} else {
					// Merge
					// Spent way too long trying to get TS to recognize this as valid...
					// YOLOing with any
					// Might be relevant: https://github.com/microsoft/TypeScript/issues/16756
					accum[key] = mergeByProperty<any, any>(existingValue as IAPIData[keyof Except<IAPIData, 'passfaildrop'>], result?.result, 'id');
				}

				return accum;
			}, data ? data : {instructors: [], passfaildrop: {}, sections: [], courses: []});

			setData(keyedResults);
		}

		setIsLoading(false);

		if (successfulHits === ENDPOINTS.length) {
			setErrors([]);
		}
	};

	useWindowFocus({
		onFocus: useCallback(() => {
			setShouldRefetchAtInterval(true);
			void revalidate();
		}, [revalidate]),
		onBlur: useCallback(() => {
			setShouldRefetchAtInterval(false);
		}, [])
	});

	useEffect(() => {
		// Called once upon mount
		void revalidate();
	}, []);

	useInterval(
		async () => revalidate(),
		shouldRefetchAtInterval ? 3000 : null
	);

	const sectionsByCourseId = useMemo(() => {
		const map = new ArrayMap<ISectionFromAPI>();

		data?.sections.forEach(section => {
			map.put(section.courseId, section);
		});

		return map;
	}, [data?.sections]);

	const instructorsById = useMemo(() => {
		const map = new Map<IInstructorFromAPI['id'], IInstructorFromAPI>();

		data?.instructors.forEach(instructor => {
			map.set(instructor.id, instructor);
		});

		return map;
	}, [data?.instructors]);

	return {data, sectionsByCourseId, instructorsById, errors, isLoading, lastUpdatedAt};
};

const APIContext = createContext<ReturnType<typeof useAPISingleton>>({data: null, errors: [], isLoading: true, lastUpdatedAt: null, sectionsByCourseId: new ArrayMap<ISectionFromAPI>(), instructorsById: new Map()});

export const APIProvider = ({children}: {children: JSX.Element | JSX.Element[]}) => {
	const result = useAPISingleton();

	return (
		<APIContext.Provider value={result}>
			{children}
		</APIContext.Provider>
	);
};

export const useAPI = () => useContext(APIContext);
