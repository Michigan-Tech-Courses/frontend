import {zonedTimeToUtc} from 'date-fns-tz';
import {CalendarRecurrence, ICalendar} from 'datebook';
import {ELocationType, IBuildingFromAPI, ICourseFromAPI, ISectionFromAPI} from './api-types';
import {Schedule} from './rschedule';

export enum TitleStyle {
	CRSE_FIRST = 'CRSE_FIRST',
	CRSE_LAST = 'CRSE_LAST',
	NO_CRSE = 'NO_CRSE',
}

export enum LocationStyle {
	FULL = 'FULL',
	SHORT = 'SHORT',
}

export const ALERT_TIMINGS = [
	0,
	5,
	10,
	15,
	20,
] as const;

interface Options {
	titleStyle?: TitleStyle;
	locationStyle?: LocationStyle;
	alertTiming?: typeof ALERT_TIMINGS[0];
}

const sectionsToICS = (sections: Array<ISectionFromAPI & {course: ICourseFromAPI}>, buildings: IBuildingFromAPI[], options?: Options): string => {
	let calendar;

	const {
		titleStyle = TitleStyle.CRSE_FIRST,
		locationStyle = LocationStyle.SHORT,
		alertTiming = ALERT_TIMINGS[2],
	} = options ?? {};

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

			const building = buildings.find(b => b.name === section.buildingName);

			switch (section.locationType) {
				case ELocationType.PHYSICAL: {
					location = `${(locationStyle === LocationStyle.FULL ? section.buildingName : building?.shortName) ?? ''} ${section.room ?? ''}`.trim();

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

			let title = section.course.title;

			if (titleStyle === TitleStyle.CRSE_FIRST) {
				title = `${section.course.subject}${section.course.crse} (${section.course.title})`;
			} else if (titleStyle === TitleStyle.CRSE_LAST) {
				title = `${section.course.title} (${section.course.subject}${section.course.crse})`;
			}

			const event = new ICalendar({
				title,
				location,
				description: section.course.description ?? '',
				start,
				end,
				recurrence,
			});

			if (alertTiming !== 0) {
				event.addAlarm({
					action: 'DISPLAY',
					trigger: {
						minutes: alertTiming,
					},
				});
			}

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
