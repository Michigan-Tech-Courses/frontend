import {APIState} from './api';
import {BasketState} from './basket';
import {TransferCoursesState} from './transfer-courses';
import {UIState} from './ui';

export class RootState {
	public uiState!: UIState;
	public apiState!: APIState;
	public basketState!: BasketState;
	public transferCoursesState!: TransferCoursesState;

	constructor() {
		this.apiState = new APIState();
		this.uiState = new UIState(this);
		this.transferCoursesState = new TransferCoursesState(this);
		this.basketState = new BasketState(this.apiState);
	}
}