/**
 * Shared terminal utilities — spinner, timer, log line management.
 *
 * Used by all skills (WebExtended, FreeSubAgent).
 * Eliminates ~80 lines of duplicated \r\x1b[K + spinner frame logic.
 *
 * v2 (2026-07-03): Timer handle pattern — startTimer() returns {stop}
 * instead of relying on a module-level global singleton.  Each caller
 * manages its own timer lifecycle, preventing cross-invocation races.
 */

// ── Log with spinner clearing ────────────────────────────────────────────────

function log(prefix, msg) {
    process.stderr.write('\r\x1b[K'); // clear spinner line
    process.stderr.write(`[${prefix}] ${msg}\n`);
}

// ── Elapsed timer with braille spinner ───────────────────────────────────────

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Start an elapsed timer with braille-spinner display on stderr.
 * Returns a handle so the caller controls lifecycle — no global state.
 *
 * @param {string} prefix  — log prefix shown in brackets
 * @param {string} label   — description shown next to spinner
 * @returns {{ stop: () => void }}
 */
function startTimer(prefix, label) {
    const startTime = Date.now();
    let i = 0;
    const interval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        process.stderr.write(`\r[${prefix}] ${SPINNER_FRAMES[i]} ${label} (${mins}:${secs})`);
        i = (i + 1) % SPINNER_FRAMES.length;
    }, 100);
    return {
        stop() {
            clearInterval(interval);
            process.stderr.write('\r\x1b[K'); // clear spinner line
        }
    };
}

// ── Progress spinner (single char, no timer) ─────────────────────────────────

function spinner(ch) {
    process.stderr.write(ch);
}

module.exports = { log, startTimer, spinner };
