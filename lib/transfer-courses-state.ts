import {makeAutoObservable} from 'mobx';
import {RootState} from './state';

export class TransferCoursesState {
	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;
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

	get filteredCourses() {
		return this.rootState.apiState.transferCourses;
	}
}
