import {APIState} from './api-state';
import {BasketState} from './basket-state';
import {TransferCoursesState} from './transfer-courses-state';
import {UIState} from './ui-state';

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
