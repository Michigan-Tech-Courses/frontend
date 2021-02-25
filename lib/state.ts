import {APIState} from './api-state';
import {UIState} from './ui-state';

export class RootState {
	public uiState: UIState;
	public apiState: APIState;

	constructor() {
		this.apiState = new APIState(this);
		this.uiState = new UIState(this);
	}
}
