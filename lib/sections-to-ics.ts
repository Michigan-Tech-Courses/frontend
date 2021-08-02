import {ICourseFromAPI, ISectionFromAPI} from './types';
import {Schedule} from './rschedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {CalendarRecurrence, ICalendar} from 'datebook';

dayjs.extend(utc);
dayjs.extend(timezone);

const sectionsToICS = (sections: Array<ISectionFromAPI & {course: ICourseFromAPI}>): string => {
	let calendar;

	for (const section of sections) {
		const schedule = Schedule.fromJSON(section.time);

		for (const rule of schedule.rrules) {
			const recurrence: CalendarRecurrence = {
				frequency: rule.options.frequency,
				end: new Date(rule.options.end?.toISOString() ?? '')
			};

			if (rule.options.frequency === 'WEEKLY') {
				recurrence.weekdays = rule.options.byDayOfWeek as string[];
			}

			const start = dayjs(schedule.firstDate?.date).tz('America/New_York', true).toDate();
			const end = dayjs(schedule.firstDate?.end).tz('America/New_York', true).toDate();

			const event = new ICalendar({
				title: section.course.title,
				// TODO: add location
				location: '',
				description: section.course.description ?? '',
				start,
				end,
				recurrence
			});

			event.setMeta('UID', section.id);

			if (calendar) {
				calendar.addEvent(event);
			} else {
				calendar = event;
			}
		}
	}

	return calendar?.render() ?? '';
};

export default sectionsToICS;
