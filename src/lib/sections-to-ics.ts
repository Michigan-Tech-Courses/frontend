import ical, {ICalAlarmType, ICalEventRepeatingFreq, ICalRepeatingOptions, ICalWeekday} from 'ical-generator';
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

// This is currently hardcoded because @touch4it/ical-timezones doesn't work in the browser
const TIMEZONE_COMPONENT = `
BEGIN:VTIMEZONE
TZID:America/New_York
TZURL:http://tzurl.org/zoneinfo-outlook/America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
`;

const sectionsToICS = (sections: Array<ISectionFromAPI & {course: ICourseFromAPI}>, buildings: IBuildingFromAPI[], options?: Options): string => {
	const calendar = ical();

	calendar.timezone({
		generator: () => TIMEZONE_COMPONENT,
		name: 'America/New_York',
	});

	const {
		titleStyle = TitleStyle.CRSE_FIRST,
		locationStyle = LocationStyle.SHORT,
		alertTiming = ALERT_TIMINGS[2],
	} = options ?? {};

	for (const section of sections) {
		const schedule = Schedule.fromJSON(section.time);

		for (const rule of schedule.rrules) {
			const recurrence: ICalRepeatingOptions = {
				freq: rule.options.frequency as ICalEventRepeatingFreq,
				until: new Date(rule.options.end?.valueOf() ?? 0),
			};

			if (rule.options.frequency === 'WEEKLY') {
				recurrence.byDay = rule.options.byDayOfWeek as ICalWeekday[];
			}

			const start = schedule.firstDate?.date ?? new Date();
			const end = schedule.firstDate?.end ?? new Date();

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

			const event = calendar.createEvent({
				start,
				end,
				summary: title,
				description: section.course.description ?? '',
				location,
				repeating: recurrence,
				id: section.id,
				timezone: 'America/New_York',
			});

			if (alertTiming !== 0) {
				event.createAlarm({
					type: ICalAlarmType.display,
					triggerBefore: alertTiming * 60,
				});
			}
		}
	}

	return calendar.toString();
};

export default sectionsToICS;
