/**
 * MiniMax provider adapter config.
 *
 * Key differences from standard pipeline:
 *   - TipTap/ProseMirror editor mounts async — needs 4s navPostDelay
 *   - Send trigger is <div aria-label="发送消息"> (non-button element)
 */

const { COMMON_CN_QUOTA_PATTERNS, COMMON_DISMISS_PATTERNS } = require('../../providerFactory');

module.exports = {
    key: 'minimax',
    url: 'https://agent.minimaxi.com/',
    navPostDelay: 4000, // TipTap/ProseMirror mounts async
    authDomains: ['agent.minimaxi.com/login', 'minimax.com/login'],
    quotaPatterns: [...COMMON_CN_QUOTA_PATTERNS],
    dismissPatterns: [...COMMON_DISMISS_PATTERNS],
    editorSelectors: [
        '[class*="ProseMirror"]', '[class*="tiptap"]', 'textarea',
        '[contenteditable="true"]', '[role="textbox"]', '[class*="editor"]',
    ],
    sendSelectors: ['[aria-label="发送消息"]', '[class*="send"]', '[class*="submit"]'],
    sendFallback: 'Enter',
    responseSelectors: [
        '[class*="message-content"]', '[class*="matrix-markdown"]',
        '.markdown-body', '[class*="answer"]', '[class*="response"]',
    ],
    stabilityWindow: 10_000,
    minResponseLength: 5,
};
