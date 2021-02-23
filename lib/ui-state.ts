import {makeAutoObservable} from 'mobx';
import lunr from 'lunr';
import {ArrayMap} from './arr-map';
import {ICourseFromAPI, ISectionFromAPI} from './types';
import {filterCourse, qualifiers} from './search-filters';
import {RootState} from './state';

const isNumeric = (string: string) => {
	return !Number.isNaN(string as unknown as number) && !Number.isNaN(Number.parseFloat(string));
};

export class UIState {
	searchValue = '';

	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;
	}

	get filteredSectionsByCourseId() {
		const map = new ArrayMap<ISectionFromAPI>();

		this.rootState.apiState.sections.forEach(section => {
			if (!section.deletedAt) {
				map.put(section.courseId, section);
			}
		});

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
						includeToken = false;
					}
				});
				return includeToken;
			})
			.join(' ');

		if (cleanedSearchValue !== '') {
			const preparedSearchValue = cleanedSearchValue.split(' ').map(s => {
				if (s.length > 4 && !isNumeric(s)) {
					return `${s}~2`;
				}

				return s;
			}).join(' ');

			const searchResult = this.courseLunr.search(preparedSearchValue);

			return searchResult.reduce<ICourseFromAPI[]>((accum, {ref}) => {
				const course = this.rootState.apiState.coursesById.get(ref);

				if (course && !course.deletedAt && filterCourse(searchPairs, course)) {
					accum.push(course);
				}

				return accum;
			}, []);
		}

		return this.rootState.apiState.courses
			.slice()
			.sort((a, b) => `${a.subject}${a.crse}`.localeCompare(`${b.subject}${b.crse}`))
			.filter(c => filterCourse(searchPairs, c));
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
				builder.add(instructor);
			});
		});
	}

	get courseLunr() {
		return lunr(builder => {
			builder.field('subject', {boost: 10});
			builder.field('crse', {boost: 10});
			builder.field('title');

			this.rootState.apiState.courses.forEach(course => {
				builder.add(course);
			});
		});
	}
}
