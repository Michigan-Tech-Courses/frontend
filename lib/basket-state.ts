import {makeAutoObservable} from 'mobx';
import {makePersistable} from 'mobx-persist-store';
import {APIState} from './api-state';
import {ICourseFromAPI, ISectionFromAPI} from './types';

export class BasketState {
	sectionIds: Array<ISectionFromAPI['id']> = [];
	private readonly apiState: APIState;

	constructor(apiState: APIState) {
		makeAutoObservable(this);

		void makePersistable(this, {
			name: 'Basket',
			properties: ['sectionIds'],
			storage: typeof window === 'undefined' ? undefined : window.localStorage
		});

		this.apiState = apiState;
	}

	addSection(id: ISectionFromAPI['id']) {
		if (!this.sectionIds.includes(id)) {
			this.sectionIds.push(id);
		}
	}

	removeSection(id: ISectionFromAPI['id']) {
		this.sectionIds = this.sectionIds.filter(i => i !== id);
	}

	hasSection(id: ISectionFromAPI['id']) {
		return this.sectionIds.includes(id);
	}

	get sections() {
		// TODO: handle if section was removed
		return this.sectionIds.reduce<Array<ISectionFromAPI & {course: ICourseFromAPI}>>((accum, id) => {
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
}
