// TCO: checkout and order confirmation use the storefront's Montserrat (C-HEADER, design pack).
// BigCommerce's checkout page does not load it for a headless channel, so add the stylesheet once.
export const BRAND_FONT_URL =
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';

const LINK_ID = 'tco-brand-font';

export default function loadBrandFont(doc: Document = document): void {
    if (doc.getElementById(LINK_ID)) {
        return;
    }

    const link = doc.createElement('link');

    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = BRAND_FONT_URL;

    doc.head.appendChild(link);
}
