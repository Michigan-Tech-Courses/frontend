import {nanoid} from 'nanoid';
import {autorun, makeAutoObservable, runInAction} from 'mobx';
import {trackUndo} from 'mobx-shallow-undo';
import {getFormattedTimeFromSchedule} from 'src/components/sections-table/time-display';
import doSchedulesConflict from '../do-schedules-conflict';
import getCreditsString from '../get-credits-str';
import {ICourseFromAPI, IInstructorFromAPI, ISectionFromAPI, ISectionFromAPIWithSchedule} from '../api-types';
import requestIdleCallbackGuard from '../request-idle-callback-guard';
import parseSearchQuery from '../parse-search-query';
import parseCreditsFilter from '../parse-credits-filter';
import {IPotentialFutureSemester, WritableKeys} from '../types';
import {APIState} from './api';

export class BasketState {
	id = nanoid();
	name: string;
	forSemester: IPotentialFutureSemester;
	sectionIds: Array<ISectionFromAPI['id']> = [];
	courseIds: Array<ICourseFromAPI['id']> = [];
	searchQueries: string[] = [];
	isSectionScheduleCompatibleMap = new Map<ISectionFromAPI['id'], boolean>();
	private readonly apiState: APIState;
	private readonly undoRedo?: ReturnType<typeof trackUndo>;

	constructor(apiState: APIState, semester: IPotentialFutureSemester, name: string, json?: Partial<BasketState>) {
		this.undoRedo = trackUndo(
			() => ({
				sectionIds: this.sectionIds,
				courseIds: this.courseIds,
				searchQueries: this.searchQueries,
			}), value => {
				this.sectionIds = value.sectionIds;
				this.courseIds = value.courseIds;
				this.searchQueries = value.searchQueries;
			});

		this.apiState = apiState;
		this.forSemester = semester;
		this.name = name;

		// Deseralizeable properties
		if (json?.id) {
			this.id = json.id;
		}

		if (json?.name) {
			this.name = json.name;
		}

		if (json?.forSemester) {
			this.forSemester = json.forSemester;
		}

		if (json?.sectionIds) {
			this.sectionIds = json.sectionIds;
		}

		if (json?.courseIds) {
			this.courseIds = json.courseIds;
		}

		if (json?.searchQueries) {
			this.searchQueries = json.searchQueries;
		}

		makeAutoObservable(this, {}, {
			deep: false,
			proxy: false,
		});

		autorun(() => {
			const {
				sectionsWithParsedSchedules,
			} = this.apiState;

			// This is expensive so we update it here as a property rather than a computed getter.
			const map = new Map<ISectionFromAPI['id'], boolean>();
			for (const section of sectionsWithParsedSchedules) {
				let doOverlap = false;

				if (section.parsedTime) {
					for (const {parsedTime} of this.sections) {
						if (!parsedTime) {
							continue;
						}

						doOverlap = doSchedulesConflict(section.parsedTime, parsedTime);

						if (doOverlap) {
							break;
						}
					}

					map.set(section.id, !doOverlap);
				}
			}

			runInAction(() => {
				this.isSectionScheduleCompatibleMap = map;
			});
		}, {scheduler: run => requestIdleCallbackGuard(run)});
	}

	static serialize(fromData: Partial<BasketState>) {
		const properties: Array<WritableKeys<BasketState>> = [
			'id',
			'name',
			'forSemester',
			'sectionIds',
			'courseIds',
			'searchQueries',
		];

		const serializeResult: Partial<Pick<BasketState, WritableKeys<BasketState>>> = {};

		for (const p of properties) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			serializeResult[p] = fromData[p] as any;
		}

