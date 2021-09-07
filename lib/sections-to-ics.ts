import {ELocationType, ICourseFromAPI, ISectionFromAPI} from './api-types';
import {zonedTimeToUtc} from 'date-fns-tz';
import {CalendarRecurrence, ICalendar} from 'datebook';
import {Schedule} from './rschedule';

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

			const start = zonedTimeToUtc(schedule.firstDate?.date ?? new Date(), 'America/New_York');
			const end = zonedTimeToUtc(schedule.firstDate?.end ?? new Date(), 'America/New_York');

			let location = '';

			if (section.locationType === ELocationType.PHYSICAL) {
				location = `${section.buildingName ?? ''} ${section.room ?? ''}`.trim();
			} else if (section.locationType === ELocationType.ONLINE) {
				location = 'Online';
			} else if (section.locationType === ELocationType.REMOTE) {
				location = 'Remote';
			}

			const event = new ICalendar({
				title: section.course.title,
				location,
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
