import {makeAutoObservable} from 'mobx';
import {RootState} from './state';

export class TransferCoursesState {
	private readonly rootState: RootState;

	constructor(rootState: RootState) {
		makeAutoObservable(this);

		this.rootState = rootState;
	}
}
