import {qualifiers} from './search-filters';

const searchPairExpr = /((\w*):([\w+-.]*))/g;
const searchPairExprWithAtLeast1Character = /((\w*):([\w+-.]+))/g;

const parseSearchQuery = (query: string) => {
	const searchPairs: Array<[string, string]> = query.match(searchPairExprWithAtLeast1Character)?.map(s => s.split(':')) as Array<[string, string]> ?? [];
	const cleanedSearchValue = query
		.toLowerCase()
		.replaceAll(searchPairExpr, '')
		.replaceAll(/[^A-Za-z\d" ]/g, '')
		.trim()
		.split(' ')
		.filter(token => {
			let includeToken = true;
			for (const q of qualifiers) {
				if (q.includes(token)) {
					includeToken = false;
				}
			}

			return includeToken;
		})
		.reduce<string[]>((tokens, token) => {
		// Check if token is of form subjectcrse (i.e. CS1000)
		if (/([A-z]+)(\d+)/g.test(token)) {
			const subject = token.match(/[A-z]+/g);
			const crse = token.match(/\d+/g);

			if (subject && crse) {
				searchPairs.push(['subject', subject[0]]);
				tokens.push(crse[0]);
			}
		} else {
			tokens.push(token);
		}

		return tokens;
	}, [])
		.join(' ');

	return {searchPairs, cleanedSearchValue};
};

export default parseSearchQuery;
