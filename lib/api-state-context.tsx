import React, {createContext, useContext, useEffect} from 'react';
import {APIState} from './api-state';
import useRevalidation from './use-revalidation';

const state = new APIState();

export const APIStateContext = createContext<APIState>(state);

export const Provider = ({children}: {children: React.ReactElement | React.ReactElement[]}) => {
	useRevalidation(async () => state.revalidate());

	// Upon mount, fetch semesters and set default semester
	useEffect(() => {
		void state.getSemesters().then(async () => {
			const semesters = state.availableSemesters;

			if (semesters && semesters.length >= 2) {
				state.setSelectedSemester(semesters[semesters.length - 2]);
			} else if (semesters) {
				state.setSelectedSemester(semesters[semesters.length - 1]);
			}

			await state.revalidate();
		});
	}, []);

	return (
		<APIStateContext.Provider value={state}>
			{children}
		</APIStateContext.Provider>
	);
};

const useAPI = () => useContext(APIStateContext);

export default useAPI;
