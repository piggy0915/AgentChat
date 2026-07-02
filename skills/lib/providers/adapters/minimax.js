/**
 * MiniMax provider adapter config.
 *
 * Key differences from standard pipeline:
 *   - TipTap/ProseMirror editor mounts async — needs 4s navPostDelay
 *   - Send trigger is <div aria-label="发送消息"> (non-button element)
 */

module.exports = {
    key: 'minimax',
    url: 'https://agent.minimaxi.com/',
    navPostDelay: 4000, // TipTap/ProseMirror mounts async
    authDomains: ['agent.minimaxi.com/login', 'minimax.com/login'],
    quotaPatterns: [
        /额度.*(?:已|用).*(?:完|尽|满)/i,
        /quota\s*(?:exceeded|limit)/i,
        /次数.*(?:已|用).*(?:完|尽)/i,
        /请.*(?:充值|升级)/i,
    ],
    dismissPatterns: [/新功能/i, /公告/i, /欢迎/i, /更新.*说明/i],
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
