'use strict';
/*
 * Database layer for the JustWords Associates' Portal.
 * Uses Node's built-in node:sqlite (no native build needed on Windows).
 * Creates the schema, seeds employees from seed_employees.json, seeds
 * default content pages, and exposes a few helpers used by server.js.
 */
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Data lives under DATA_DIR so a mounted persistent disk (e.g. Render) keeps
// the database across deploys. Falls back to the project dir for local dev.
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'portal.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ---------------------------------------------------------------- schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ecode        TEXT UNIQUE,
  name         TEXT NOT NULL,
  designation  TEXT,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  must_reset   INTEGER DEFAULT 1,
  role         TEXT DEFAULT 'employee',   -- employee | manager | director | ceo | hr | hr_admin
  is_manager   INTEGER DEFAULT 0,         -- has at least one direct report
  manager_id   INTEGER,
  department   TEXT,
  dob          TEXT,
  doj          TEXT,
  active       INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forms (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  type           TEXT NOT NULL,            -- 'kpi' | 'appraisal'
  user_id        INTEGER NOT NULL,
  fy             TEXT NOT NULL,            -- e.g. FY2026-27
  quarter        TEXT NOT NULL,            -- Q1..Q4
  status         TEXT DEFAULT 'draft',     -- draft | in_review | approved | sent_back
  stage_index    INTEGER DEFAULT -1,       -- index into approval chain currently pending
  chain          TEXT DEFAULT '[]',        -- JSON array of approver user ids
  data           TEXT DEFAULT '{}',        -- JSON payload of the form
  auto_score     REAL,
  final_score    REAL,
  submit_count   INTEGER DEFAULT 0,
  locked         INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now')),
  UNIQUE(type, user_id, fy, quarter),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS approvals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id     INTEGER NOT NULL,
  actor_id    INTEGER NOT NULL,
  action      TEXT NOT NULL,               -- submit | approve | send_back | edit
  stage       INTEGER,
  comment     TEXT,
  at          TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(form_id) REFERENCES forms(id)
);

CREATE TABLE IF NOT EXISTS pages (
  slug        TEXT PRIMARY KEY,
  section     TEXT,
  title       TEXT,
  body        TEXT,
  updated_by  INTEGER,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS suggestions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,                     -- null if anonymous
  anonymous   INTEGER DEFAULT 0,
  category    TEXT,
  subject     TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'open',         -- open | reviewing | closed
  hr_note     TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leaves (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  type        TEXT,
  from_date   TEXT,
  to_date     TEXT,
  days        REAL,
  reason      TEXT,
  status      TEXT DEFAULT 'pending',      -- pending | approved | rejected
  decided_by  INTEGER,
  decided_note TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vacancies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  department  TEXT,
  location    TEXT,
  type        TEXT,
  description TEXT,
  status      TEXT DEFAULT 'open',
  posted_by   INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS uploads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id     INTEGER,
  field       TEXT,
  filename    TEXT,
  original    TEXT,
  user_id     INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  type        TEXT,
  text        TEXT,
  link        TEXT,
  read        INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_files (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL,
  filename    TEXT,
  original    TEXT,
  uploaded_by INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS announcements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT,                        -- News | Announcement | Event | Celebration | Policy
  title       TEXT,
  body        TEXT,
  pinned      INTEGER DEFAULT 0,
  posted_by   INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);
`);

// Lightweight migration: add avatar column to users if it doesn't exist yet.
try { db.exec('ALTER TABLE users ADD COLUMN avatar TEXT'); } catch (_) { /* already there */ }

// ---------------------------------------------------------------- chat + form windows
// Added feature set: an internal Slack-style chat (public channels + direct
// messages) and HR-controlled open/close "windows" for the KPI & Appraisal forms.
db.exec(`
CREATE TABLE IF NOT EXISTS channels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT,
  topic       TEXT,
  is_dm       INTEGER DEFAULT 0,
  dm_a        INTEGER,                      -- DM participant ids (is_dm=1)
  dm_b        INTEGER,
  dm_key      TEXT UNIQUE,                  -- 'min:max' pair, dedupes DMs
  created_by  INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id  INTEGER NOT NULL,
  user_id     INTEGER NOT NULL,
  body        TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(channel_id) REFERENCES channels(id)
);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id, id);