		return serializeResult;
	}

	/** Returns true if state ends up changing. */
	undoLastAction() {
		const lastSectionIds = this.sectionIds;
		const lastSearchQueries = this.searchQueries;
		const lastCourseIds = this.courseIds;

		this.undoRedo?.undo();

		if (
			lastSectionIds !== this.sectionIds
			|| lastSearchQueries !== this.searchQueries
			|| lastCourseIds !== this.courseIds) {
			return true;
		}

		return false;
	}

	/** Returns true if state ends up changing. */
	redoLastAction() {
		const lastSectionIds = this.sectionIds;
		const lastSearchQueries = this.searchQueries;
		const lastCourseIds = this.courseIds;

		this.undoRedo?.redo();

		if (
			lastSectionIds !== this.sectionIds
			|| lastSearchQueries !== this.searchQueries
			|| lastCourseIds !== this.courseIds) {
			return true;
		}

		return false;
	}

	addSearchQuery(query: string) {
		// Don't add duplicates
		if (!this.searchQueries.includes(query)) {
			this.searchQueries = [...this.searchQueries, query];
		}
	}

	removeSearchQuery(query: string) {
		this.searchQueries = this.searchQueries.filter(q => q !== query);
	}

	addSection(id: ISectionFromAPI['id']) {
		if (!this.sectionIds.includes(id)) {
			this.sectionIds = [...this.sectionIds, id];
		}
	}

	removeSection(id: ISectionFromAPI['id']) {
		this.sectionIds = this.sectionIds.filter(i => i !== id);
	}

	hasSection(id: ISectionFromAPI['id']) {
		return this.sectionIds.includes(id);
	}

	addCourse(id: ICourseFromAPI['id']) {
		if (!this.courseIds.includes(id)) {
			this.courseIds = [...this.courseIds, id];
		}
	}

	removeCourse(id: ICourseFromAPI['id']) {
		this.courseIds = this.courseIds.filter(i => i !== id);
	}

	hasCourse(id: ICourseFromAPI['id']) {
		return this.courseIds.includes(id);
	}

	setName(newName: string) {
		this.name = newName;
	}

	get numOfItems() {
		return this.sectionIds.length + this.searchQueries.length + this.courseIds.length;
	}

	get sections() {
		// TODO: handle if section was removed
		return this.sectionIds.reduce<Array<ISectionFromAPIWithSchedule & {course: ICourseFromAPI}>>((accum, id) => {
			const section = this.apiState.sectionById.get(id);

			if (!section) {
				return accum;
			}

			const course = this.apiState.courseById.get(section.courseId);

			if (!course) {
				return accum;
			}

			accum.push({...section, course});
			return accum;
		}, []);
	}

	get courses() {
		return this.courseIds.reduce<ICourseFromAPI[]>((accum, id) => {
			const course = this.apiState.courseById.get(id);

			if (!course) {
				return accum;
			}

			return [...accum, course];
		}, []);
	}

	get parsedQueries(): Array<{query: string; credits?: [number, number]}> {
		return this.searchQueries.map(query => {
			const {searchPairs} = parseSearchQuery(query);
			const creditsFilter = searchPairs.find(([token]) => token === 'credits');

			if (creditsFilter) {
				const [,creditsString] = creditsFilter;
				const [min, max] = parseCreditsFilter(creditsString);

				if (!Number.isNaN(min) && !Number.isNaN(max)) {
					return {
						query,
						credits: [min, max],
					};
				}
			}

			return {query};
		});
	}

	get totalCredits(): [number, number] {
		let minCredits = 0;
		let maxCredits = 0;

		for (const section of this.sections) {
			minCredits += section.minCredits;
			maxCredits += section.maxCredits;
		}

		for (const course of this.courses) {
			minCredits += course.credits ?? 0;
			maxCredits += course.credits ?? 0;
		}

		for (const {credits: creditsForQuery} of this.parsedQueries) {
			if (creditsForQuery) {
				minCredits += creditsForQuery[0];
				maxCredits += creditsForQuery[1] === Number.MAX_SAFE_INTEGER ? 4 : creditsForQuery[1];
			}
		}

		return [minCredits, maxCredits];
	}

	get sectionsInBasketThatConflict() {
		const conflicts = [];
		for (let i = 0; i < this.sections.length; i++) {
			for (let j = i + 1; j < this.sections.length; j++) {
				const firstSection = this.sections[i];
				const secondSection = this.sections[j];

				if (!firstSection.parsedTime || !secondSection.parsedTime) {
					continue;
				}

				if (doSchedulesConflict(firstSection.parsedTime, secondSection.parsedTime)) {
					conflicts.push([firstSection, secondSection]);
				}
			}
		}

		return conflicts;
	}

	get doesSectionInBasketConflictMap() {
		const map = new Map<ISectionFromAPI['id'], true>();

		for (const [first, second] of this.sectionsInBasketThatConflict) {
			map.set(first.id, true);
			map.set(second.id, true);
		}

		return map;
	}

	get warnings() {
		return this.sectionsInBasketThatConflict.map(([firstSection, secondSection]) => `${firstSection.course.subject}${firstSection.course.crse} ${firstSection.section} conflicts with ${secondSection.course.subject}${secondSection.course.crse} ${secondSection.section}`);
	}

	toTSV() {
		let content = 'Title	Section	Instructors	Schedule	CRN	Credits\n';

		const getInstructorsString = (instructors: Array<{id: IInstructorFromAPI['id']}>) => instructors.map(({id}) => this.apiState.instructorsById.get(id)?.fullName).join(', ');

		for (const section of this.sections) {
			let timeString = '';

			if (section.parsedTime) {
				const {days, time} = getFormattedTimeFromSchedule(section.parsedTime);

				timeString = `${days} ${time}`;
			}

			content += `${section.course.title}	${section.section}	${getInstructorsString(section.instructors)}	${timeString}	${section.crn}	${getCreditsString(section.minCredits, section.maxCredits)}\n`;
		}

		for (const query of this.searchQueries) {
			content += `${query}      \n`;
		}

		return content;
	}
}
