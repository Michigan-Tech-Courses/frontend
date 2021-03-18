import {makeAutoObservable, runInAction} from 'mobx';
import mergeByProperty from './merge-by-property';
import {RootState} from './state';
import {ESemester, ICourseFromAPI, IInstructorFromAPI, IPassFailDropFromAPI, ISectionFromAPI} from './types';

interface ISemesterFilter {
	semester: ESemester;
	year: number;
}

export class APIState {
	instructors: IInstructorFromAPI[] = [];
	passfaildrop: IPassFailDropFromAPI = {};
	sections: ISectionFromAPI[] = [];
	courses: ICourseFromAPI[] = [];
	loading = true;
	errors: Error[] = [];
	lastUpdatedAt: Date | null = null;

	availableSemesters: ISemesterFilter[] = [];
	selectedSemester?: ISemesterFilter;

	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;
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

	get keysLastUpdatedAt() {
		const reducer = (array: Array<{updatedAt: string; deletedAt: string | null}>) => array.reduce((maxDate, element) => {
			const date = element.deletedAt ? new Date(element.deletedAt) : new Date(element.updatedAt);

			return date > maxDate ? date : maxDate;
		}, new Date(0));

		return {
			instructors: reducer(this.instructors),
			courses: reducer(this.instructors),
			sections: reducer(this.sections)
		};
	}

	get dataLastUpdatedAt() {
		const dates = Object.values(this.keysLastUpdatedAt).sort((a, b) => b.getTime() - a.getTime());

		return dates[0];
	}

	get hasCourseData() {
		return this.courses.length > 0 && this.sections.length > 0;
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
		this.loading = true;

		const result = await (await fetch(new URL('/semesters', process.env.NEXT_PUBLIC_API_ENDPOINT).toString())).json();

		runInAction(() => {
			this.loading = false;
			this.availableSemesters = result;
		});
	}

	setSelectedSemester(semester: ISemesterFilter) {
		this.selectedSemester = semester;
		this.courses = [];
		this.sections = [];
		this.lastUpdatedAt = null;
	}

	// Poll for updates
	async revalidate() {
		performance.mark('start-revalidation');

		this.loading = true;

		let successfulHits = 0;

		const startedUpdatingAt = new Date();

		const promises: Array<Promise<void>> = [];
		const newErrors: Error[] = [];

		// Only load pass fail data once
		if (Object.keys(this.passfaildrop).length === 0) {
			promises.push((async () => {
				try {
					const url = new URL('/passfaildrop', process.env.NEXT_PUBLIC_API_ENDPOINT);

					const result = await (await fetch(url.toString())).json();

					runInAction(() => {
						this.passfaildrop = result;
					});
				} catch (error: unknown) {
					newErrors.push(error as Error);
				}
			})());
		}

		// Load courses, sections, instructors
		promises.push(...['courses', 'sections', 'instructors'].map(async key => {
			try {
				if (!this.selectedSemester) {
					successfulHits++;
					return;
				}

				const url = new URL(`/${key}`, process.env.NEXT_PUBLIC_API_ENDPOINT);

				if (['courses', 'sections'].includes(key)) {
					url.searchParams.append('semester', this.selectedSemester.semester);
					url.searchParams.append('year', this.selectedSemester.year.toString());
				}

				const keyLastUpdatedAt = this.keysLastUpdatedAt[key as 'courses' | 'sections' | 'instructors'];

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
						type DataKey = 'courses' | 'sections' | 'instructors';
						this[key as DataKey] = mergeByProperty<any, any>(this[key as DataKey], result, 'id');
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
