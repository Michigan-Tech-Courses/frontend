import {type NextPage} from 'next';
import {type ESemester} from './api-types';

export type CustomNextPage<T> = NextPage<T> & {
	useStaticHeight?: boolean;
};

export type IConcreteTerm = {
	semester: ESemester;
	year: number;
	isFuture?: boolean;
};

export type IVirtualTerm = {
	semester: ESemester;
	isFuture: true;
};

export type IPotentialFutureTerm = IConcreteTerm | IVirtualTerm;

// https://stackoverflow.com/a/49579497/12638523
export type IfEquals<X, Y, A = X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

export type WritableKeys<T> = {
	[P in keyof T]-?: IfEquals<{[Q in P]: T[P]}, {-readonly [Q in P]: T[P]}, P>
}[keyof T];

export type ReadonlyKeys<T> = {
	[P in keyof T]-?: IfEquals<{[Q in P]: T[P]}, {-readonly [Q in P]: T[P]}, never, P>
}[keyof T];
