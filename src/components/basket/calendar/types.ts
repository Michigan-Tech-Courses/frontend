import {BasketState} from 'src/lib/basket-state';

export type CalendarEvent = {
	key: string;
	label: string;
	start: Date;
	end: Date;
	section: BasketState['sections'][0];
};

// Couldn't get these types merged correctly for some reason, so duplicating internal package type here. :(
export type CalendarBodyWithEvents = {
	value: Array<{
		key: string;
		value: Array<{
			value: Date;
		} & {
			date: number;
			isCurrentMonth: boolean;
			isCurrentDate: boolean;
			isWeekend: boolean;
		} & {
			key: string;
		} & {
			events: CalendarEvent[];
		}>;
	}>;
};
