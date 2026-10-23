// TCO: where the delivery date and notes are kept on the order. Until the order sync to Access
// (F-09) settles a home for them, they travel in the order comment (BigCommerce
// `customerMessage`), one labelled line each, so both a person and the sync can read them:
//
//   Delivery date: 2026-10-29
//   Delivery notes: Goods In is round the back
//
// Changing where they go means changing only this file. Pure, so it can be unit-tested.
import { type IsoDate } from './deliveryDate';

export interface DeliveryDetails {
    date: IsoDate | '';
    notes: string;
}

// Printed on the courier label (design: "Max 200 characters").
export const NOTES_MAX_LENGTH = 200;

const DATE_LABEL = 'Delivery date:';
const NOTES_LABEL = 'Delivery notes:';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LINE_BREAKS = /\s*[\r\n]+\s*/g;

// One line, within the label limit. Spaces are kept as typed (trimming here would swallow the
// space a buyer has just typed between words); blank notes are dropped when written.
export function cleanNotes(notes: string): string {
    return notes.replace(LINE_BREAKS, ' ').slice(0, NOTES_MAX_LENGTH);
}

export function formatDeliveryComment({ date, notes }: DeliveryDetails): string {
    const clean = cleanNotes(notes);

    return [date ? `${DATE_LABEL} ${date}` : '', clean.trim() ? `${NOTES_LABEL} ${clean}` : '']
        .filter(Boolean)
        .join('\n');
}

// Reads the two lines back. A comment written some other way (e.g. before this checkout) is
// kept as the notes, so nothing the buyer typed is lost.
export function parseDeliveryComment(message?: string): DeliveryDetails {
    const lines = (message ?? '').split(/\r?\n/);
    let date: IsoDate | '' = '';
    let notes = '';
    const other: string[] = [];

    lines.forEach((line) => {
        const text = line.trim();

        if (text.startsWith(DATE_LABEL)) {
            const value = text.slice(DATE_LABEL.length).trim();

            date = ISO_DATE.test(value) ? value : '';
        } else if (text.startsWith(NOTES_LABEL)) {
            // Keep trailing spaces: the buyer may be mid-word.
            notes = line.slice(line.indexOf(NOTES_LABEL) + NOTES_LABEL.length).replace(/^ /, '');
        } else if (text) {
            other.push(text);
        }
    });

    return { date, notes: notes || cleanNotes(other.join(' ')).trim() };
}
