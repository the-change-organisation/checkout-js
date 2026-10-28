// TCO: after an order is placed, the buyer sees the storefront's own order confirmation
// (catalyst-storefront `/order-confirmation/{id}/`, design SH-OCF-01) instead of this checkout's,
// so it has the site's header, account links and "Save as a shopping list". `siteLink` is the
// channel's storefront address from the checkout config. Without an order id or a site link,
// BigCommerce's own confirmation is used.
export default function storefrontConfirmationUrl(
    siteLink: string | undefined,
    orderId: number | undefined,
): string | undefined {
    if (!siteLink || !orderId) {
        return undefined;
    }

    return `${siteLink.replace(/\/+$/, '')}/order-confirmation/${orderId}/`;
}
