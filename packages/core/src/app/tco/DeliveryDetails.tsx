// TCO delivery date and delivery notes (SH-CHK-01 step 1, C-DATE-PICKER). Replaces the plain
// order comment box in the shipping step. The date is required: it starts on the earliest
// possible delivery day and the buyer can pick another weekday that isn't a bank holiday.
// Both are kept in the order comment (see deliveryComment.ts), so they reach the order through
// the checkout's own "orderComment" field without changing how it is saved.
import { useField, useFormikContext } from 'formik';
import React, { type FunctionComponent, lazy, Suspense, useEffect, useMemo, useRef } from 'react';

import { Fieldset, Legend, TextArea } from '@bigcommerce/checkout/ui';

import { formatDeliveryComment, NOTES_MAX_LENGTH, parseDeliveryComment } from './deliveryComment';
import {
    addDays,
    earliestDeliveryDate,
    formatDeliveryDate,
    type IsoDate,
    isSelectableDate,
    LATEST_DAYS,
    nextMonday,
} from './deliveryDate';
import useBankHolidays from './useBankHolidays';

const ReactDatePicker = lazy(
    () =>
        import(
            /* webpackChunkName: "react-datepicker" */
            'react-datepicker'
        ),
);

const FIELD = 'orderComment';

// The picker works in local Date objects; the rules work in UK ISO dates.
const toLocalDate = (date: IsoDate) => {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
};
const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (date: Date): IsoDate =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const DeliveryDetails: FunctionComponent = () => {
    const holidays = useBankHolidays();
    const earliest = useMemo(() => earliestDeliveryDate(new Date(), holidays), [holidays]);
    const rules = useRef({ earliest, holidays });

    rules.current = { earliest, holidays };

    const [field, meta, helpers] = useField<string>({
        name: FIELD,
        validate: (value: string) => {
            const { date } = parseDeliveryComment(value);

            if (!date) {
                return 'Choose a delivery date.';
            }

            if (!isSelectableDate(date, rules.current.earliest, rules.current.holidays)) {
                return `Choose a weekday from ${formatDeliveryDate(
                    rules.current.earliest,
                )}, not a bank holiday.`;
            }

            return undefined;
        },
    });
    const { submitCount } = useFormikContext();
    const details = parseDeliveryComment(field.value);

    const update = (next: Partial<typeof details>) =>
        helpers.setValue(formatDeliveryComment({ ...details, ...next }));

    // Start on the earliest day, and move a stale date (e.g. from yesterday's visit) forward.
    useEffect(() => {
        if (!details.date || !isSelectableDate(details.date, earliest, holidays)) {
            update({ date: earliest });
        }
    }, [earliest, holidays]);

    const showError = Boolean(meta.error) && (meta.touched || submitCount > 0);
    const monday = nextMonday(earliest, holidays);
    const chips = [
        { label: 'Earliest', date: earliest },
        { label: 'Next Monday', date: monday },
    ];

    return (
        <>
            <Fieldset
                additionalClassName="tco-delivery"
                legend={<Legend>Delivery date</Legend>}
                testId="tco-delivery-date"
            >
                <div className="tco-delivery-chips">
                    {chips.map((chip) => (
                        <button
                            aria-pressed={details.date === chip.date}
                            className="tco-delivery-chip"
                            key={chip.label}
                            onClick={() => update({ date: chip.date })}
                            type="button"
                        >
                            <strong>{chip.label}</strong> {formatDeliveryDate(chip.date)}
                        </button>
                    ))}
                </div>

                <label
                    className="form-label optimizedCheckout-form-label"
                    htmlFor="tcoDeliveryDate"
                >
                    Or pick a date
                </label>
                <Suspense fallback={<div className="form-input optimizedCheckout-form-input" />}>
                    <ReactDatePicker
                        autoComplete="off"
                        calendarClassName="optimizedCheckout-contentPrimary"
                        className="form-input optimizedCheckout-form-input"
                        dateFormat="EEE d MMM yyyy"
                        filterDate={(date: Date) =>
                            isSelectableDate(toIso(date), earliest, holidays)
                        }
                        id="tcoDeliveryDate"
                        maxDate={toLocalDate(addDays(earliest, LATEST_DAYS))}
                        minDate={toLocalDate(earliest)}
                        onBlur={() => helpers.setTouched(true)}
                        onChange={(date: Date | null) => update({ date: date ? toIso(date) : '' })}
                        placeholderText="Choose a date"
                        popperClassName="optimizedCheckout-contentPrimary"
                        selected={details.date ? toLocalDate(details.date) : null}
                    />
                </Suspense>

                {showError ? (
                    <p className="form-inlineMessage tco-delivery-error" role="alert">
                        {meta.error}
                    </p>
                ) : (
                    <p className="tco-delivery-help optimizedCheckout-contentSecondary">
                        Weekdays only, excluding bank holidays. Order by 3pm for delivery the next
                        working day.
                    </p>
                )}
            </Fieldset>

            <Fieldset
                additionalClassName="tco-delivery"
                legend={
                    <Legend>
                        Delivery notes <span className="tco-delivery-optional">(optional)</span>
                    </Legend>
                }
                testId="tco-delivery-notes"
            >
                <TextArea
                    id="tcoDeliveryNotes"
                    maxLength={NOTES_MAX_LENGTH}
                    onBlur={() => helpers.setTouched(true)}
                    onChange={(event) => update({ notes: event.target.value })}
                    placeholder="e.g. Goods In is round the back, ring the bell."
                    rows={2}
                    value={details.notes}
                />
                <p className="tco-delivery-help optimizedCheckout-contentSecondary">
                    Printed on the courier label. {details.notes.length}/{NOTES_MAX_LENGTH}
                </p>
            </Fieldset>
        </>
    );
};

export default DeliveryDetails;
