import {autorun, makeAutoObservable, runInAction} from 'mobx';
import {makePersistable, StorageController} from 'mobx-persist-store';
import areSemestersEqual from '../are-semesters-equal';
import toTitleCase from '../to-title-case';
import {IPotentialFutureSemester} from '../types';
import {APIState} from './api';
import {BasketState} from './basket';

const storageController = (apiState: APIState): StorageController => ({
	getItem: <T>(key: string) => {
		const stringifiedData = window.localStorage.getItem(key);
		if (!stringifiedData) {
			return null;
		}

		const data = JSON.parse(stringifiedData) as Pick<AllBasketsState, 'baskets'>;

		const parsed = {
			...data,
			baskets: data.baskets?.map((parsedBasket: Partial<BasketState> & Pick<BasketState, 'forSemester'>) => new BasketState(apiState, parsedBasket.forSemester, '', parsedBasket)) ?? [],
		};

		return parsed as unknown as T;
	},
	setItem: (key, data: Pick<AllBasketsState, 'baskets'>) => {
		window.localStorage.setItem(key, JSON.stringify({
			...data,
			baskets: data.baskets.map(basket => BasketState.serialize(basket)),
		}));
	},
	removeItem: key => {
		window.localStorage.removeItem(key);
	},
});

export class AllBasketsState {
	baskets: BasketState[] = [];
	selectedBasketId?: string;

	private readonly apiState: APIState;

	constructor(apiState: APIState) {
		this.apiState = apiState;

		makeAutoObservable(this);

		void makePersistable(this, {
			name: 'Baskets',
			properties: ['baskets', 'selectedBasketId'],
			stringify: false,
			storage: typeof window === 'undefined' ? undefined : storageController(apiState),
		});

		// Automatically set/change basket when switching semesters (and on first load)
		autorun(() => {
			const {selectedSemester} = this.apiState;
			if (selectedSemester) {
				if (this.selectedBasketId && areSemestersEqual(this.currentBasket!.forSemester, selectedSemester)) {
					return;
				}

				const firstBasketForSemester = this.baskets.find(b => areSemestersEqual(b.forSemester, selectedSemester));

				runInAction(() => {
					this.selectedBasketId = firstBasketForSemester ? firstBasketForSemester.id : undefined;
				});
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
		this.selectedBasketId = undefined;
	}

	getBasketsFor(semester: IPotentialFutureSemester) {
		return this.baskets.filter(b => areSemestersEqual(semester, b.forSemester));
	}

	get currentBasket() {
		return this.baskets.find(b => b.id === this.selectedBasketId);
	}

	setSelectedBasket(id: string) {
		this.selectedBasketId = id;
	}
}
