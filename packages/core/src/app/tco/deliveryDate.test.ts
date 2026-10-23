import {
    earliestDeliveryDate,
    FALLBACK_BANK_HOLIDAYS,
    formatDeliveryDate,
    isSelectableDate,
    isWorkingDay,
    londonNow,
    nextMonday,
    nextWorkingDay,
} from './deliveryDate';

const holidays = new Set(FALLBACK_BANK_HOLIDAYS);
const none = new Set<string>();

describe('londonNow', () => {
    it('reads the date and hour in UK time, whatever the machine time zone', () => {
        // 23:30 UTC on 30 Jun is 00:30 BST on 1 Jul
        expect(londonNow(new Date('2026-06-30T23:30:00Z'))).toEqual({
            date: '2026-07-01',
            hour: 0,
        });
        // In winter UK time equals UTC
        expect(londonNow(new Date('2026-12-01T14:59:00Z'))).toEqual({
            date: '2026-12-01',
            hour: 14,
        });
    });
});

describe('isWorkingDay and nextWorkingDay', () => {
    it('skips weekends and bank holidays', () => {
        expect(isWorkingDay('2026-10-23', none)).toBe(true); // Friday
        expect(isWorkingDay('2026-10-24', none)).toBe(false); // Saturday
        expect(isWorkingDay('2026-12-28', holidays)).toBe(false); // Boxing Day (substitute)
        expect(nextWorkingDay('2026-10-23', none)).toBe('2026-10-26'); // Fri → Mon
        expect(nextWorkingDay('2026-12-24', holidays)).toBe('2026-12-29'); // over Christmas
    });
});

describe('earliestDeliveryDate', () => {
    it('is the next working day when ordered before 15:00 on a working day', () => {
        // Wed 28 Oct 2026, 14:59 UK (GMT)
        expect(earliestDeliveryDate(new Date('2026-10-28T14:59:00Z'), none)).toBe('2026-10-29');
    });

    it('is the working day after next once the cut-off has passed', () => {
        expect(earliestDeliveryDate(new Date('2026-10-28T15:00:00Z'), none)).toBe('2026-10-30');
    });

    it('rolls over the weekend and bank holidays', () => {
        // Friday 23 Oct is still BST: 13:30 UTC is 14:30 UK (before the cut-off) → arrive Monday;
        // 14:30 UTC is 15:30 UK (after it) → dispatch Monday → arrive Tuesday
        expect(earliestDeliveryDate(new Date('2026-10-23T13:30:00Z'), none)).toBe('2026-10-26');
        expect(earliestDeliveryDate(new Date('2026-10-23T14:30:00Z'), none)).toBe('2026-10-27');
        // Saturday → dispatch Monday → arrive Tuesday
        expect(earliestDeliveryDate(new Date('2026-10-24T09:00:00Z'), none)).toBe('2026-10-27');
        // Christmas Eve morning → dispatch 24th → next working day is 29 Dec
        expect(earliestDeliveryDate(new Date('2026-12-24T09:00:00Z'), holidays)).toBe('2026-12-29');
    });

    it('uses UK summer time for the cut-off', () => {
        // 14:30 UTC in July is 15:30 BST: past the cut-off
        expect(earliestDeliveryDate(new Date('2026-07-15T14:30:00Z'), none)).toBe('2026-07-17');
    });
});

describe('isSelectableDate', () => {
    it('allows working days from the earliest date for 90 days', () => {
        expect(isSelectableDate('2026-10-29', '2026-10-29', none)).toBe(true);
        expect(isSelectableDate('2026-10-28', '2026-10-29', none)).toBe(false); // too early
        expect(isSelectableDate('2026-10-31', '2026-10-29', none)).toBe(false); // Saturday
        expect(isSelectableDate('2027-02-01', '2026-10-29', none)).toBe(false); // beyond 90 days
    });
});

describe('nextMonday', () => {
    it('finds the next working Monday after the earliest date', () => {
        expect(nextMonday('2026-10-29', none)).toBe('2026-11-02');
        expect(nextMonday('2026-10-26', none)).toBe('2026-11-02'); // not the earliest itself
        expect(nextMonday('2026-12-22', holidays)).toBe('2027-01-04'); // 28 Dec is a holiday
    });
});

describe('formatDeliveryDate', () => {
    it('shows weekday, day, month and year', () => {
        expect(formatDeliveryDate('2026-10-29')).toBe('Thu 29 Oct 2026');
    });
});
