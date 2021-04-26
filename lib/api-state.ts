import {makeAutoObservable, runInAction} from 'mobx';
import mergeByProperty from './merge-by-property';
import {RootState} from './state';
import {ESemester, ICourseFromAPI, IFullCourseFromAPI, IInstructorFromAPI, IPassFailDropFromAPI, ISectionFromAPI, ITransferCourseFromAPI} from './types';

interface ISemesterFilter {
	semester: ESemester;
	year: number;
}

type ENDPOINT = 'courses' | 'sections' | 'instructors' | 'transfer-courses' | 'passfaildrop';
type DATA_KEYS = 'courses' | 'sections' | 'instructors' | 'transferCourses' | 'passfaildrop';

const ENDPOINT_TO_KEY: Record<ENDPOINT, DATA_KEYS> = {
	courses: 'courses',
	sections: 'sections',
	instructors: 'instructors',
	'transfer-courses': 'transferCourses',
	passfaildrop: 'passfaildrop'
};
export class APIState {
	instructors: IInstructorFromAPI[] = [];
	passfaildrop: IPassFailDropFromAPI = {};
	sections: ISectionFromAPI[] = [];
	courses: ICourseFromAPI[] = [];
	transferCourses: ITransferCourseFromAPI[] = [];
	loading = false;
	errors: Error[] = [];
	lastUpdatedAt: Date | null = null;

	availableSemesters: ISemesterFilter[] = [];
	selectedSemester?: ISemesterFilter;

