import {autorun, computed, makeAutoObservable} from 'mobx';
import lunr from 'lunr';
import {ArrayMap} from '../arr-map';
import {type ICourseFromAPI, type ISectionFromAPI, type ISectionFromAPIWithSchedule} from '../api-types';
import {filterCourse, filterSection} from '../search-filters';
import requestIdleCallbackGuard from '../request-idle-callback-guard';
import parseSearchQuery from '../parse-search-query';
import {type RootState} from './root';

export type ICourseWithFilteredSections = {
	course: ICourseFromAPI;
	sections: {
		all: ISectionFromAPIWithSchedule[];
		filtered: ISectionFromAPIWithSchedule[];
		wasFiltered: boolean;
	};
};

const isNumeric = (string: string) => !Number.isNaN(string as unknown as number) && !Number.isNaN(Number.parseFloat(string));

export class UIState {
	searchValue = '';

	constructor(private readonly rootState: RootState) {
		makeAutoObservable(this, {
			sectionLunr: computed({requiresReaction: true, keepAlive: true}),
			instructorLunr: computed({requiresReaction: true, keepAlive: true}),
			courseLunr: computed({requiresReaction: true, keepAlive: true}),
			sectionsByInstructorId: computed({requiresReaction: true, keepAlive: true}),
			filteredCourses: computed({requiresReaction: true}),
		});

		// Pre-computes search indices (otherwise they're lazily computed, not a great experience when entering a query).
		// Normally we want to GC autorun handlers, but this will be kept alive for the entire lifecycle.
		autorun(async () => {
			if (!this.rootState.apiState.loading) {
				const _ = this.sectionLunr && this.instructorLunr && this.courseLunr && this.sectionsByInstructorId;
			}
		}, {scheduler: run => requestIdleCallbackGuard(run)});
	}

	get sectionsByCourseId() {
		const map = new ArrayMap<ISectionFromAPIWithSchedule>();

		for (const section of this.rootState.apiState.sectionsNotDeleted) {
			map.put(section.courseId, section);
		}

		return map;
	}

	get sectionsByInstructorId() {
		const map = new ArrayMap<ISectionFromAPI>();

		for (const section of this.rootState.apiState.sectionsNotDeleted) {
			for (const instructor of section.instructors) {
				map.put(instructor.id, section);
			}
		}

		return map;
	}

