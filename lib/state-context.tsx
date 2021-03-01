import React, {createContext, useContext, useEffect, useState} from 'react';
import {RootState} from './state';
import useRevalidation from './use-revalidation';

const state = new RootState();

export const StateContext = createContext<RootState>(state);

export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	const [readyToRevalidate, setReadyToRevalidate] = useState(false);
	useRevalidation(readyToRevalidate, async () => state.apiState.revalidate());

	// Upon mount, fetch semesters and set default semester
	useEffect(() => {
		void state.apiState.getSemesters().then(async () => {
			const semesters = state.apiState.sortedSemesters;

			if (semesters) {
				state.apiState.setSelectedSemester(semesters[semesters.length - 1]);
			}

			setReadyToRevalidate(true);
		});
	}, []);

	return (
		<StateContext.Provider value={state}>
			{children}
		</StateContext.Provider>
	);
};

const useAPI = () => useContext(StateContext);

export default useAPI;
