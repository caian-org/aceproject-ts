import { Moment } from 'moment';
import * as moment from 'moment';
import 'moment-timezone';


export enum WeekDay
{
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}


export interface IWeek
{
    startDate: string;
    currentDay: WeekDay;
}


export class Week
{
    private static toTz(m: Moment, tz = 'America/Sao_Paulo'): Moment
    {
        return m.tz(tz);
    }

    private static now(): Moment
    {
        const now = new Date();

        /* Remove horas do objeto -- apenas a data interessa */
        now.setHours(0, 0, 0, 0);

        return this.toTz(moment(now));
    }

    private static toWeekInterface(daysOffset = 0, date: Moment = this.now()): IWeek
    {
        const m = date.add(daysOffset, 'days');
        const firstDayOfWeek = m.clone().weekday(0);

        return {
            startDate: firstDayOfWeek.format('YYYY-MM-DD'),
            currentDay: m.weekday(),
        };
    }

    public static today(): IWeek
    {
        return this.toWeekInterface();
    }

    public static tomorrow(): IWeek
    {
        return this.toWeekInterface(1);
    }

    public static yesterday(): IWeek
    {
        return this.toWeekInterface(-1);
    }

    public static custom(date: string): IWeek
    {
        const d = this.toTz(moment(date));
        return this.toWeekInterface(0, d);
    }
}
