import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form, Formik } from 'formik';
import React from 'react';

import { earliestDeliveryDate, FALLBACK_BANK_HOLIDAYS, formatDeliveryDate } from './deliveryDate';
import DeliveryDetails from './DeliveryDetails';

const renderInForm = (orderComment = '', onSubmit = jest.fn()) => {
    render(
        <Formik initialValues={{ orderComment }} onSubmit={onSubmit}>
            <Form>
                <DeliveryDetails />
                <button type="submit">Continue</button>
            </Form>
        </Formik>,
    );

    return onSubmit;
};

describe('DeliveryDetails', () => {
    const earliest = earliestDeliveryDate(new Date(), new Set(FALLBACK_BANK_HOLIDAYS));

    it('starts on the earliest delivery date and submits it with the notes', async () => {
        const onSubmit = renderInForm();

        fireEvent.change(screen.getByPlaceholderText(/Goods In is round the back/), {
            target: { value: 'Ring the bell' },
        });
        fireEvent.click(screen.getByText('Continue'));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onSubmit.mock.calls[0][0]).toEqual({
            orderComment: `Delivery date: ${earliest}\nDelivery notes: Ring the bell`,
        });
    });

    it('shows the earliest and next-Monday shortcuts, with the earliest chosen', () => {
        renderInForm();

        const chip = screen.getByRole('button', { name: new RegExp(formatDeliveryDate(earliest)) });

        expect(chip).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Next Monday/ })).toBeInTheDocument();
    });

    it('replaces a saved date that is outside the booking window', async () => {
        const later = '2099-01-01';
        const onSubmit = renderInForm(`Delivery date: ${later}`);

        fireEvent.click(screen.getByText('Continue'));

        // 2099 is beyond the booking window, so it is replaced by the earliest date
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onSubmit.mock.calls[0][0].orderComment).toBe(`Delivery date: ${earliest}`);
    });
});
