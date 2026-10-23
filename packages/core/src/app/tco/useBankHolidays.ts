import { useEffect, useState } from 'react';

import { FALLBACK_BANK_HOLIDAYS, type IsoDate } from './deliveryDate';

// England and Wales bank holidays, live from GOV.UK (served with Access-Control-Allow-Origin: *).
// The built-in list is used straight away and whenever the live one can't be fetched.
export const BANK_HOLIDAYS_URL = 'https://www.gov.uk/bank-holidays.json';

const DIVISION = 'england-and-wales';

let cached: Promise<ReadonlySet<IsoDate>> | undefined;

export function parseBankHolidays(body: unknown): IsoDate[] {
    if (typeof body !== 'object' || body === null || !(DIVISION in body)) {
        return [];
    }

    const division: unknown = (body as Record<string, unknown>)[DIVISION];
    const events: unknown =
        typeof division === 'object' && division !== null && 'events' in division
            ? division.events
            : [];

    return Array.isArray(events)
        ? events
              .map((event: unknown) =>
                  typeof event === 'object' && event !== null && 'date' in event
                      ? String(event.date)
                      : '',
              )
              .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
        : [];
}

export function loadBankHolidays(): Promise<ReadonlySet<IsoDate>> {
    if (typeof fetch !== 'function') {
        return Promise.resolve(new Set(FALLBACK_BANK_HOLIDAYS));
    }

    cached =
        cached ??
        fetch(BANK_HOLIDAYS_URL)
            .then((response) =>
                response.ok
                    ? response.json()
                    : Promise.reject(new Error(`Bank holidays: HTTP ${response.status}`)),
            )
            .then((body: unknown) => {
                const dates = parseBankHolidays(body);

                return new Set(dates.length > 0 ? dates : FALLBACK_BANK_HOLIDAYS);
            })
            .catch(() => new Set(FALLBACK_BANK_HOLIDAYS));

    return cached;
}

export function resetBankHolidaysCache(): void {
    cached = undefined;
}

export default function useBankHolidays(): ReadonlySet<IsoDate> {
    const [holidays, setHolidays] = useState<ReadonlySet<IsoDate>>(
        () => new Set(FALLBACK_BANK_HOLIDAYS),
    );

    useEffect(() => {
        let active = true;

        void loadBankHolidays().then((loaded) => {
            if (active) {
                setHolidays(loaded);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    return holidays;
}
