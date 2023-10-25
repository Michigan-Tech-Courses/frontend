import {type OccurrenceGenerator, type Schedule} from './rschedule';

const cache = new Map<string, ReturnType<ReturnType<OccurrenceGenerator['occurrences']>['toArray']>>();

const occurrenceGeneratorCache = (key: string, start: Date, end: Date, schedule: Schedule) => {
	const fullKey = `${key}-${start.toISOString()}-${end.toISOString()}`;

	if (!cache.get(fullKey)) {
		cache.set(fullKey, schedule.occurrences({start, end}).toArray());
	}

	return cache.get(fullKey)!;
};

export default occurrenceGeneratorCache;
