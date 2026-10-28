import storefrontConfirmationUrl from './storefrontConfirmationUrl';

describe('storefrontConfirmationUrl', () => {
    it('points at the storefront order confirmation', () => {
        expect(storefrontConfirmationUrl('https://www.example.com', 123)).toBe(
            'https://www.example.com/order-confirmation/123/',
        );
    });

    it('copes with a trailing slash on the site link', () => {
        expect(storefrontConfirmationUrl('https://www.example.com/', 123)).toBe(
            'https://www.example.com/order-confirmation/123/',
        );
    });

    it('leaves BigCommerce’s confirmation in place without an order id or site link', () => {
        expect(storefrontConfirmationUrl('https://www.example.com', undefined)).toBeUndefined();
        expect(storefrontConfirmationUrl('', 123)).toBeUndefined();
        expect(storefrontConfirmationUrl(undefined, 123)).toBeUndefined();
    });
});
