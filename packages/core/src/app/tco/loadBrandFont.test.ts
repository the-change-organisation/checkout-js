import loadBrandFont, { BRAND_FONT_URL } from './loadBrandFont';

describe('loadBrandFont', () => {
    afterEach(() => {
        document.head.innerHTML = '';
    });

    it('adds the Montserrat stylesheet to the page', () => {
        loadBrandFont();

        const link = document.getElementById('tco-brand-font');

        expect(link).toBeInstanceOf(HTMLLinkElement);
        expect(link?.getAttribute('href')).toBe(BRAND_FONT_URL);
        expect(link?.getAttribute('rel')).toBe('stylesheet');
    });

    it('adds it only once', () => {
        loadBrandFont();
        loadBrandFont();

        expect(document.querySelectorAll('#tco-brand-font')).toHaveLength(1);
    });
});