CREATE TABLE IF NOT EXISTS channel_reads (
  user_id     INTEGER NOT NULL,
  channel_id  INTEGER NOT NULL,
  last_read   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS form_windows (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL,                -- kpi | appraisal
  fy          TEXT NOT NULL,
  scope       TEXT NOT NULL,                -- 'global' | 'user'
  user_id     INTEGER,                      -- set when scope='user'
  is_open     INTEGER DEFAULT 1,
  note        TEXT,
  updated_by  INTEGER,
  updated_at  TEXT DEFAULT (datetime('now')),
  UNIQUE(type, fy, scope, user_id)
);
`);

// Seed a couple of default public channels so chat isn't an empty room.
function seedChannels() {
  const empty = db.prepare('SELECT COUNT(*) c FROM channels').get().c === 0;
  if (!empty) return;
  const ins = db.prepare('INSERT INTO channels (name,topic,is_dm) VALUES (?,?,0)');
  ins.run('general', 'Company-wide chatter and quick questions');
  ins.run('random', 'Non-work banter, wins, memes and celebrations');
  ins.run('announcements', 'Important updates from HR & Leadership');
}

// ---------------------------------------------------------------- helpers
function firstName(name) {
  return String(name).trim().split(/\s+/)[0].replace(/[^A-Za-z]/g, '') || 'User';
}
function defaultPassword(name) {
  const f = firstName(name);
  return f.charAt(0).toUpperCase() + f.slice(1) + '@justword2026';
}
function deriveDepartment(desig) {
  const d = (desig || '').toLowerCase();
  if (/hr|human resource|admin/.test(d)) return 'HR & Admin';
  if (/seo/.test(d)) return 'SEO';
  if (/social|performance market|digital market|guestblog/.test(d)) return 'Digital Marketing';
  if (/web|developer/.test(d)) return 'Web Development';
  if (/design|graphic/.test(d)) return 'Design';
  if (/sales|business develop|business head|growth/.test(d)) return 'Sales & Growth';
  if (/automation|ai engineer|ai automation/.test(d)) return 'Automation';
  if (/content|copywriter|editor|writer|bfsi|marketer|quality/.test(d)) return 'Content';
  if (/ceo|founder|director|general manager/.test(d)) return 'Leadership';
  return 'Content';
}
function roleFor(desig) {
  const d = (desig || '').toLowerCase();
  if (/ceo|founder/.test(d)) return 'ceo';
  if (/director/.test(d)) return 'director';
  if (/manager\s*-\s*hr|hr & admin|hr executive|hr trainee|human resource/.test(d)) {
    return /manager\s*-\s*hr|hr & admin/.test(d) ? 'hr_admin' : 'hr';
  }
  return null; // decided later (manager vs employee)
}

// ---------------------------------------------------------------- seeding
function seed() {
  const count = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  if (count > 0) return; // already seeded

  const seedFile = path.join(__dirname, 'seed_employees.json');
  const emps = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

  const insert = db.prepare(`INSERT INTO users
    (ecode,name,designation,email,password,must_reset,role,department,dob,doj)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);

  // First pass: insert everyone with a temporary role.
  const byName = {};
  for (const e of emps) {
    const email = (e.email || (e.ecode.toLowerCase() + '@justwords.in')).trim();
    const pass = bcrypt.hashSync(defaultPassword(e.name), 10);
    const r = roleFor(e.designation) || 'employee';
    const info = insert.run(
      e.ecode, e.name.trim(), e.designation, email, pass, 1, r,
      deriveDepartment(e.designation), null, null
    );
    byName[e.name.trim().toLowerCase()] = { id: Number(info.lastInsertRowid), raw: e };
  }

  // Second pass: wire manager_id from the reporting-manager name.
  const setMgr = db.prepare('UPDATE users SET manager_id=? WHERE id=?');
  for (const key in byName) {
    const { id, raw } = byName[key];
    const mgrName = (raw.manager || '').trim().toLowerCase();
    if (mgrName && byName[mgrName]) setMgr.run(byName[mgrName].id, id);
  }

  // Third pass: mark anyone who has direct reports as a manager.
  const managerIds = db.prepare('SELECT DISTINCT manager_id FROM users WHERE manager_id IS NOT NULL').all();
  const markMgr = db.prepare("UPDATE users SET is_manager=1, role=CASE WHEN role='employee' THEN 'manager' ELSE role END WHERE id=?");
  for (const row of managerIds) markMgr.run(row.manager_id);

  // Test user (employee reporting to Saurav Jha so the full approval chain works).
  const saurav = db.prepare("SELECT id FROM users WHERE name LIKE 'Saurav%'").get();
  db.prepare(`INSERT INTO users (ecode,name,designation,email,password,must_reset,role,department,manager_id)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(
    'JW999', 'Test Associate', 'QA Test Account', 'test@justwords.in',
    bcrypt.hashSync('Test@1234', 10), 0, 'employee', 'Content',
    saurav ? saurav.id : null
  );

  console.log(`Seeded ${emps.length} employees + 1 test user.`);
  seedPages();
  seedVacancies();
}

function seedPages() {
  const pages = [
    ['vision', 'about', 'Our Vision',
      'To be the most trusted partner for content-driven, transformational digital journeys — where every associate grows as fast as the brands we build.'],
    ['mission', 'about', 'Our Mission',
      'Together we create "Content driven transformational digital journeys" for our customers. We combine editorial craft, SEO rigour, design and automation to deliver measurable growth, and we invest deeply in the people who make it happen.'],
    ['company-documents', 'about', 'Company Documents',
      'Central repository for incorporation details, org charts, brand guidelines and other reference documents. HR Admin can attach and update items here.'],
    ['handbook', 'hr', 'Employee Handbook',
      'The JustWords Handbook covers working hours, code of conduct, communication norms, and expectations for every associate. Read it end to end during onboarding.'],
    ['schemes', 'hr', 'Schemes & Benefits',
      'Performance Based Incentive (PBI), referral bonus, learning reimbursement and wellness schemes available to associates on regular payroll.'],
    ['policies', 'hr', 'Policies',
      'Leave policy, POSH policy, IT & data security policy, and remote-work policy. All associates are expected to comply with the latest published versions.'],
    ['leave', 'hr', 'Leave', 'Apply for leave and track approvals from the Leave module.'],
    ['vacancies', 'hr', 'Vacancies', 'Open positions across JustWords. Refer great people — referral bonuses apply.'],
    ['sop-hr', 'sop', 'SOP — HR', 'Standard operating procedures for HR: onboarding, attendance, appraisal cycles, exit process.'],
    ['sop-seo', 'sop', 'SOP — SEO', 'Keyword research, on-page checklist, technical audit cadence, reporting standards.'],
    ['sop-content', 'sop', 'SOP — Content', 'Briefing, drafting, editing, QA and publishing workflow with quality gates.'],
    ['sop-webdev', 'sop', 'SOP — Web Dev', 'Ticket intake, staging discipline, QA checklist, deployment and rollback steps.'],
    ['sop-automation', 'sop', 'SOP — Automation', 'Workflow intake, tooling standards, secrets handling, monitoring and handover.'],
    ['tools', 'tools', 'Tools', 'The stack JustWords associates use day to day — access is provisioned by IT/HR Admin.'],
  ];
  const ins = db.prepare('INSERT OR IGNORE INTO pages (slug,section,title,body) VALUES (?,?,?,?)');
  for (const p of pages) ins.run(...p);
}

function seedVacancies() {
  const v = db.prepare('INSERT INTO vacancies (title,department,location,type,description) VALUES (?,?,?,?,?)');
  v.run('Senior Content Editor', 'Content', 'Gurugram / Remote', 'Full-time', 'Own quality for BFSI content pods. 5+ years editorial experience.');
  v.run('SEO Executive', 'SEO', 'Gurugram', 'Full-time', 'Technical + on-page SEO across client accounts.');
}

// Idempotent: seeds a few starter announcements only when the table is empty,
// so it also populates on databases created before this feature existed.
function seedAnnouncements() {
  const empty = db.prepare('SELECT COUNT(*) c FROM announcements').get().c === 0;
  if (!empty) return;
  const a = db.prepare('INSERT INTO announcements (category,title,body,pinned) VALUES (?,?,?,?)');
  a.run('Announcement', 'Welcome to the refreshed JustWords Portal',
    'One home for KPIs, appraisals, policies, leave and the people behind the work. Use Quick access to jump straight to what you need — and check back here for news and updates.', 1);
  a.run('News', 'Q2 FY2026-27 KPI window is now open',
    'Head to Performance → KPI to fill and submit your quarter. It then routes up your reporting line for review and approval.', 0);
  a.run('Event', 'Monthly Town Hall — last Friday, 4:30 PM',
    'Company-wide updates, wins and an open Q&A with leadership. A calendar invite will follow by email.', 0);
  a.run('Celebration', 'The Suggestion Box is live',
    'Have an idea to make JustWords better? Share feedback or concerns with HR — anonymously if you prefer.', 0);
}

// Allow `node db.js --reseed` to wipe and rebuild (dev convenience).
if (require.main === module && process.argv.includes('--reseed')) {
  for (const t of ['messages', 'channel_reads', 'channels', 'form_windows', 'uploads', 'approvals', 'forms', 'leaves', 'suggestions', 'vacancies', 'announcements', 'pages', 'users']) {
    try { db.exec(`DELETE FROM ${t};`); } catch (_) {}
  }
  seed();
  console.log('Reseed complete.');
}

seed();
seedAnnouncements();
seedChannels();

module.exports = { db };