	// This looks scary. It is every bit as complex as it looks.
	get filteredCourses(): ICourseWithFilteredSections[] {
		const {cleanedSearchValue, searchPairs} = parseSearchQuery(this.searchValue);

		// Keeps track of course IDs that should be included in result set
		const courseScoresArray: Array<{id: ICourseFromAPI['id']; score: number | string}> = [];
		// Keeps track of filtered sections by course ID
		const filteredSections = new ArrayMap<ISectionFromAPI>();

		if (cleanedSearchValue === '') {
			// If fuzzy search is empty; default to all courses
			for (const c of this.rootState.apiState.coursesNotDeleted) {
				courseScoresArray.push({id: c.id, score: `${c.subject}${c.crse}`});
			}
		} else {
			// This block is the fun bit

			// Add fuzzy modifier to each word
			const preparedSearchValue = cleanedSearchValue.split(' ').map(s => {
				// ...as long as the word is longer than 4 characters and it's not a number
				if (s.length > 4 && !isNumeric(s)) {
					return `${s}~1`;
				}

				return s;
			}).join(' ');

			// Run search query against the 3 different indices and compute the final score of each course
			const courseScores: Record<string, number> = {};

			for (const result of this.instructorLunr.search(preparedSearchValue)) {
				for (const section of this.sectionsByInstructorId.get(Number.parseInt(result.ref, 10)) ?? []) {
					filteredSections.put(section.courseId, section, 'id');
					courseScores[section.courseId] = (courseScores[section.courseId] ?? 0) + result.score;
				}
			}

			for (const result of this.sectionLunr.search(preparedSearchValue)) {
				const section = this.rootState.apiState.sectionById.get(result.ref);

				if (!section) {
					continue;
				}

				filteredSections.put(section.courseId, section, 'id');

				courseScores[section.courseId] = (courseScores[section.courseId] ?? 0) + result.score;
			}

			const courseQuery = preparedSearchValue.split(' ').map(token => {
				if (this.rootState.apiState.subjects.includes(token)) {
					return `subject:${token}`;
				}

				return token;
			}).join(' ');

			for (const result of this.courseLunr.search(courseQuery)) {
				courseScores[result.ref] = (courseScores[result.ref] ?? 0) + result.score;
			}

			// Move scores to parent-scoped array
			for (const courseId in courseScores) {
				if (Object.prototype.hasOwnProperty.call(courseScores, courseId)) {
					courseScoresArray.push({id: courseId, score: courseScores[courseId]});
				}
			}
		}

		return courseScoresArray
			// Sort so it's in either
			// (a) alphabetical value (when query is empty or is only qualifier:token pairs)
			// (b) relevancy value (when query contains words)
			.sort((a, b) => {
				if (typeof a.score === 'string') {
					return a.score.localeCompare(b.score as string);
				}

				return (b.score as number) - a.score;
			})
			// For each course ID
			.reduce<ICourseWithFilteredSections[]>((accum, {id}) => {
			// Get course
			const course = this.rootState.apiState.courseById.get(id)!;

			// Get sections for course
			const sections = this.sectionsByCourseId.get(id) ?? [];

			// Two types of filtered sections:
			// (a) qualifier filtered: sections filtered with qualifier:token
			// (b) query filtered: sections filtered with words
			const qualifierFilteredSections = [];
			if (this.rootState.allBasketsState.currentBasket) {
				for (const section of sections) {
					qualifierFilteredSections.push(filterSection(searchPairs, section, this.rootState.allBasketsState.currentBasket.isSectionScheduleCompatibleMap));
				}
			}

			const queryFilteredSections = filteredSections.get(id) ?? [];

			let wereSectionsFiltered = filteredSections.get(id) !== null;
			const mergedFilteredSections: ISectionFromAPIWithSchedule[] = [];

			// Merge sections filtered by qualifiers and query
			for (const [i, filterResult] of qualifierFilteredSections.entries()) {
				if (filterResult === 'MATCHED' || filterResult === 'REMOVE') {
					wereSectionsFiltered = true;
				}

				const section = sections[i];

				if (filterResult !== 'REMOVE') {
					if (queryFilteredSections.length > 0 && !queryFilteredSections.some(s => s.id === section.id)) {
						continue;
					}

					mergedFilteredSections.push(section);
				}
			}

			// Don't push course if all sections are filtered out, check qualifiers on course
			if (!(wereSectionsFiltered && mergedFilteredSections.length === 0) && filterCourse(searchPairs, course)) {
				accum.push({
					course,
					sections: {
						all: this.sectionsByCourseId.get(id)?.sort((a, b) => a.section.localeCompare(b.section)) ?? [],
						filtered: mergedFilteredSections.sort((a, b) => a.section.localeCompare(b.section)),
						wasFiltered: wereSectionsFiltered,
					},
				});
			}

			return accum;
		}, []);
	}

	setSearchValue(value: string) {
		this.searchValue = value;
	}

	// Search indices
	get instructorLunr() {
		return lunr(builder => {
			builder.field('fullName');
			builder.field('email');

			for (const instructor of this.rootState.apiState.instructors) {
				if (!instructor.deletedAt) {
					builder.add(instructor);
				}
			}
		});
	}

	get courseLunr() {
		return lunr(builder => {
			builder.field('subject', {boost: 5});
			builder.field('crse', {boost: 10});
			builder.field('title', {boost: 6});

			for (const course of this.rootState.apiState.coursesNotDeleted) {
				builder.add(course);
			}
		});
	}

	get sectionLunr() {
		return lunr(builder => {
			builder.field('crn');
			builder.field('section');
			builder.field('id');

			for (const section of this.rootState.apiState.sectionsNotDeleted) {
				builder.add(section);
			}
		});
	}
}
