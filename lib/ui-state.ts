import {autorun, makeAutoObservable} from 'mobx';
import lunr from 'lunr';
import {ArrayMap} from './arr-map';
import {ICourseFromAPI, ISectionFromAPI} from './types';
import {filterCourse, qualifiers} from './search-filters';
import {RootState} from './state';

export type ICourseWithFilteredSections = ICourseFromAPI & {
	sections: {
		all: ISectionFromAPI[];
		filtered: ISectionFromAPI[];
		wasFiltered: boolean;
	};
};

const isNumeric = (string: string) => {
	return !Number.isNaN(string as unknown as number) && !Number.isNaN(Number.parseFloat(string));
};

export class UIState {
	searchValue = '';

	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;

		// Pre-computes search indices (otherwise they're lazily computed, not a great experience when entering a query).
		// Normally we want to GC autorun handlers, but this will be kept alive for the entire lifecycle.
		autorun(() => {
			return this.sectionLunr && this.instructorLunr && this.courseLunr;
		});
	}

	get sectionsByCourseId() {
		const map = new ArrayMap<ISectionFromAPI>();

		this.rootState.apiState.sections.forEach(section => {
			if (!section.deletedAt) {
				map.put(section.courseId, section);
			}
		});

		return map;
	}

	get sectionsByInstructorId() {
		const map = new ArrayMap<ISectionFromAPI>();

		this.rootState.apiState.sections.forEach(section => {
			if (!section.deletedAt) {
				section.instructors.forEach(instructor => {
					map.put(instructor.id, section);
				});
			}
		});

		return map;
	}

	get filteredCourses(): ICourseWithFilteredSections[] {
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
						includeToken = false;
					}
				});
				return includeToken;
			})
			.join(' ');

		if (cleanedSearchValue !== '') {
			const preparedSearchValue = cleanedSearchValue.split(' ').map(s => {
				if (s.length > 4 && !isNumeric(s)) {
					return `${s}~1`;
				}

				return s;
			}).join(' ');

			const courseScores: Record<string, number> = {};

			const filteredSections = new ArrayMap<ISectionFromAPI>();

			this.instructorLunr.search(preparedSearchValue).forEach(result => {
				this.sectionsByInstructorId.get(Number.parseInt(result.ref, 10))?.forEach(section => {
					filteredSections.put(section.courseId, section, 'id');
					courseScores[section.courseId] = (courseScores[section.courseId] ?? 0) + result.score;
				});
			});

			this.sectionLunr.search(preparedSearchValue).forEach(result => {
				const section = this.rootState.apiState.sectionById.get(result.ref);

				if (!section) {
					return;
				}

				filteredSections.put(section.courseId, section, 'id');

				courseScores[section.courseId] = (courseScores[section.courseId] ?? 0) + result.score;
			});

			this.courseLunr.search(preparedSearchValue).forEach(result => {
				courseScores[result.ref] = (courseScores[result.ref] ?? 0) + result.score;
			});

			const courseScoresArray = [];

			for (const courseId in courseScores) {
				if (Object.prototype.hasOwnProperty.call(courseScores, courseId)) {
					courseScoresArray.push({id: courseId, score: courseScores[courseId]});
				}
			}

			return courseScoresArray
				.sort((a, b) => b.score - a.score)
				.map(({id}) => {
					const course = this.rootState.apiState.courseById.get(id)!;

					return {
						...course,
						sections: {
							all: this.sectionsByCourseId.get(id) ?? [],
							filtered: filteredSections.get(id) ?? [],
							wasFiltered: filteredSections.get(id) !== null
						}
					};
				});
		}

		return this.rootState.apiState.courses
			.slice()
			.sort((a, b) => `${a.subject}${a.crse}`.localeCompare(`${b.subject}${b.crse}`))
			.filter(c => filterCourse(searchPairs, c))
			.map(c => {
				const sections = (this.sectionsByCourseId.get(c.id) ?? []);

				return {
					...c,
					sections: {
						all: sections,
						filtered: sections,
						wasFiltered: false
					}
				};
			});
	}

	setSearchValue(value: string) {
		this.searchValue = value;
	}

	// Search indices
	get instructorLunr() {
		return lunr(builder => {
			builder.field('fullName');
			builder.field('email');

			this.rootState.apiState.instructors.forEach(instructor => {
				if (!instructor.deletedAt) {
					builder.add(instructor);
				}
			});
		});
	}

	get courseLunr() {
		return lunr(builder => {
			builder.field('subject', {boost: 10});
			builder.field('crse', {boost: 10});
			builder.field('title');

			this.rootState.apiState.courses.forEach(course => {
				if (!course.deletedAt) {
					builder.add(course);
				}
			});
		});
	}

	get sectionLunr() {
		return lunr(builder => {
			builder.field('crn');
			builder.field('section');

			this.rootState.apiState.sections.forEach(section => {
				if (!section.deletedAt) {
					builder.add(section);
				}
			});
		});
	}
}
