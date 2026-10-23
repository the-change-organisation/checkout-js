import showDevBadge from './devBadge';

describe('showDevBadge', () => {
    const env = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = env;
        document.body.innerHTML = '';
    });

    it('shows the label once in development builds', () => {
        process.env.NODE_ENV = 'development';

        showDevBadge();
        showDevBadge();

        expect(document.querySelectorAll('#tco-dev-badge')).toHaveLength(1);
        expect(document.getElementById('tco-dev-badge')?.textContent).toContain('TCO checkout');
    });

    it('never shows it in production builds', () => {
        process.env.NODE_ENV = 'production';

        showDevBadge();

        expect(document.getElementById('tco-dev-badge')).toBeNull();
    });
});
