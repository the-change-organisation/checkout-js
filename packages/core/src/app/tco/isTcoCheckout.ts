// TCO: one switch for behaviour that changes BigCommerce's checkout flow (e.g. the required
// delivery date). Always on in real builds. BigCommerce's own test suite runs with it off
// (jest-setup.ts sets TCO_CHECKOUT=off), so their tests keep checking their behaviour and stay
// unchanged, which keeps upstream merges simple (R-007). Our tests switch it back on.
export default function isTcoCheckout(): boolean {
    return typeof process === 'undefined' || process.env?.TCO_CHECKOUT !== 'off';
}