	singleFetchEndpoints: ENDPOINT[] = [];
	recurringFetchEndpoints: ENDPOINT[] = [];

	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;
	}

	get subjects() {
		const s = new Map<string, string>();

		for (const course of this.courses) {
			s.set(course.subject.toLowerCase(), course.subject.toLowerCase());
		}

		return [...s.keys()];
	}

	get coursesNotDeleted() {
		return this.courses.filter(c => !c.deletedAt);
	}

	get sectionsNotDeleted() {
		return this.sections.filter(s => !s.deletedAt);
	}

	get instructorsById() {
		const map = new Map<IInstructorFromAPI['id'], IInstructorFromAPI>();

		for (const instructor of this.instructors) {
			map.set(instructor.id, instructor);
		}

		return map;
	}

	get courseById() {
		const map = new Map<ICourseFromAPI['id'], ICourseFromAPI>();

		for (const course of this.courses) {
			map.set(course.id, course);
		}

		return map;
	}

	get sectionById() {
		const map = new Map<ISectionFromAPI['id'], ISectionFromAPI>();

		for (const s of this.sections) {
			map.set(s.id, s);
		}

		return map;
	}

	get keysLastUpdatedAt(): Record<DATA_KEYS, Date> {
		const reducer = (array: Array<{updatedAt: string; deletedAt?: string | null}>) => array.reduce((maxDate, element) => {
			const prospectiveDates = [maxDate, new Date(element.updatedAt)];

			if (element.deletedAt) {
				prospectiveDates.push(new Date(element.deletedAt));
			}

			return prospectiveDates.sort((a, b) => b.getTime() - a.getTime())[0];
		}, new Date(0));

		return {
			instructors: reducer(this.instructors),
			courses: reducer(this.courses),
			sections: reducer(this.sections),
			transferCourses: reducer(this.transferCourses),
			passfaildrop: new Date(0)
		};
	}

	get dataLastUpdatedAt() {
		const dates = Object.values(this.keysLastUpdatedAt).sort((a, b) => b.getTime() - a.getTime());

		return dates[0];
	}

	get hasDataForTrackedEndpoints() {
		let hasData = true;

		for (const endpoint of [...this.singleFetchEndpoints, ...this.recurringFetchEndpoints]) {
			const currentDataForEndpoint = this[ENDPOINT_TO_KEY[endpoint]];

			if ((currentDataForEndpoint as Record<string, unknown>).constructor === Object) {
				hasData = Object.keys(currentDataForEndpoint).length > 0;
			}

			if ((currentDataForEndpoint as Record<string, unknown>).constructor === Array) {
				hasData = (currentDataForEndpoint as APIState[Exclude<DATA_KEYS, 'passfaildrop'>]).length > 0;
			}
		}

		return hasData;
	}

	get sortedSemesters() {
		const semesterValueMap = {
			SPRING: 0.1,
			SUMMER: 0.2,
			FALL: 0.3
		};

		return this.availableSemesters.slice().sort((a, b) => {
			return (a.year + semesterValueMap[a.semester]) - (b.year + semesterValueMap[b.semester]);
		});
	}

	async getSemesters() {
		const result = await (await fetch(new URL('/semesters', process.env.NEXT_PUBLIC_API_ENDPOINT).toString())).json();

		runInAction(() => {
			this.availableSemesters = result;
		});
	}

	setSelectedSemester(semester: ISemesterFilter) {
		this.selectedSemester = semester;
		this.courses = [];
		this.sections = [];
		this.lastUpdatedAt = null;
	}

	setSeedCourse(course: IFullCourseFromAPI) {
		this.courses = [course];
		this.selectedSemester = {semester: course.semester, year: course.year};
		this.availableSemesters = [{semester: course.semester, year: course.year}];
		this.sections = course.sections;
		this.instructors = course.sections.reduce<IInstructorFromAPI[]>((accum, section) => {
			for (const instructor of section.instructors) {
				if (!accum.some(i => i.id === instructor.id)) {
					accum.push({...instructor, thumbnailURL: null});
				}
			}

			return accum;
		}, []);
	}

	setSingleFetchEndpoints(endpoints: ENDPOINT[], shouldInvalidateData = false) {
		if (shouldInvalidateData) {
			for (const endpoint of endpoints) {
				if (Array.isArray(this[ENDPOINT_TO_KEY[endpoint]])) {
					(this[ENDPOINT_TO_KEY[endpoint]] as APIState[Exclude<DATA_KEYS, 'passfaildrop'>]) = [];
				} else {
					(this[ENDPOINT_TO_KEY[endpoint]] as APIState['passfaildrop']) = {};
				}
			}
		}

		this.singleFetchEndpoints = endpoints;
	}

	setRecurringFetchEndpoints(endpoints: ENDPOINT[], shouldInvalidateData = false) {
		if (shouldInvalidateData) {
			for (const endpoint of endpoints) {
				if (Array.isArray(this[ENDPOINT_TO_KEY[endpoint]])) {
					(this[ENDPOINT_TO_KEY[endpoint]] as APIState[Exclude<DATA_KEYS, 'passfaildrop'>]) = [];
				} else {
					(this[ENDPOINT_TO_KEY[endpoint]] as APIState['passfaildrop']) = {};
				}
			}
		}

		this.recurringFetchEndpoints = endpoints;
	}

	// Poll for updates
	async revalidate() {
		if (this.loading) {
			return;
		}

		performance.mark('start-revalidation');

		this.loading = true;

		// Get semesters first
		if (this.availableSemesters.length === 0 && (this.recurringFetchEndpoints.includes('courses') || this.recurringFetchEndpoints.includes('sections'))) {
			await this.getSemesters();
			const semesters = this.sortedSemesters;

			if (semesters) {
				this.setSelectedSemester(semesters[semesters.length - 1]);
			}
		}

		let successfulHits = 0;

		const startedUpdatingAt = new Date();

		const promises: Array<Promise<void>> = [];
		const newErrors: Error[] = [];

		promises.push(...this.singleFetchEndpoints.map(async endpoint => {
			const currentDataForEndpoint = this[ENDPOINT_TO_KEY[endpoint]];

			let shouldFetch = false;

			if ((currentDataForEndpoint as Record<string, unknown>).constructor === Object) {
				shouldFetch = Object.keys(currentDataForEndpoint).length === 0;
			}

			if ((currentDataForEndpoint as Record<string, unknown>).constructor === Array) {
				shouldFetch = (currentDataForEndpoint as APIState[Exclude<DATA_KEYS, 'passfaildrop'>]).length === 0;
			}

			if (shouldFetch) {
				try {
					const url = new URL(`/${endpoint}`, process.env.NEXT_PUBLIC_API_ENDPOINT);

					const result = await (await fetch(url.toString())).json();

					runInAction(() => {
						this[ENDPOINT_TO_KEY[endpoint]] = result;
					});
				} catch (error: unknown) {
					newErrors.push(error as Error);
				}
			}
		}));

		// Load courses, sections, instructors
		// eslint-disable-next-line unicorn/no-array-push-push
		promises.push(...this.recurringFetchEndpoints.map(async path => {
			const key = ENDPOINT_TO_KEY[path];

			try {
				const url = new URL(`/${path}`, process.env.NEXT_PUBLIC_API_ENDPOINT);

				if (['courses', 'sections'].includes(key)) {
					if (!this.selectedSemester) {
						successfulHits++;
						return;
					}

					url.searchParams.append('semester', this.selectedSemester.semester);
					url.searchParams.append('year', this.selectedSemester.year.toString());
				}

				const keyLastUpdatedAt = this.keysLastUpdatedAt[key];

				if (keyLastUpdatedAt && keyLastUpdatedAt.getTime() !== 0) {
					url.searchParams.append('updatedSince', keyLastUpdatedAt.toISOString());
				}

				const result = await (await fetch(url.toString())).json();

				if (result.length > 0) {
					runInAction(() => {
						// Merge
						// Spent way too long trying to get TS to recognize this as valid...
						// YOLOing with any
						// Might be relevant: https://github.com/microsoft/TypeScript/issues/16756
						this[key] = mergeByProperty<any, 'id'>(this[key] as any, result, 'id') as any;
					});
				}

				successfulHits++;
			} catch (error: unknown) {
				newErrors.push(error as Error);
			}
		}));

		// Wait for all calls to complete
		await Promise.all(promises);

		runInAction(() => {
			this.lastUpdatedAt = startedUpdatingAt;

			this.loading = false;

			if (newErrors.length > 0) {
				this.errors = newErrors;
			} else if (successfulHits === 3) {
				this.errors = [];
			}
		});

		performance.mark('end-revalidation');
		performance.measure('Revalidated Data', 'start-revalidation', 'end-revalidation');
	}
}
