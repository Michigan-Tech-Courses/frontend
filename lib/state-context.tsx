import React, {createContext, useContext, useEffect} from 'react';
import {RootState} from './state';
import useRevalidation from './use-revalidation';

const state = new RootState();

export const StateContext = createContext<RootState>(state);

export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	useRevalidation(async () => state.apiState.revalidate());

	// Upon mount, fetch semesters and set default semester
	useEffect(() => {
		void state.apiState.getSemesters().then(async () => {
			const semesters = state.apiState.availableSemesters;

			if (semesters && semesters.length >= 2) {
				state.apiState.setSelectedSemester(semesters[semesters.length - 2]);
			} else if (semesters) {
				state.apiState.setSelectedSemester(semesters[semesters.length - 1]);
			}

			await state.apiState.revalidate();
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
