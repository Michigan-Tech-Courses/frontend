const rmpIdToURL = (id: string) => {
	const decoded = atob(id);

	const fragments = decoded.split('-');

	return `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${fragments[1]}`;
};

export default rmpIdToURL;
