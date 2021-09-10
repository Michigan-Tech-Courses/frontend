import {zonedTimeToUtc} from 'date-fns-tz';
import {CalendarRecurrence, ICalendar} from 'datebook';
import {ELocationType, ICourseFromAPI, ISectionFromAPI} from './api-types';
import {Schedule} from './rschedule';

const sectionsToICS = (sections: Array<ISectionFromAPI & {course: ICourseFromAPI}>): string => {
	let calendar;

	for (const section of sections) {
		const schedule = Schedule.fromJSON(section.time);

		for (const rule of schedule.rrules) {
			const recurrence: CalendarRecurrence = {
				frequency: rule.options.frequency,
				end: new Date(rule.options.end?.toISOString() ?? ''),
			};

			if (rule.options.frequency === 'WEEKLY') {
				recurrence.weekdays = rule.options.byDayOfWeek as string[];
			}

			const start = zonedTimeToUtc(schedule.firstDate?.date ?? new Date(), 'America/New_York');
			const end = zonedTimeToUtc(schedule.firstDate?.end ?? new Date(), 'America/New_York');

			let location = '';

			switch (section.locationType) {
				case ELocationType.PHYSICAL: {
					location = `${section.buildingName ?? ''} ${section.room ?? ''}`.trim();

					break;
				}

				case ELocationType.ONLINE: {
					location = 'Online';

					break;
				}

				case ELocationType.REMOTE: {
					location = 'Remote';

					break;
				}

				default: {
					location = '';
					break;
				}
			}

			const event = new ICalendar({
				title: section.course.title,
				location,
				description: section.course.description ?? '',
				start,
				end,
				recurrence,
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
