// TCO delivery date rules (SH-CHK-01, C-DATE-PICKER; MVP: the buyer must choose a delivery date).
// Orders placed on a working day before the 15:00 cut-off (UK time) are dispatched that day and
// arrive the next working day; later orders arrive the working day after. Working days are
// Monday to Friday, excluding bank holidays. Dates are ISO strings (YYYY-MM-DD) in UK time
// throughout, so the buyer's own time zone never shifts a day. Pure, so it can be unit-tested.

export type IsoDate = string;

export const CUTOFF_HOUR = 15;

// How far ahead a delivery can be booked.
export const LATEST_DAYS = 90;

export function londonNow(now: Date): { date: IsoDate; hour: number } {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(now);
    const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

    return {
        date: `${part('year')}-${part('month')}-${part('day')}`,
        hour: Number(part('hour')),
    };
}

// Noon UTC keeps day arithmetic clear of daylight-saving changes.
const toUtcNoon = (date: IsoDate) => new Date(`${date}T12:00:00Z`);

export function addDays(date: IsoDate, days: number): IsoDate {
    const next = toUtcNoon(date);

    next.setUTCDate(next.getUTCDate() + days);

    return next.toISOString().slice(0, 10);
}

export function isWorkingDay(date: IsoDate, holidays: ReadonlySet<IsoDate>): boolean {
    const weekday = toUtcNoon(date).getUTCDay();

    return weekday !== 0 && weekday !== 6 && !holidays.has(date);
}

export function nextWorkingDay(date: IsoDate, holidays: ReadonlySet<IsoDate>): IsoDate {
    let next = addDays(date, 1);

    while (!isWorkingDay(next, holidays)) {
        next = addDays(next, 1);
    }

    return next;
}

export function earliestDeliveryDate(
    now: Date,
    holidays: ReadonlySet<IsoDate>,
    cutoffHour = CUTOFF_HOUR,
): IsoDate {
    const { date, hour } = londonNow(now);
    const dispatch =
        isWorkingDay(date, holidays) && hour < cutoffHour ? date : nextWorkingDay(date, holidays);

    return nextWorkingDay(dispatch, holidays);
}

export function isSelectableDate(
    date: IsoDate,
    earliest: IsoDate,
    holidays: ReadonlySet<IsoDate>,
): boolean {
    return (
        date >= earliest && date <= addDays(earliest, LATEST_DAYS) && isWorkingDay(date, holidays)
    );
}

// The first Monday on or after the earliest date that is a working day ("Next Monday" chip).
export function nextMonday(earliest: IsoDate, holidays: ReadonlySet<IsoDate>): IsoDate {
    let date = earliest;

    while (
        toUtcNoon(date).getUTCDay() !== 1 ||
        !isWorkingDay(date, holidays) ||
        date === earliest
    ) {
        date = addDays(date, 1);
    }

    return date;
}

// "Tue 28 Oct 2026"
export function formatDeliveryDate(date: IsoDate): string {
    return toUtcNoon(date)
        .toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        })
        .replace(',', '');
}

// England and Wales bank holidays from GOV.UK (https://www.gov.uk/bank-holidays.json, read
// 2026-10-23). Used when the live list cannot be fetched.
export const FALLBACK_BANK_HOLIDAYS: readonly IsoDate[] = [
    '2026-01-01',
    '2026-04-03',
    '2026-04-06',
    '2026-05-04',
    '2026-05-25',
    '2026-08-31',
    '2026-12-25',
    '2026-12-28',
    '2027-01-01',
    '2027-03-26',
    '2027-03-29',
    '2027-05-03',
    '2027-05-31',
    '2027-08-30',
    '2027-12-27',
    '2027-12-28',
];
