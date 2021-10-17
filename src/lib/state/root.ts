import {APIState} from './api';
import {AllBasketsState} from './baskets';
import {TransferCoursesState} from './transfer-courses';
import {UIState} from './ui';

export class RootState {
	public uiState!: UIState;
	public apiState!: APIState;
	public allBasketsState!: AllBasketsState;
	public transferCoursesState!: TransferCoursesState;

	constructor() {
		this.apiState = new APIState();
		this.uiState = new UIState(this);
		this.transferCoursesState = new TransferCoursesState(this);
		this.allBasketsState = new AllBasketsState(this.apiState);
	}
}
