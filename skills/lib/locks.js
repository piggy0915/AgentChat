/**
 * Shared file locking — atomic mkdir-based mutex for provider mutual exclusion.
 *
 * Used by AgentChat-FreeSubAgent and Web-SubAgent-Workflow.
 * Locks live in /tmp/ai_locks/<provider>/ — one directory per provider.
 * Only the process that successfully creates the directory holds the lock.
 * Stale-lock cleanup uses atomic renameSync to avoid TOCTOU races.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const LOCK_DIR = path.join(os.tmpdir(), "ai_locks");
try { fs.mkdirSync(LOCK_DIR, { recursive: true }); } catch (_) {}

function acquireLock(provider) {
    const lockDir = path.join(LOCK_DIR, provider);
    try {
        fs.mkdirSync(lockDir);
        fs.writeFileSync(path.join(lockDir, "pid"), `${process.pid}\n${Date.now()}`);
        return true;
    } catch (_) {
        try {
            const pidFile = path.join(lockDir, "pid");
            const data = fs.readFileSync(pidFile, "utf8").trim();
            const oldPid = parseInt(data.split("\n")[0], 10);
            try { process.kill(oldPid, 0); } catch (_) {
                const staleDir = `${lockDir}.stale.${process.pid}`;
                try {
                    fs.renameSync(lockDir, staleDir);
                    fs.rmSync(staleDir, { recursive: true, force: true });
                    fs.mkdirSync(lockDir);
                    fs.writeFileSync(path.join(lockDir, "pid"), `${process.pid}\n${Date.now()}`);
                    return true;
                } catch (_) {
                    try {
                        fs.mkdirSync(lockDir);
                        fs.writeFileSync(path.join(lockDir, "pid"), `${process.pid}\n${Date.now()}`);
                        return true;
                    } catch (_) {}
                }
            }
        } catch (_) {}
        return false;
    }
}

function releaseLock(provider) {
    const lockDir = path.join(LOCK_DIR, provider);
    try {
        const pidFile = path.join(lockDir, "pid");
        const data = fs.readFileSync(pidFile, "utf8").trim();
        if (parseInt(data.split("\n")[0], 10) === process.pid) {
            fs.rmSync(lockDir, { recursive: true, force: true });
        }
    } catch (_) {}
}

function cleanupAllLocks() {
    let entries;
    try { entries = fs.readdirSync(LOCK_DIR); } catch (_) { return; }
    for (const name of entries) {
        const lockDir = path.join(LOCK_DIR, name);
        try {
            const pidFile = path.join(lockDir, "pid");
            const data = fs.readFileSync(pidFile, "utf8").trim();
            if (parseInt(data.split("\n")[0], 10) === process.pid) {
                fs.rmSync(lockDir, { recursive: true, force: true });
            }
        } catch (_) {}
    }
}

module.exports = { acquireLock, releaseLock, cleanupAllLocks, LOCK_DIR };
