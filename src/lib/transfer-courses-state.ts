import lunr from 'lunr';
import {autorun, computed, makeAutoObservable} from 'mobx';
import {RootState} from './state';
import {ITransferCourseFromAPI} from './api-types';

export class TransferCoursesState {
	searchValue = '';

	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this, {
			lunr: computed({requiresReaction: true, keepAlive: true}),
			courseByIdMap: computed({requiresReaction: true, keepAlive: true}),
		});

		this.rootState = rootState;

		// Pre-computes search index
		autorun(() => {
			if (!this.rootState.apiState.loading) {
				return this.lunr && this.courseByIdMap;
			}
		});
	}

	setSearchValue(newValue: string) {
		this.searchValue = newValue;
	}

	get hasData() {
		return this.rootState.apiState.transferCourses.length > 0;
	}

	get dataLastUpdatedAt() {
		let maxDate = new Date(0);

		for (const course of this.rootState.apiState.transferCourses) {
			const d = new Date(course.updatedAt);
			if (d > maxDate) {
				maxDate = d;
			}
		}

		return maxDate;
	}

	get filteredCourses(): ITransferCourseFromAPI[] {
		const cleanedSearchValue = this.searchValue
			.toLowerCase()
			.replace(/[^A-Za-z\d" ]/g, '')
			.trim();

		if (cleanedSearchValue === '') {
			return this.rootState.apiState.transferCourses.slice().sort((a, b) => a.fromCollege.localeCompare(b.fromCollege));
		}

		return this.lunr.search(cleanedSearchValue).map(({ref}) => this.courseByIdMap.get(ref)) as ITransferCourseFromAPI[];
	}

	get courseByIdMap() {
		const m = new Map<ITransferCourseFromAPI['id'], ITransferCourseFromAPI>();

		for (const course of this.rootState.apiState.transferCourses) {
			m.set(course.id, course);
		}

		return m;
	}

	get lunr() {
		return lunr(builder => {
			builder.field('title');
			builder.field('fromCollege');
			builder.field('fromCollegeState', {boost: 2});
			builder.field('fromSubject', {boost: 2});
			builder.field('fromCRSE');
			builder.field('toSubject');
			builder.field('toCRSE');

			builder.field('fromCourse', {
				extractor: doc => `${(doc as ITransferCourseFromAPI).fromSubject}${(doc as ITransferCourseFromAPI).fromCRSE}`,
			});

			builder.field('toCourse', {
				extractor: doc => `${(doc as ITransferCourseFromAPI).toSubject}${(doc as ITransferCourseFromAPI).toCRSE}`,
			});

			for (const section of this.rootState.apiState.transferCourses) {
				builder.add(section);
			}
		});
	}
}
