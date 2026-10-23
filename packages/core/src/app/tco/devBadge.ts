// TCO: development builds only. A small corner label proving the browser is running this
// fork's checkout (not BigCommerce's standard one), with the time it loaded, so a tester can
// tell at a glance which version they are looking at. Never shown in production builds.
const BADGE_ID = 'tco-dev-badge';

export default function showDevBadge(doc: Document = document): void {
    if (process.env.NODE_ENV !== 'development' || doc.getElementById(BADGE_ID)) {
        return;
    }

    const loaded = new Date().toLocaleTimeString('en-GB');
    const badge = doc.createElement('div');

    badge.id = BADGE_ID;
    badge.textContent = `TCO checkout · dev · loaded ${loaded}`;
    badge.setAttribute(
        'style',
        'position:fixed;left:8px;bottom:8px;z-index:2147483647;padding:4px 8px;border-radius:4px;' +
            'background:#00001f;color:#fff;font:600 11px Montserrat,Arial,sans-serif;opacity:.85;' +
            'pointer-events:none',
    );

    doc.body.appendChild(badge);
}
