'use strict';
/*
 * One-time "fresh slate" cleanup for the Justwords portal.
 *
 * KEEPS:  the employee roster (users) and all content/SOP pages (pages, page_files),
 *         plus the single public "announcements" broadcast channel.
 * WIPES:  every piece of entered/transactional data — KPI & appraisal forms,
 *         approvals, uploads (DB rows), suggestions, leaves, referrals,
 *         reimbursements, notifications, assets + audits, announcements posts,
 *         form windows, and all chat messages/reads. Test-created chat channels
 *         (DMs and private groups) and their memberships are removed too.
 * ALSO:   deletes the retired "Test Associate" (JW999) QA account.
 *
 * It does NOT touch the real employees, their passwords, or the content pages, so
 * everyone can still log in and all future data they enter is preserved.
 *
 * Safe to run more than once (idempotent). Resolves the database the same way the
 * app does, so on Railway it cleans the DB on the mounted volume (DATA_DIR=/data).
 *
 *   node scripts/clean-test-data.js          # do the cleanup
 *   node scripts/clean-test-data.js --dry    # show what WOULD be removed, change nothing
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DRY = process.argv.includes('--dry') || process.argv.includes('--dry-run');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'portal.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`No database found at ${DB_PATH}.`);
  console.error('On Railway make sure DATA_DIR points at your mounted volume (e.g. /data).');
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = OFF;'); // we clear child + parent tables together

const count = (sql, ...p) => { try { return db.prepare(sql).get(...p).c; } catch (_) { return 0; } };
const run = (sql, ...p) => { try { return db.prepare(sql).run(...p).changes; } catch (_) { return 0; } };

console.log(`\nDatabase: ${DB_PATH}`);
console.log(DRY ? '*** DRY RUN — nothing will be changed ***\n' : '');

// --- what we keep, for reassurance ---
const keptUsers = count('SELECT COUNT(*) c FROM users');
const keptPages = count('SELECT COUNT(*) c FROM pages');

// Transactional tables wiped wholesale.
const wipeTables = [
  'messages', 'channel_reads', 'form_windows', 'uploads', 'approvals', 'forms',
  'leaves', 'suggestions', 'referrals', 'reimbursements', 'notifications',
  'asset_audits', 'assets', 'announcements',
];

console.log('Will remove:');
for (const t of wipeTables) console.log(`  ${String(count(`SELECT COUNT(*) c FROM ${t}`)).padStart(5)}  ${t}`);

// Test-created chat channels (keep only the public "announcements" broadcast channel).
const testChannels = count("SELECT COUNT(*) c FROM channels WHERE is_dm=1 OR is_group=1 OR lower(name)<>'announcements'");
console.log(`  ${String(testChannels).padStart(5)}  chat channels (DMs / groups — keeps "announcements")`);

// The retired QA account.
const testUser = count("SELECT COUNT(*) c FROM users WHERE ecode='JW999'");
console.log(`  ${String(testUser).padStart(5)}  Test Associate (JW999) account`);

console.log(`\nWill keep: ${keptUsers} employees, ${keptPages} content pages, and the "announcements" channel.`);

if (DRY) { console.log('\nDry run complete. Re-run without --dry to apply.\n'); process.exit(0); }

// --- apply ---
let removed = 0;
for (const t of wipeTables) removed += run(`DELETE FROM ${t}`);

// Remove the test chat channels, their membership and any stray reads/messages.
const chans = db.prepare("SELECT id FROM channels WHERE is_dm=1 OR is_group=1 OR lower(name)<>'announcements'").all();
for (const c of chans) {
  run('DELETE FROM messages WHERE channel_id=?', c.id);
  run('DELETE FROM channel_reads WHERE channel_id=?', c.id);
  run('DELETE FROM channel_members WHERE channel_id=?', c.id);
  run('DELETE FROM channels WHERE id=?', c.id);
}

// Delete the QA account.
removed += run("DELETE FROM users WHERE ecode='JW999'");

db.exec('VACUUM;');

console.log(`\n✅ Cleanup done. Removed ${removed} data rows + ${chans.length} test channels.`);
console.log(`   Kept ${count('SELECT COUNT(*) c FROM users')} employees and ${count('SELECT COUNT(*) c FROM pages')} pages.`);
console.log('   (The "announcements" channel and default starter announcements are recreated on next app start.)\n');
