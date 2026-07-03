/**
 * MiMo (Xiaomi MiMo Studio) provider adapter config.
 *
 * Key differences from standard pipeline:
 *   - React/Tailwind SPA — needs 4s navPostDelay
 *   - Send button located via DOM traversal from textarea, not CSS selectors
 *   - customSend overrides the factory's default clickSend
 */

const { COMMON_CN_QUOTA_PATTERNS, COMMON_DISMISS_PATTERNS } = require('../../providerFactory');

module.exports = {
    key: 'mimo',
    url: 'https://aistudio.xiaomimimo.com/',
    navPostDelay: 4000, // React/Tailwind SPA render
    authDomains: ['aistudio.xiaomimimo.com/login', 'auth0.com'],
    quotaPatterns: [
        ...COMMON_CN_QUOTA_PATTERNS,
        /免费版.*升级/i,
    ],
    dismissPatterns: [...COMMON_DISMISS_PATTERNS],
    editorSelectors: [
        'textarea[placeholder*="有问题，尽管问"]',
        'textarea[placeholder*="Shift + Enter"]',
    ],
    // MiMo's send button is found via DOM traversal from textarea, not CSS selectors.
    // Tries both editorSelectors placeholder variants — the textarea that actually
    // matched during Step 5 (Chinese or English UI) may be either one.
    customSend: async (page, _editor) => {
        let sent = false;
        for (const textareaSel of [
            'textarea[placeholder*="有问题，尽管问"]',
            'textarea[placeholder*="Shift + Enter"]',
        ]) {
            try {
                const sendBtn = page.locator(textareaSel)
                    .locator('..').locator('..')  // grandparent container
                    .locator('button:not([disabled])')
                    .filter({ has: page.locator('svg') }).last();
                if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await sendBtn.click();
                    sent = true;
                    break;
                }
            } catch (_) { /* try next placeholder variant */ }
        }
        if (!sent) await page.keyboard.press('Enter');
    },
    responseSelectors: ['.markdown-prose', '.Markdown_markdown__', '[class*="markdown"]'],
    stabilityWindow: 15_000,
    minResponseLength: 5,
};
