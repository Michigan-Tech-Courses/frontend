import {makeAutoObservable, runInAction} from 'mobx';
import lunr from 'lunr';
import {ArrayMap} from './arr-map';
import mergeByProperty from './merge-by-property';
import {ESemester, ICourseFromAPI, IInstructorFromAPI, IPassFailDropFromAPI, ISectionFromAPI} from './types';
import {filterCourse, qualifiers} from './search-filters';

const ENDPOINTS = ['/instructors', '/passfaildrop', '/sections', '/courses'];

interface ISemesterFilter {
	semester: ESemester;
	year: number;
}

const isNumeric = (string: string) => {
	return !Number.isNaN(string as unknown as number) && !Number.isNaN(Number.parseFloat(string));
};

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

	searchValue = '';

	constructor() {
		makeAutoObservable(this);
	}

	get filteredSectionsByCourseId() {
		const map = new ArrayMap<ISectionFromAPI>();

		this.sections.forEach(section => {
			if (!section.deletedAt) {
				map.put(section.courseId, section);
			}
		});

		return map;
	}

	get instructorsById() {
		const map = new Map<IInstructorFromAPI['id'], IInstructorFromAPI>();

		this.instructors.forEach(instructor => map.set(instructor.id, instructor));

		return map;
	}

	get coursesById() {
		const map = new Map<ICourseFromAPI['id'], ICourseFromAPI>();

		this.courses.forEach(course => map.set(course.id, course));

		return map;
	}

	get filteredCourses() {
		const searchPairExpr = /((\w*):([\w+]*))/g;
		const searchPairExprWithAtLeast2Characters = /((\w*):([\w+]{2,}))/g;

		const searchPairs: Array<[string, string]> = this.searchValue.match(searchPairExprWithAtLeast2Characters)?.map(s => s.split(':')) as Array<[string, string]> ?? [];
		const cleanedSearchValue = this.searchValue
			.replace(searchPairExpr, '')
			.replace(/[^A-Za-z\d" ]/g, '')
			.trim()
			.split(' ')
			.filter(token => {
				let includeToken = true;
				qualifiers.forEach(q => {
					if (q.includes(token)) {
						console.log('true');
						includeToken = false;
					}
				});
				return includeToken;
			})
			.join(' ');

		if (cleanedSearchValue !== '') {
			const preparedSearchValue = cleanedSearchValue.split(' ').map(s => {
				// Return s;
				if (s.length > 4 && !isNumeric(s)) {
					return `${s}~2`;
				}

				return s;
			}).join(' ');

			const searchResult = this.courseLunr.search(preparedSearchValue);

			return searchResult.reduce<ICourseFromAPI[]>((accum, {ref}) => {
				const course = this.coursesById.get(ref);

				if (course && !course.deletedAt && filterCourse(searchPairs, course)) {
					accum.push(course);
				}

				return accum;
			}, []);
		}

		return this.courses
			.slice()
			.sort((a, b) => `${a.subject}${a.crse}`.localeCompare(`${b.subject}${b.crse}`))
			.filter(c => filterCourse(searchPairs, c));
	}

	setSearchValue(value: string) {
		this.searchValue = value;
	}

	get dataLastUpdatedAt() {
		let date = new Date(0);

		const updateMaxDate = (({updatedAt}: {updatedAt: string}) => {
			const d = new Date(updatedAt);
			if (d > date) {
				date = d;
			}
		});

		this.instructors.forEach(i => {
			updateMaxDate(i);
		});
		this.courses.forEach(c => {
			updateMaxDate(c);
		});
		this.sections.forEach(s => {
			updateMaxDate(s);
		});

		return date;
	}

	get hasCourseData() {
		return this.courses.length > 0 && this.sections.length > 0;
	}

	// Search indices
	get instructorLunr() {
		return lunr(builder => {
			builder.field('fullName');
			builder.field('email');

			this.instructors.forEach(instructor => {
				builder.add(instructor);
			});
		});
	}

	get courseLunr() {
		return lunr(builder => {
			builder.field('subject', {boost: 10});
			builder.field('crse', {boost: 10});
			builder.field('title');

			this.courses.forEach(course => {
				builder.add(course);
			});
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
					runInAction(() => {
						this.errors = [...this.errors, error as Error];
					});
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

				if (this.lastUpdatedAt) {
					url.searchParams.append('updatedSince', this.lastUpdatedAt.toISOString());
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
				runInAction(() => {
					this.errors = [...this.errors, error as Error];
				});
			}
		}));

		// Wait for all calls to complete
		await Promise.all(promises);

		runInAction(() => {
			this.lastUpdatedAt = startedUpdatingAt;

			this.loading = false;

			if (successfulHits === ENDPOINTS.length) {
				this.errors = [];
			}
		});

		performance.mark('end-revalidation');
		performance.measure('Revalidated Data', 'start-revalidation', 'end-revalidation');
	}
}
