import {NextPage} from 'next';

export type CustomNextPage<T> = NextPage<T> & {
	useStaticHeight?: boolean;
};
