import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';
import {trackUndo} from 'mobx-shallow-undo';
import {getFormattedTimeFromSchedule} from '../components/sections-table/time-display';
import {APIState} from './api-state';
import doSchedulesConflict from './do-schedules-conflict';
import getCreditsString from './get-credits-str';
import {ICourseFromAPI, IInstructorFromAPI, ISectionFromAPI, ISectionFromAPIWithSchedule} from './types';

export class BasketState {
	name = 'Basket';
	sectionIds: Array<ISectionFromAPI['id']> = [];
	searchQueries: string[] = [];
	private readonly apiState: APIState;
	private undoRedo?: ReturnType<typeof trackUndo>;

	constructor(apiState: APIState) {
		makeAutoObservable(this);

		void makePersistable(this, {
			name: 'Basket',
			properties: ['sectionIds', 'searchQueries'],
			storage: typeof window === 'undefined' ? undefined : window.localStorage
		}).then(() => {
			this.undoRedo = trackUndo(
				() => ({
					sectionIds: this.sectionIds,
					searchQueries: this.searchQueries
				}), value => {
					this.sectionIds = value.sectionIds;
					this.searchQueries = value.searchQueries;
				});
		});

		this.apiState = apiState;
	}

	/** Returns true if state ends up changing. */
	undoLastAction() {
		const lastSectionIds = this.sectionIds;
		const lastSearchQueries = this.searchQueries;
		this.undoRedo?.undo();
		if (lastSectionIds !== this.sectionIds || lastSearchQueries !== this.searchQueries) {
			return true;
		}

		return false;
	}

	/** Returns true if state ends up changing. */
	redoLastAction() {
		const lastSectionIds = this.sectionIds;
		const lastSearchQueries = this.searchQueries;
		this.undoRedo?.redo();
		if (lastSectionIds !== this.sectionIds || lastSearchQueries !== this.searchQueries) {
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

	get numOfItems() {
		return this.sectionIds.length + this.searchQueries.length;
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

	get isSectionScheduleCompatibleMap() {
		const map = new Map<ISectionFromAPI['id'], boolean>();

		for (const section of this.apiState.sectionsWithParsedSchedules) {
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
			}

			map.set(section.id, !doOverlap);
		}

		return map;
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
