import {makeAutoObservable, reaction, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';
import mergeByProperty from '../merge-by-property';
import {
	ESemester,
	type IBuildingFromAPI,
	type ICourseFromAPI,
	type IInstructorFromAPI,
	type IPassFailDropFromAPI,
	type ISectionFromAPI,
	type ISectionFromAPIWithSchedule,
	type ITransferCourseFromAPI,
} from '../api-types';
import {Schedule} from '../rschedule';
import asyncRequestIdleCallback from '../async-request-idle-callback';
import {type IConcreteTerm, type IPotentialFutureTerm, type IVirtualTerm} from '../types';

type ENDPOINT = 'courses' | 'sections' | 'instructors' | 'transfer-courses' | 'passfaildrop' | 'buildings';
type DATA_KEYS = 'courses' | 'sections' | 'instructors' | 'transferCourses' | 'passfaildrop' | 'buildings';

const ENDPOINT_TO_KEY: Record<ENDPOINT, DATA_KEYS> = {
	courses: 'courses',
	sections: 'sections',
	instructors: 'instructors',
	'transfer-courses': 'transferCourses',
	passfaildrop: 'passfaildrop',
	buildings: 'buildings',
};

const VIRTUAL_TERMS: IVirtualTerm[] = [
	{
		semester: ESemester.SPRING,
		isFuture: true,
	},
	{
		semester: ESemester.SUMMER,
		isFuture: true,
	},
	{
		semester: ESemester.FALL,
		isFuture: true,
	},
];

export class APIState {
	instructors: IInstructorFromAPI[] = [];
	passfaildrop: IPassFailDropFromAPI = {};
	buildings: IBuildingFromAPI[] = [];
	sections: ISectionFromAPI[] = [];
	courses: ICourseFromAPI[] = [];
	transferCourses: ITransferCourseFromAPI[] = [];
	loading = false;
	errors: Error[] = [];
	lastUpdatedAt: Date | null = null;

	availableTerms: IConcreteTerm[] = [];
	selectedTerm?: IPotentialFutureTerm;

	singleFetchEndpoints: ENDPOINT[] = [];
	recurringFetchEndpoints: ENDPOINT[] = [];

	constructor() {
		makeAutoObservable(this, {}, {
			deep: false,
			proxy: false,
		});

		void makePersistable(this, {
			name: 'APIState',
			properties: ['selectedTerm'],
			storage: typeof window === 'undefined' ? undefined : window.localStorage,
		});

		reaction(
			() => this.selectedTerm,
			async () => {
				await this.revalidate();
			},
		);
	}

	get subjects() {
		const s = new Map<string, string>();

		for (const course of this.courses) {
			s.set(course.subject.toLowerCase(), course.subject.toLowerCase());
		}

		return [...s.keys()];
	}

	get coursesNotDeleted() {
		const courses = [];
		for (const course of this.courses) {
			if (!course.deletedAt) {
				courses.push(course);
			}
		}

		return courses;
	}

	get sectionsNotDeleted() {
		const sections = [];
		for (const section of this.sectionsWithParsedSchedules) {
			if (!section.deletedAt) {
				sections.push(section);
			}
		}

		return sections;
	}

	get sectionsWithParsedSchedules() {
		const sections = [];

		for (const section of this.sections) {
			sections.push({
				...section,
				parsedTime: Schedule.fromJSON(section.time),
			});
		}

		return sections;
	}

	get buildingsByName() {
		const map = new Map<IBuildingFromAPI['name'], IBuildingFromAPI>();

		for (const building of this.buildings) {
			map.set(building.name, building);
		}

		return map;
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
		const map = new Map<ISectionFromAPI['id'], ISectionFromAPIWithSchedule>();

		for (const s of this.sectionsWithParsedSchedules) {
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
			passfaildrop: new Date(0),
			buildings: new Date(0),
		};
	}

	get dataLastUpdatedAt() {
		const dates = Object.values(this.keysLastUpdatedAt).sort((a, b) => b.getTime() - a.getTime());

		return dates[0];
	}

	get hasDataForTrackedEndpoints() {
		if (!this.lastUpdatedAt) {
			return false;
		}

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

	get sortedTerms() {
		const termValueMap = {
			SPRING: 0.1,
			SUMMER: 0.2,
			FALL: 0.3,
		};

		return [
			...this.availableTerms.slice().sort((a, b) => (a.year + termValueMap[a.semester]) - (b.year + termValueMap[b.semester])),
			...VIRTUAL_TERMS,
		];
	}

	async getTerms() {
		const url = new URL('/semesters', process.env.NEXT_PUBLIC_API_ENDPOINT).toString();
		const result = await (await fetch(url)).json() as IConcreteTerm[];

		runInAction(() => {
			this.availableTerms = result;
		});
	}

	setSelectedTerm(term: IPotentialFutureTerm) {
		this.selectedTerm = term;
		this.courses = [];
		this.sections = [];
		this.lastUpdatedAt = null;
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

			this.availableTerms = [];
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

			this.availableTerms = [];
		}

		this.recurringFetchEndpoints = endpoints;
	}

	// Poll for updates
	async revalidate() {
		if (this.loading) {
			return;
		}

		await asyncRequestIdleCallback(async () => {
			performance.mark('start-revalidation');

			runInAction(() => {
				this.loading = true;
			});

			// Get semesters first
			if (this.availableTerms.length === 0 && (this.recurringFetchEndpoints.includes('courses') || this.recurringFetchEndpoints.includes('sections'))) {
				await this.getTerms();
				const semesters = this.sortedTerms;

				if (semesters && !this.selectedTerm) {
					const concreteSemesters = semesters.filter(s => !s.isFuture);
					this.setSelectedTerm(concreteSemesters.at(-2)!);
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

						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						const result = await (await fetch(url.toString())).json();

						runInAction(() => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
					let url = new URL(`/${path}`, process.env.NEXT_PUBLIC_API_ENDPOINT);

					if (['courses', 'sections'].includes(key)) {
						if (!this.selectedTerm) {
							successfulHits++;
							return;
						}

						if (this.selectedTerm.isFuture) {
							if (key === 'courses') {
								url = new URL(`/${path}/unique`, process.env.NEXT_PUBLIC_API_ENDPOINT);
								url.searchParams.append('startYear', (new Date().getFullYear() - 2).toString());
								url.searchParams.append('semester', this.selectedTerm.semester);
							} else if (key === 'sections') {
								successfulHits++;
								return;
							}
						} else {
							url.searchParams.append('semester', this.selectedTerm.semester);
							url.searchParams.append('year', this.selectedTerm.year.toString());
						}
					}

					const keyLastUpdatedAt = this.keysLastUpdatedAt[key];

					if (keyLastUpdatedAt && keyLastUpdatedAt.getTime() !== 0) {
						url.searchParams.append('updatedSince', keyLastUpdatedAt.toISOString());
					}

					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const result = await (await fetch(url.toString())).json();

					if (result.length > 0) {
						runInAction(() => {
							// Merge
							// Spent way too long trying to get TS to recognize this as valid...
							// YOLOing with any
							// Might be relevant: https://github.com/microsoft/TypeScript/issues/16756
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
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
		});
	}
}
