import {APIState} from './api-state';
import {TransferCoursesState} from './transfer-courses-state';
import {UIState} from './ui-state';

export class RootState {
	public uiState!: UIState;
	public apiState!: APIState;
	public transferCoursesState!: TransferCoursesState;

	constructor() {
		this.apiState = new APIState(this);
		this.uiState = new UIState(this);
		this.transferCoursesState = new TransferCoursesState(this);
	}
}
