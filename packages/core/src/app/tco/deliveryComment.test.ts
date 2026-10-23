import {
    cleanNotes,
    formatDeliveryComment,
    NOTES_MAX_LENGTH,
    parseDeliveryComment,
} from './deliveryComment';

describe('formatDeliveryComment', () => {
    it('writes one labelled line for the date and one for the notes', () => {
        expect(
            formatDeliveryComment({ date: '2026-10-29', notes: 'Goods In is round the back' }),
        ).toBe('Delivery date: 2026-10-29\nDelivery notes: Goods In is round the back');
    });

    it('leaves out empty parts', () => {
        expect(formatDeliveryComment({ date: '2026-10-29', notes: '  ' })).toBe(
            'Delivery date: 2026-10-29',
        );
        expect(formatDeliveryComment({ date: '', notes: '' })).toBe('');
    });
});

describe('parseDeliveryComment', () => {
    it('reads back what was written', () => {
        const details = { date: '2026-10-29', notes: 'Ring the bell' };

        expect(parseDeliveryComment(formatDeliveryComment(details))).toEqual(details);
    });

    it('ignores a malformed date and keeps an older free-text comment as the notes', () => {
        expect(parseDeliveryComment('Delivery date: next week')).toEqual({ date: '', notes: '' });
        expect(parseDeliveryComment('Please call before delivery')).toEqual({
            date: '',
            notes: 'Please call before delivery',
        });
        expect(parseDeliveryComment(undefined)).toEqual({ date: '', notes: '' });
    });
});

describe('typing notes', () => {
    it('keeps the space just typed between words', () => {
        const typed = parseDeliveryComment(
            formatDeliveryComment({ date: '2026-10-29', notes: 'Goods ' }),
        );

        expect(typed.notes).toBe('Goods ');
    });
});

describe('cleanNotes', () => {
    it('keeps notes on one line and within the label limit', () => {
        expect(cleanNotes('Goods In\nround the back')).toBe('Goods In round the back');
        expect(cleanNotes('x'.repeat(300))).toHaveLength(NOTES_MAX_LENGTH);
    });
});
