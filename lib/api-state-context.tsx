import React, {createContext, useContext} from 'react';
import {APIState} from './api-state';
import useRevalidation from './use-revalidation';

const state = new APIState();

export const APIStateContext = createContext<APIState>(state);

export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	useRevalidation(async () => state.revalidate());

	return (
		<APIStateContext.Provider value={state}>
			{children}
		</APIStateContext.Provider>
	);
};

const getContext = () => useContext(APIStateContext);

export default getContext;
