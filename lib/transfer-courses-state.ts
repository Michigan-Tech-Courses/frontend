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
}
