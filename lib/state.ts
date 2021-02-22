import {APIState} from './api-state';
import {UIState} from './ui-state';

export class RootState {
	public uiState: UIState;
	public apiState: APIState;

	constructor() {
		this.uiState = new UIState(this);
		this.apiState = new APIState(this);
	}
}
