import { FALLBACK_BANK_HOLIDAYS } from './deliveryDate';
import { loadBankHolidays, parseBankHolidays, resetBankHolidaysCache } from './useBankHolidays';

const govUk = {
    'england-and-wales': {
        events: [{ date: '2028-01-03', title: 'New Year’s Day' }, { date: 'bad' }],
    },
    scotland: { events: [{ date: '2028-01-04' }] },
};

describe('parseBankHolidays', () => {
    it('reads England and Wales dates and ignores anything malformed', () => {
        expect(parseBankHolidays(govUk)).toEqual(['2028-01-03']);
        expect(parseBankHolidays({})).toEqual([]);
        expect(parseBankHolidays(null)).toEqual([]);
    });
});

describe('loadBankHolidays', () => {
    const realFetch = global.fetch;

    afterEach(() => {
        global.fetch = realFetch;
        resetBankHolidaysCache();
    });

    it('uses the live GOV.UK list', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue({ ok: true, json: () => Promise.resolve(govUk) });

        expect([...(await loadBankHolidays())]).toEqual(['2028-01-03']);
    });

    it('falls back to the built-in list when GOV.UK cannot be reached', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

        expect([...(await loadBankHolidays())]).toEqual([...FALLBACK_BANK_HOLIDAYS]);
    });
});
