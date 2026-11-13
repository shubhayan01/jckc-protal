#!/usr/bin/env node
/*
 * bulk-upload-content.js
 * ----------------------------------------------------------------------------
 * One-time importer that pushes the "JCKC Website Content" document library into
 * the live portal by calling the SAME authenticated API the HR "Attach file"
 * button uses (POST /api/pages/:slug/files). Files land on the server's
 * persistent /data/uploads volume and are recorded in the page_files table — so
 * nothing huge ever goes through git.
 *
 * It is idempotent: before uploading it reads each page's existing files and
 * skips any whose original filename is already attached, so you can safely
 * re-run it (e.g. after adding more source files).
 *
 * The source folder maps ONLY onto pages that already exist in the portal
 * (About Us, HR Desk, SOP Documents). Categories without a matching page
 * (Knowledge Center, Members, News & Announcements, Performance Monitoring,
 * Testimonials, etc.) are reported as SKIPPED rather than misfiled.
 *
 * ---------------------------------------------------------------------------
 * USAGE (run from the project root, Node 18+; Node 24 recommended):
 *
 *   node scripts/bulk-upload-content.js \
 *     --url   https://your-portal.up.railway.app \
 *     --email hr@justwords.in \
 *     --password 'yourpassword' \
 *     --dir   "JCKC Website Content-20261113T110050Z-1-001/JCKC Website Content" \
 *     --dry-run
 *
 * Drop --dry-run to actually upload. Credentials and URL can also be passed via
 * env vars: PORTAL_URL, PORTAL_EMAIL, PORTAL_PASSWORD, CONTENT_DIR.
 *
 * The account you log in with MUST be HR Admin / Super Admin (requireAdmin).
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// ----- tiny arg parser ------------------------------------------------------
function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  if (i >= 0 && i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  if (process.argv.includes('--' + name)) return true; // boolean flag
  return fallback;
}

const BASE = String(arg('url', process.env.PORTAL_URL) || '').replace(/\/+$/, '');
const EMAIL = arg('email', process.env.PORTAL_EMAIL);
const PASSWORD = arg('password', process.env.PORTAL_PASSWORD);
const DIR = arg('dir', process.env.CONTENT_DIR || 'JCKC Website Content-20261113T110050Z-1-001/JCKC Website Content');
const DRY = !!arg('dry-run', false);

// ----- folder -> existing page slug (first matching prefix wins) ------------
// Paths are relative to --dir and compared with forward slashes.
const MAP = [
  ['TOP MENU/JW About Us/JDPL company documents',            'company-documents'],
  ['TOP MENU/JW About Us/Justwords VMV',                     'vision'],
  ['TOP MENU/JW HR Desk/JW HR Handbook',                     'handbook'],
  ['TOP MENU/JW HR Desk/JW Policies and Holidays list',      'policies'],
  ['TOP MENU/JW HR Desk/JW Schemes',                         'schemes'],
  ['TOP MENU/JW SOP Documents/JW SOP - HR & Admin',          'sop-hr'],
  ['TOP MENU/JW SOP Documents/JW SOP - Content Operations',  'sop-content'],
  ['TOP MENU/JW SOP Documents/JW SOP - Business Development', 'sop-content'],
  ['TOP MENU/JW SOP Documents/JW SOP - Digital Mktg Operations', 'sop-seo'],
];

function slugFor(rel) {
  for (const [prefix, slug] of MAP) if (rel.startsWith(prefix)) return slug;
  return null;
}

// ----- recursive file walk --------------------------------------------------
function walk(root, base = root, out = []) {
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const full = path.join(base, entry.name);
    if (entry.isDirectory()) walk(root, full, out);
    else if (entry.isFile()) out.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return out;
}

// ----- http helpers ---------------------------------------------------------
let COOKIE = '';

async function login() {
  const res = await fetch(BASE + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Login failed: ' + (body.error || res.status));
  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  COOKIE = setCookies.map(c => c.split(';')[0]).join('; ');
  if (!COOKIE) throw new Error('No session cookie returned from login');
  return body.user;
}

async function existingOriginals(slug) {
  const res = await fetch(BASE + '/api/pages/' + slug, { headers: { cookie: COOKIE } });
  if (!res.ok) throw new Error('Could not read page ' + slug + ' (' + res.status + ')');
  const { page } = await res.json();
  return new Set((page.files || []).map(f => f.original));
}

async function uploadFile(slug, absPath, original) {
  const buf = fs.readFileSync(absPath);
  const fd = new FormData();
  fd.append('file', new Blob([buf]), original);
  const res = await fetch(BASE + '/api/pages/' + slug + '/files', {
    method: 'POST',
    headers: { cookie: COOKIE },
    body: fd,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || ('HTTP ' + res.status));
  return body;
}

// ----- main -----------------------------------------------------------------
(async () => {
  const root = path.resolve(DIR);
  if (!fs.existsSync(root)) {
    console.error('Content directory not found:', root);
    process.exit(1);
  }

  const files = walk(root);
  const planned = {};   // slug -> [{ rel, abs, original }]
  const skipped = {};   // top-category -> count

  for (const rel of files) {
    const slug = slugFor(rel);
    if (!slug) {
      const top = rel.split('/').slice(0, 2).join('/');
      skipped[top] = (skipped[top] || 0) + 1;
      continue;
    }
    (planned[slug] = planned[slug] || []).push({
      rel,
      abs: path.join(root, rel.split('/').join(path.sep)),
      original: path.basename(rel),
    });
  }

  console.log('\n=== JCKC content import plan ===');
  console.log('Source:', root);
  console.log('Target:', BASE || '(no --url given)');
  let totalPlanned = 0;
  for (const slug of Object.keys(planned).sort()) {
    console.log(`  ${slug.padEnd(20)} ${planned[slug].length} file(s)`);
    totalPlanned += planned[slug].length;
  }
  console.log(`  --> ${totalPlanned} files mapped to existing pages`);

  const skippedTotal = Object.values(skipped).reduce((a, b) => a + b, 0);
  if (skippedTotal) {
    console.log(`\nSKIPPED (no matching existing page) — ${skippedTotal} file(s):`);
    for (const cat of Object.keys(skipped).sort()) console.log(`  ${cat.padEnd(40)} ${skipped[cat]}`);
  }

  if (DRY) { console.log('\n[dry-run] Nothing uploaded. Re-run without --dry-run to upload.\n'); return; }

  if (!BASE || !EMAIL || !PASSWORD) {
    console.error('\nMissing --url / --email / --password (or PORTAL_URL / PORTAL_EMAIL / PORTAL_PASSWORD).');
    process.exit(1);
  }

  console.log('\nLogging in as', EMAIL, '...');
  const user = await login();
  console.log('Logged in as', user && user.name, '(' + (user && user.role) + ')');

  let uploaded = 0, skippedDup = 0, failed = 0;
  for (const slug of Object.keys(planned).sort()) {
    const have = await existingOriginals(slug);
    console.log(`\n# ${slug} (${have.size} already attached)`);
    for (const f of planned[slug]) {
      if (have.has(f.original)) { skippedDup++; continue; }
      try {
        await uploadFile(slug, f.abs, f.original);
        have.add(f.original);
        uploaded++;
        console.log('  + ' + f.original);
      } catch (ex) {
        failed++;
        console.log('  ! FAILED ' + f.original + ' — ' + ex.message);
      }
    }
  }

  console.log(`\n=== Done === uploaded ${uploaded}, already-present ${skippedDup}, failed ${failed}, un-mapped ${skippedTotal}\n`);
  if (failed) process.exit(1);
})().catch(ex => { console.error('\nFatal:', ex.message); process.exit(1); });
