import React, {createContext, useContext} from 'react';
import {RootState} from './state';

const state = new RootState();

export const StateContext = createContext<RootState>(state);

export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	return (
		<StateContext.Provider value={state}>
			{children}
		</StateContext.Provider>
	);
};

const useStore = () => useContext(StateContext);

export default useStore;
