/**
 * DeepSeek provider adapter config.
 *
 * Standard pipeline with DeepSeek-specific DOM selectors.
 */

module.exports = {
    key: 'deepseek',
    url: 'https://chat.deepseek.com/',
    navPostDelay: 3000,
    authDomains: ['chat.deepseek.com/login', 'deepseek.com/login'],
    quotaPatterns: [
        /额度.*(?:已|用).*(?:完|尽|满)/i,
        /quota\s*(?:exceeded|limit)/i,
        /rate\s*limit/i,
        /请.*(?:充值|升级)/i,
    ],
    dismissPatterns: [/新功能/i, /更新/i, /公告/i],
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
