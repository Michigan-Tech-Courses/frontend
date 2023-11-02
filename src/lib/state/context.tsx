import React, {createContext, useContext} from 'react';
import {RootState} from './root';

const state = new RootState();

export const StateContext = createContext<RootState>(state);

// eslint-disable-next-line mobx/missing-observer
export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => (
	<StateContext.Provider value={state}>
		{children}
	</StateContext.Provider>
);

const useStore = () => useContext(StateContext);

export default useStore;
