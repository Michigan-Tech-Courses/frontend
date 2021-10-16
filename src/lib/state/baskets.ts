import {autorun, makeAutoObservable} from 'mobx';
import {makePersistable, StorageController} from 'mobx-persist-store';
import areSemestersEqual from '../are-semesters-equal';
import toTitleCase from '../to-title-case';
import {IPotentialFutureSemester} from '../types';
import {APIState} from './api';
import {BasketState} from './basket';

type SerializedData = Partial<Pick<AllBasketsState, 'baskets' | 'selectedBasketIdForSemester'>>;

const storageController = (apiState: APIState): StorageController => ({
	getItem: <T>(key: string) => {
		const stringifiedData = window.localStorage.getItem(key);
		if (!stringifiedData) {
			return null;
		}

		const data = JSON.parse(stringifiedData) as SerializedData;

		const parsed = {
			...data,
			baskets: data.baskets?.map((parsedBasket: Partial<BasketState> & Pick<BasketState, 'forSemester'>) => new BasketState(apiState, parsedBasket.forSemester, '', parsedBasket)) ?? [],
			// Gotta manually deserialize Map
			selectedBasketIdForSemester: new Map(data.selectedBasketIdForSemester ?? []),
		};

		return parsed as unknown as T;
	},
	setItem: (key, data: SerializedData) => {
		window.localStorage.setItem(key, JSON.stringify({
			...data,
			baskets: data.baskets?.map(basket => BasketState.serialize(basket)) ?? [],
			// Gotta manually serialize Map
			selectedBasketIdForSemester: data.selectedBasketIdForSemester ? Array.from(data.selectedBasketIdForSemester.entries()) : [],
		}));
	},
	removeItem: key => {
		window.localStorage.removeItem(key);
	},
});

export class AllBasketsState {
	baskets: BasketState[] = [];
	selectedBasketIdForSemester = new Map<string, string>();

	private readonly apiState: APIState;

	constructor(apiState: APIState) {
		this.apiState = apiState;

		makeAutoObservable(this);

		void makePersistable(this, {
			name: 'Baskets',
			properties: ['baskets', 'selectedBasketIdForSemester'],
			stringify: false,
			storage: typeof window === 'undefined' ? undefined : storageController(apiState),
		});

		// Automatically set/change basket when switching semesters (and on first load)
		autorun(() => {
			const {selectedSemester} = this.apiState;

			if (!selectedSemester) {
				return;
			}

			// Check if we have a basket for this semester in history
			let lastViewedBasketIdForThisSemester = this.selectedBasketIdForSemester.get(JSON.stringify(selectedSemester));
			// Map might have old data
			if (!this.baskets.some(b => b.id === lastViewedBasketIdForThisSemester)) {
				lastViewedBasketIdForThisSemester = undefined;
				this.selectedBasketIdForSemester.delete(JSON.stringify(selectedSemester));
			}

			if (lastViewedBasketIdForThisSemester // Check if basket was deleted
				&& this.baskets.some(b => b.id === this.selectedBasketId)) {
				this.setSelectedBasket(lastViewedBasketIdForThisSemester);
				return;
			}

			// Default to first valid basket found
			const firstBasketForSemester = this.baskets.find(b => areSemestersEqual(b.forSemester, selectedSemester));
			if (firstBasketForSemester) {
				this.setSelectedBasket(firstBasketForSemester.id);
			} else {
				this.selectedBasketIdForSemester.delete(JSON.stringify(selectedSemester));
			}
		});
	}

	addBasket(forSemester: IPotentialFutureSemester) {
		let basketNameIndexSuffix = 0;
		const initialNewBasketName = toTitleCase(forSemester.isFuture ? `Future ${forSemester.semester} Semester` : `${forSemester.semester} ${forSemester.year}`);

		let newBasketName = initialNewBasketName;
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		while (this.baskets.some(b => b.name === newBasketName)) {
			basketNameIndexSuffix++;
			newBasketName = `${initialNewBasketName} (${basketNameIndexSuffix})`;
		}

		const newBasket = new BasketState(this.apiState, forSemester, newBasketName);
		this.baskets = [...this.baskets, newBasket];
		return newBasket;
	}

	removeBasket(basketId: string) {
		this.baskets = this.baskets.filter(b => b.id !== basketId);
	}

	getBasketsFor(semester: IPotentialFutureSemester) {
		return this.baskets.filter(b => areSemestersEqual(semester, b.forSemester));
	}

	get currentBasket() {
		return this.baskets.find(b => b.id === this.selectedBasketId);
	}

	get selectedBasketId() {
		if (!this.apiState.selectedSemester) {
			return undefined;
		}

		return this.selectedBasketIdForSemester.get(JSON.stringify(this.apiState.selectedSemester));
	}

	setSelectedBasket(id: string) {
		if (!this.apiState.selectedSemester) {
			return;
		}

		const basket = this.baskets.find(b => b.id === id);

		if (basket && areSemestersEqual(basket.forSemester, this.apiState.selectedSemester)) {
			this.selectedBasketIdForSemester.set(JSON.stringify(this.apiState.selectedSemester), id);
		}
	}
}
