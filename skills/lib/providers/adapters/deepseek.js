/**
 * DeepSeek provider adapter config.
 *
 * Standard pipeline with DeepSeek-specific DOM selectors.
 */

const { COMMON_CN_QUOTA_PATTERNS, COMMON_DISMISS_PATTERNS } = require('../../providerFactory');

module.exports = {
    key: 'deepseek',
    url: 'https://chat.deepseek.com/',
    navPostDelay: 3000,
    authDomains: ['chat.deepseek.com/login', 'deepseek.com/login'],
    quotaPatterns: [
        ...COMMON_CN_QUOTA_PATTERNS,
        /rate\s*limit/i,
    ],
    dismissPatterns: [...COMMON_DISMISS_PATTERNS],
    editorSelectors: [
        'textarea[placeholder*="给 DeepSeek 发送消息"]',
        'textarea[placeholder*="DeepSeek"]',
    ],
    sendSelectors: ['.ds-button--primary.ds-button--filled.ds-button--circle'],
    sendFallback: 'Enter',
    responseSelectors: ['.ds-markdown', '.ds-assistant-message-main-content', '[class*="ds-markdown"]'],
    responseSelectorTimeout: 60_000,
    stabilityWindow: 12_000,
    minResponseLength: 5,
};
