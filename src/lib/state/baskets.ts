import {autorun, makeAutoObservable, runInAction} from 'mobx';
import {makePersistable, StorageController} from 'mobx-persist-store';
import areTermsEqual from '../are-terms-equal';
import toTitleCase from '../to-title-case';
import {IPotentialFutureTerm} from '../types';
import {APIState} from './api';
import {BasketState} from './basket';

type SerializedData = Partial<Pick<AllBasketsState, 'baskets' | 'selectedBasketIdForTerm'>>;

const storageController = (apiState: APIState): StorageController => ({
	getItem: <T>(key: string) => {
		const stringifiedData = window.localStorage.getItem(key);
		if (!stringifiedData) {
			return null;
		}

		const data = JSON.parse(stringifiedData) as SerializedData;

		const parsed = {
			...data,
			baskets: data.baskets?.map((parsedBasket: Partial<BasketState> & Pick<BasketState, 'forTerm'>) => new BasketState(apiState, parsedBasket.forTerm, '', parsedBasket)) ?? [],
			// Gotta manually deserialize Map
			selectedBasketIdForTerm: new Map(data.selectedBasketIdForTerm ?? []),
		};

		return parsed as unknown as T;
	},
	setItem: (key, data: SerializedData) => {
		window.localStorage.setItem(key, JSON.stringify({
			...data,
			baskets: data.baskets?.map(basket => BasketState.serialize(basket)) ?? [],
			// Gotta manually serialize Map
			selectedBasketIdForTerm: data.selectedBasketIdForTerm ? Array.from(data.selectedBasketIdForTerm.entries()) : [],
		}));
	},
	removeItem: key => {
		window.localStorage.removeItem(key);
	},
});

export class AllBasketsState {
	baskets: BasketState[] = [];
	selectedBasketIdForTerm = new Map<string, string>();

	private readonly apiState: APIState;

	constructor(apiState: APIState) {
		this.apiState = apiState;

		makeAutoObservable(this);

		void makePersistable(this, {
			name: 'Baskets',
			properties: ['baskets', 'selectedBasketIdForTerm'],
			stringify: false,
			storage: typeof window === 'undefined' ? undefined : storageController(apiState),
		});

		// Automatically set/change basket when switching terms (and on first load)
		autorun(() => {
			const {selectedTerm} = this.apiState;

			if (!selectedTerm) {
				return;
			}

			runInAction(() => {
				// Check if we have a basket for this term in history
				let lastViewedBasketIdForThisTerm = this.selectedBasketIdForTerm.get(JSON.stringify(selectedTerm));
				// Map might have old data
				if (!this.baskets.some(b => b.id === lastViewedBasketIdForThisTerm)) {
					lastViewedBasketIdForThisTerm = undefined;
					this.selectedBasketIdForTerm.delete(JSON.stringify(selectedTerm));
				}

				if (lastViewedBasketIdForThisTerm // Check if basket was deleted
					&& this.baskets.some(b => b.id === this.selectedBasketId)) {
					this.setSelectedBasket(lastViewedBasketIdForThisTerm);
					return;
				}

				// Default to first valid basket found
				const firstBasketForTerm = this.baskets.find(b => areTermsEqual(b.forTerm, selectedTerm));
				if (firstBasketForTerm) {
					this.setSelectedBasket(firstBasketForTerm.id);
				} else {
					this.selectedBasketIdForTerm.delete(JSON.stringify(selectedTerm));
				}
			});
		});
	}

	addBasket(forTerm: IPotentialFutureTerm) {
		let basketNameIndexSuffix = 0;
		const initialNewBasketName = toTitleCase(forTerm.isFuture ? `Future ${forTerm.semester} Semester` : `${forTerm.semester} ${forTerm.year}`);

		let newBasketName = initialNewBasketName;
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		while (this.baskets.some(b => b.name === newBasketName)) {
			basketNameIndexSuffix++;
			newBasketName = `${initialNewBasketName} (${basketNameIndexSuffix})`;
		}

		const newBasket = new BasketState(this.apiState, forTerm, newBasketName);
		this.baskets = [...this.baskets, newBasket];
		return newBasket;
	}

	removeBasket(basketId: string) {
		this.baskets = this.baskets.filter(b => b.id !== basketId);
	}

	getBasketsFor(term: IPotentialFutureTerm) {
		return this.baskets.filter(b => areTermsEqual(term, b.forTerm));
	}

	get currentBasket() {
		return this.baskets.find(b => b.id === this.selectedBasketId);
	}

	get selectedBasketId() {
		if (!this.apiState.selectedTerm) {
			return undefined;
		}

		return this.selectedBasketIdForTerm.get(JSON.stringify(this.apiState.selectedTerm));
	}

	setSelectedBasket(id: string) {
		if (!this.apiState.selectedTerm) {
			return;
		}

		const basket = this.baskets.find(b => b.id === id);

		if (basket && areTermsEqual(basket.forTerm, this.apiState.selectedTerm)) {
			this.selectedBasketIdForTerm.set(JSON.stringify(this.apiState.selectedTerm), id);
		}
	}
}
