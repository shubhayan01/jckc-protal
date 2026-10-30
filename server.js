'use strict';
/*
 * Justwords Collaborative Knowledge Center — Express server.
 * Serves the SPA in /public and a small REST API backed by SQLite.
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
// Uploads live under DATA_DIR so a mounted persistent disk keeps them across deploys.
const DATA_DIR = process.env.DATA_DIR || __dirname;
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Trust the platform proxy (Render/Heroku) so secure cookies work behind TLS termination.
if (IS_PROD) app.set('trust proxy', 1);

// Normal API bodies are capped at 2mb. The backup-restore route is the one exception
// (a full DB can be larger), so it's skipped here and parsed by its own 64mb parser.
const jsonSmall = express.json({ limit: '2mb' });
app.use((req, res, next) => (req.path === '/api/admin/backup/import' ? next() : jsonSmall(req, res, next)));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'justwords-portal-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: IS_PROD, maxAge: 1000 * 60 * 60 * 8 },
}));

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
      cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '_' + safe);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ---------------------------------------------------------------- helpers
function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id, ecode: u.ecode, name: u.name, designation: u.designation,
    email: u.email, role: u.role, is_manager: !!u.is_manager,
    manager_id: u.manager_id, department: u.department,
    must_reset: !!u.must_reset, avatar: u.avatar || null,
  };
}
function notify(userId, text, link, type) {
  if (!userId) return;
  db.prepare('INSERT INTO notifications (user_id,text,link,type) VALUES (?,?,?,?)').run(userId, text, link || null, type || 'info');
}
// Email hook. Email delivery is intentionally disabled for now (the portal uses in-app
// notifications only). This is the single place to wire a real transport (e.g. nodemailer
// driven by SMTP_* env vars) later — every feature that "emails" calls through here so
// turning email on is a one-function change. `to` may be omitted to mean "whole org".
function sendOrgEmail(subject, body, from, to) {
  try {
    const who = to ? (Array.isArray(to) ? to.length + ' recipient(s)' : to) : 'the whole organisation';
    console.log(`[email:disabled] would send "${subject}" to ${who}` + (from ? ` (from ${from.name})` : ''));
  } catch (_) { /* never let email logging break a request */ }
}
function getUser(id) { return db.prepare('SELECT * FROM users WHERE id=?').get(id); }
function requireAuth(req, res, next) {
  if (!req.session.uid) return res.status(401).json({ error: 'Not authenticated' });
  req.user = getUser(req.session.uid);
  if (!req.user) { req.session.destroy(() => {}); return res.status(401).json({ error: 'Session invalid' }); }
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
const isHR = (u) => u.role === 'hr' || u.role === 'hr_admin';
// Super admins (CEO + Director, e.g. Payel & Amlan) have full control — they can do
// everything HR can, plus the HR-Admin console. Admin-level = HR roles + super admins.
const isSuperAdmin = (u) => u.role === 'ceo' || u.role === 'director';
const isAdminLevel = (u) => isHR(u) || isSuperAdmin(u);
function requireHR(req, res, next) {
  if (!isAdminLevel(req.user)) return res.status(403).json({ error: 'HR only' });
  next();
}
function requireAdmin(req, res, next) {
  if (!isAdminLevel(req.user)) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Is the KPI/Appraisal filing window open for this owner right now?
// A per-user override (scope='user') wins; otherwise the global window applies;
// with no configuration at all the window defaults to open.
function formWindowOpen(type, fy, userId) {
  const ov = db.prepare("SELECT is_open FROM form_windows WHERE type=? AND fy=? AND scope='user' AND user_id=?").get(type, fy, userId);
  if (ov) return !!ov.is_open;
  const g = db.prepare("SELECT is_open FROM form_windows WHERE type=? AND fy=? AND scope='global' AND user_id IS NULL").get(type, fy);
  if (g) return !!g.is_open;
  return true;
}
function upsertWindow(type, fy, scope, userId, isOpen, note, actorId) {
  const existing = db.prepare(
    "SELECT id FROM form_windows WHERE type=? AND fy=? AND scope=? AND " + (userId == null ? 'user_id IS NULL' : 'user_id=?')
  ).get(...(userId == null ? [type, fy, scope] : [type, fy, scope, userId]));
  if (existing) {
    db.prepare("UPDATE form_windows SET is_open=?, note=?, updated_by=?, updated_at=datetime('now') WHERE id=?")
      .run(isOpen ? 1 : 0, note || null, actorId, existing.id);
    return existing.id;
  }
  const info = db.prepare('INSERT INTO form_windows (type,fy,scope,user_id,is_open,note,updated_by) VALUES (?,?,?,?,?,?,?)')
    .run(type, fy, scope, userId, isOpen ? 1 : 0, note || null, actorId);
  return Number(info.lastInsertRowid);
}

// Approval chain = manager ids from owner up to (and including) the CEO.
function approvalChain(userId) {
  const chain = [];
  const seen = new Set([userId]);
  let cur = getUser(userId);
  while (cur && cur.manager_id && !seen.has(cur.manager_id)) {
    chain.push(cur.manager_id);
    seen.add(cur.manager_id);
    cur = getUser(cur.manager_id);
  }
  return chain; // e.g. [Saurav, Amlan, Payel]
}
// Set of ancestor ids (managers up the chain) — used for view/edit rights.
function ancestorIds(userId) { return new Set(approvalChain(userId)); }
// A non-owner who may edit an associate's form & have those edits persist: anyone in
// the reporting line, plus HR and leadership. (Fixes manager/HR edits + comments not
// showing to the associate because they were silently dropped on save.)
function canEditOthersForm(ownerId, actor) {
  return ancestorIds(ownerId).has(actor.id) || isHR(actor) || ['ceo', 'director'].includes(actor.role);
}

function stageLabel(form) {
  if (form.status === 'draft') return 'Draft — with employee';
  if (form.status === 'sent_back') return 'Sent back — with employee';
  if (form.status === 'approved') return 'Approved — complete';
  const chain = JSON.parse(form.chain || '[]');
  const id = chain[form.stage_index];
  const appr = id ? getUser(id) : null;
  return appr ? `Pending approval: ${appr.name} (${appr.designation})` : 'In review';
}

function formView(form, viewer) {
  const owner = getUser(form.user_id);
  const chain = JSON.parse(form.chain || '[]');
  const anc = ancestorIds(form.user_id);
  const isOwner = viewer.id === form.user_id;
  const isAncestor = anc.has(viewer.id);
  const hrOrLead = isHR(viewer) || ['ceo', 'director'].includes(viewer.role);
  const fullAccess = isAncestor || hrOrLead;        // managers + HR/leadership see everything
  const isAppraisal = form.type === 'appraisal';
  const currentApprover = chain[form.stage_index];
  const canApprove = form.status === 'in_review' && currentApprover === viewer.id;
  const windowOpen = formWindowOpen(form.type, form.fy, form.user_id);
  const canEdit =
    (isOwner && windowOpen && (form.status === 'draft' || form.status === 'sent_back')) ||
    (isAncestor); // managers may edit an associate's form at any time

  let data = JSON.parse(form.data || '{}');
  let redacted = false;

  // ---- confidentiality: the appraisee must never see others' ratings ----
  // 360° peer scores are entered by the manager and, together with the manager's own
  // ratings and the final score, are hidden from the appraisee.
  if (isAppraisal && isOwner && !fullAccess) {
    const mr = data.managerReview || {};
    data = {
      kind: data.kind,
      self: data.self || {},
      employeeRemark: data.employeeRemark || null,
      peerCount: (data.peers || []).length,
      // The manager's closing message is shared only once the appraisal is published.
      sharedFeedback: form.status === 'approved' ? (mr.overall || '') : '',
    };
    redacted = true;
  }

  const showScores = !isAppraisal || fullAccess;    // scores are confidential on appraisals

  // ---- KPI: all four quarters visible together -------------------------------
  // Each quarter is its own form record running its own approval chain, but the
  // tracker shows Q1–Q4 side by side. For every quarter other than this one we
  // pull its own form's result + status so a finished quarter stays visible
  // (read-only) as "previous data" while a later quarter is being filled.
  let quarters;
  if (form.type === 'kpi') {
    const sibs = db.prepare(
      "SELECT quarter, data, status FROM forms WHERE type='kpi' AND user_id=? AND fy=?"
    ).all(form.user_id, form.fy);
    const byQ = {};
    for (const s of sibs) { try { byQ[s.quarter] = { data: JSON.parse(s.data || '{}'), status: s.status }; } catch (_) { byQ[s.quarter] = { data: {}, status: s.status }; } }
    const myRows = Array.isArray(data.rows) ? data.rows : [];
    quarters = {};
    for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
      const qk = q.toLowerCase();
      const sib = q === form.quarter ? { data, status: form.status } : byQ[q];
      const srows = sib && Array.isArray(sib.data.rows) ? sib.data.rows : [];
      // Align the sibling quarter's results to THIS form's rows: match on the
      // objective text first (robust to re-ordering), fall back to position.
      const results = myRows.map((r, i) => {
        let hit = null;
        if (r && r.kpi) hit = srows.find(x => x && x.kpi && x.kpi.trim() === r.kpi.trim());
        if (!hit) hit = srows[i];
        return hit ? (hit[qk] || '') : '';
      });
      const st = sib ? sib.status : 'none';
      quarters[q] = {
        results,
        status: st,
        exists: !!sib,
        // "done" quarters are locked and shown as history; in_review is also locked.
        locked: st === 'approved' || st === 'in_review',
      };
    }
  }

  return {
    id: form.id, type: form.type, fy: form.fy, quarter: form.quarter,
    status: form.status, stage_index: form.stage_index,
    stage_label: stageLabel(form),
    auto_score: showScores ? form.auto_score : null,
    final_score: showScores ? form.final_score : null,
    submit_count: form.submit_count, locked: !!form.locked,
    updated_at: form.updated_at, created_at: form.created_at,
    owner: { id: owner.id, name: owner.name, designation: owner.designation, department: owner.department, ecode: owner.ecode, email: owner.email, manager_id: owner.manager_id },
    chain: chain.map((cid, i) => {
      const u = getUser(cid);
      let state = 'waiting';
      if (form.status === 'approved') state = 'approved';
      else if (i < form.stage_index) state = 'approved';
      else if (i === form.stage_index && form.status === 'in_review') state = 'current';
      else if (form.status === 'sent_back' && i === 0) state = 'sent_back';
      return { id: cid, name: u.name, designation: u.designation, state };
    }),
    data, quarters,
    history: db.prepare('SELECT a.*, u.name actor_name FROM approvals a JOIN users u ON u.id=a.actor_id WHERE a.form_id=? ORDER BY a.at').all(form.id),
    rights: {
      isOwner, isAncestor, canApprove, canEdit, windowOpen,
      canManagePeers: isAppraisal && fullAccess && form.status !== 'approved',
      fullAccess, redacted,
    },
  };
}

// ---------------------------------------------------------------- auth
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const u = db.prepare('SELECT * FROM users WHERE lower(email)=lower(?) AND active=1').get(String(email).trim());
  if (!u || !bcrypt.compareSync(password, u.password)) return res.status(401).json({ error: 'Invalid email or password' });
  req.session.uid = u.id;
  res.json({ user: publicUser(u) });
});
app.post('/api/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get('/api/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

// Whether the current user's own KPI / Appraisal filing windows are open right now.
app.get('/api/my-windows', requireAuth, (req, res) => {
  const fy = req.query.fy || 'FY2026-27';
  res.json({
    fy,
    kpi: formWindowOpen('kpi', fy, req.user.id),
    appraisal: formWindowOpen('appraisal', fy, req.user.id),
  });
});

app.post('/api/change-password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!next || String(next).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  if (!req.user.must_reset) {
    if (!bcrypt.compareSync(current || '', req.user.password)) return res.status(400).json({ error: 'Current password is incorrect' });
  }
  db.prepare('UPDATE users SET password=?, must_reset=0 WHERE id=?').run(bcrypt.hashSync(String(next), 10), req.user.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- directory / org
app.get('/api/directory', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT id,ecode,name,designation,email,department,role,manager_id,is_manager,avatar FROM users WHERE active=1 ORDER BY name').all();
  res.json({ users: rows });
});

// ---------------------------------------------------------------- forms (KPI + Appraisal)
function ensureForm(type, userId, fy, quarter) {
  let f = db.prepare('SELECT * FROM forms WHERE type=? AND user_id=? AND fy=? AND quarter=?').get(type, userId, fy, quarter);
  if (!f) {
    // Carry objective rows forward from the most complete existing quarter so the
    // associate doesn't re-enter their KPIs every quarter — only the new quarter's
    // result columns start blank.
    const seed = carryForwardData(type, userId, fy, quarter);
    db.prepare('INSERT INTO forms (type,user_id,fy,quarter,chain,data) VALUES (?,?,?,?,?,?)')
      .run(type, userId, fy, quarter, JSON.stringify(approvalChain(userId)), JSON.stringify(seed));
    f = db.prepare('SELECT * FROM forms WHERE type=? AND user_id=? AND fy=? AND quarter=?').get(type, userId, fy, quarter);
  }
  return f;
}

function carryForwardData(type, userId, fy, newQuarter) {
  const prev = db.prepare('SELECT data FROM forms WHERE type=? AND user_id=? AND fy=? ORDER BY updated_at DESC').all(type, userId, fy);
  for (const row of prev) {
    let d; try { d = JSON.parse(row.data || '{}'); } catch (_) { continue; }
    if (d && Array.isArray(d.rows) && d.rows.length) {
      // copy row definitions; clear the target quarter's result column so it starts empty
      const qk = newQuarter.toLowerCase();
      const rows = d.rows.map(r => { const c = { ...r }; c[qk] = ''; return c; });
      return { employee: { ...(d.employee || {}) }, rows, managerComments: {} };
    }
  }
  return {}; // nothing to carry — client seeds defaults
}

// List forms visible to me: my own + those of my direct/indirect reports + (HR sees all)
app.get('/api/forms', requireAuth, (req, res) => {
  const type = req.query.type === 'appraisal' ? 'appraisal' : 'kpi';
  const fy = req.query.fy || 'FY2026-27';
  let owners;
  if (isHR(req.user) || req.user.role === 'ceo' || req.user.role === 'director') {
    owners = db.prepare('SELECT id FROM users WHERE active=1').all().map(r => r.id);
  } else {
    // me + everyone below me in the tree
    owners = [req.user.id, ...subtreeIds(req.user.id)];
  }
  const placeholders = owners.map(() => '?').join(',');
  const forms = owners.length
    ? db.prepare(`SELECT * FROM forms WHERE type=? AND fy=? AND user_id IN (${placeholders}) ORDER BY updated_at DESC`).all(type, fy, ...owners)
    : [];
  res.json({ forms: forms.map(f => formView(f, req.user)) });
});

function subtreeIds(rootId) {
  const out = [];
  const stack = db.prepare('SELECT id FROM users WHERE manager_id=?').all(rootId).map(r => r.id);
  while (stack.length) {
    const id = stack.pop();
    out.push(id);
    for (const r of db.prepare('SELECT id FROM users WHERE manager_id=?').all(id)) stack.push(r.id);
  }
  return out;
}

// My inbox — forms currently awaiting my approval.
app.get('/api/inbox', requireAuth, (req, res) => {
  const forms = db.prepare("SELECT * FROM forms WHERE status='in_review'").all()
    .filter(f => { const c = JSON.parse(f.chain || '[]'); return c[f.stage_index] === req.user.id; })
    .map(f => formView(f, req.user));
  res.json({ forms });
});

// Get or create a specific form (owner defaults to me; managers/HR can pass user_id).
app.get('/api/form', requireAuth, (req, res) => {
  const type = req.query.type === 'appraisal' ? 'appraisal' : 'kpi';
  const fy = req.query.fy || 'FY2026-27';
  const quarter = ['Q1', 'Q2', 'Q3', 'Q4'].includes(req.query.quarter) ? req.query.quarter : 'Q1';
  const ownerId = req.query.user_id ? Number(req.query.user_id) : req.user.id;
  // access check
  if (ownerId !== req.user.id && !ancestorIds(ownerId).has(req.user.id) && !isHR(req.user) && !['ceo', 'director'].includes(req.user.role))
    return res.status(403).json({ error: 'Not allowed to view this form' });
  const f = ensureForm(type, ownerId, fy, quarter);
  res.json({ form: formView(f, req.user) });
});

app.get('/api/form/:id', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Not found' });
  if (f.user_id !== req.user.id && !ancestorIds(f.user_id).has(req.user.id) && !isHR(req.user) && !['ceo', 'director'].includes(req.user.role))
    return res.status(403).json({ error: 'Not allowed' });
  res.json({ form: formView(f, req.user) });
});

// Save draft (owner when unlocked, or any manager in the chain).
app.post('/api/form/:id/save', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Not found' });
  const isOwner = f.user_id === req.user.id;
  const canFull = canEditOthersForm(f.user_id, req.user);
  if (!canFull && !(isOwner && (f.status === 'draft' || f.status === 'sent_back')))
    return res.status(403).json({ error: 'Form is locked — awaiting approval' });
  // Owners can only edit while HR has the filing window open (managers/HR exempt).
  if (isOwner && !canFull && !formWindowOpen(f.type, f.fy, f.user_id))
    return res.status(403).json({ error: `The ${f.type.toUpperCase()} window is closed by HR — you can't edit right now.` });
  const data = normMgrComments(req.body.data || {});
  db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(JSON.stringify(data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  if (canFull && !isOwner) {
    db.prepare('INSERT INTO approvals (form_id,actor_id,action,comment) VALUES (?,?,?,?)').run(f.id, req.user.id, 'edit', 'Edited the form');
    notify(f.user_id, `${req.user.name} updated your ${f.type.toUpperCase()} ${f.quarter} form`, '#/form/' + f.id, 'info');
  }
  res.json({ form: formView(getUser0(f.id), req.user) });
});
function getUser0(id) { return db.prepare('SELECT * FROM forms WHERE id=?').get(id); }

// Submit / resubmit — sends to first approver.
app.post('/api/form/:id/submit', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Not found' });
  if (f.user_id !== req.user.id) return res.status(403).json({ error: 'Only the owner can submit' });
  if (f.status === 'in_review') return res.status(400).json({ error: 'Already in review' });
  if (f.status === 'approved') return res.status(400).json({ error: 'Form is already approved and locked' });
  if (!formWindowOpen(f.type, f.fy, f.user_id))
    return res.status(403).json({ error: `The ${f.type.toUpperCase()} window is closed by HR — submission isn't allowed right now.` });
  let chain = approvalChain(f.user_id);
  if (chain.length === 0) {
    // Fallback for anyone without a reporting manager (e.g. HR / leadership): route to
    // the top of the org so the form doesn't dead-end and the reviewer actually gets it.
    const top = db.prepare(`SELECT id FROM users WHERE active=1 AND id!=? AND role IN ('ceo','director','hr_admin')
      ORDER BY CASE role WHEN 'ceo' THEN 0 WHEN 'director' THEN 1 ELSE 2 END LIMIT 1`).get(f.user_id);
    if (top) chain = [top.id];
  }
  if (chain.length === 0) return res.status(400).json({ error: 'No approver configured — ask HR to set your reporting manager.' });
  if (req.body.data) db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=? WHERE id=?').run(JSON.stringify(req.body.data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  db.prepare("UPDATE forms SET status='in_review', stage_index=0, chain=?, locked=1, submit_count=submit_count+1, updated_at=datetime('now') WHERE id=?")
    .run(JSON.stringify(chain), f.id);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,stage,comment) VALUES (?,?,?,?,?)').run(f.id, req.user.id, 'submit', 0, req.body.comment || 'Submitted for review');
  const label = f.type === 'appraisal' ? 'self-appraisal' : `${f.type.toUpperCase()} ${f.quarter}`;
  notify(chain[0], `${req.user.name} submitted their ${label} for your approval`, '#/form/' + f.id, 'submit');
  // Keep HR in the loop on appraisal submissions so they can always find them.
  if (f.type === 'appraisal') {
    for (const hr of db.prepare("SELECT id FROM users WHERE role IN ('hr','hr_admin') AND active=1").all())
      if (hr.id !== chain[0] && hr.id !== f.user_id) notify(hr.id, `${req.user.name} submitted their self-appraisal`, '#/form/' + f.id, 'submit');
  }
  res.json({ form: formView(db.prepare('SELECT * FROM forms WHERE id=?').get(f.id), req.user) });
});

// Manager comments are kept as ONE entry per manager per quarter (a list), so a later
// approver (e.g. the CEO) never overwrites the reporting manager's comment. Legacy
// single-object comments are migrated to a one-item list on the fly.
function normMgrComments(data) {
  data.managerComments = data.managerComments || {};
  for (const q of Object.keys(data.managerComments)) {
    const v = data.managerComments[q];
    if (v && !Array.isArray(v)) data.managerComments[q] = v.text ? [v] : [];
  }
  return data;
}
function upsertMgrComment(data, quarter, actor, text) {
  normMgrComments(data);
  const arr = data.managerComments[quarter] = data.managerComments[quarter] || [];
  const i = arr.findIndex(c => c.byId === actor.id);
  const txt = String(text || '').trim();
  if (!txt) { if (i >= 0) arr.splice(i, 1); return data; }
  const entry = { byId: actor.id, by: actor.name, text: txt, at: new Date().toISOString() };
  if (i >= 0) arr[i] = entry; else arr.push(entry);
  return data;
}

// Approve — advances to next approver, or marks fully approved at the end.
app.post('/api/form/:id/approve', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(req.params.id));
  if (!f || f.status !== 'in_review') return res.status(400).json({ error: 'Form is not awaiting approval' });
  const chain = JSON.parse(f.chain || '[]');
  if (chain[f.stage_index] !== req.user.id) return res.status(403).json({ error: 'It is not your turn to approve this form' });
  const comment = req.body.comment || '';
  const canFull = canEditOthersForm(f.user_id, req.user);
  // Persist the approver's in-form edits (field changes + row comments) and/or a
  // per-quarter manager comment, so the associate actually sees them afterwards.
  let data = JSON.parse(f.data || '{}');
  let dataChanged = false;
  if (req.body.data && canFull) { data = normMgrComments(req.body.data); dataChanged = true; }
  if (req.body.managerComment) {
    upsertMgrComment(data, f.quarter, req.user, req.body.managerComment);
    dataChanged = true;
  }
  if (dataChanged) {
    db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=? WHERE id=?')
      .run(JSON.stringify(data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  }
  const next = f.stage_index + 1;
  if (next >= chain.length) {
    db.prepare("UPDATE forms SET status='approved', stage_index=?, locked=1, updated_at=datetime('now') WHERE id=?").run(chain.length, f.id);
    notify(f.user_id, `Your ${f.type.toUpperCase()} ${f.quarter} is fully approved (final sign-off by ${req.user.name})`, '#/form/' + f.id, 'approved');
  } else {
    db.prepare("UPDATE forms SET stage_index=?, updated_at=datetime('now') WHERE id=?").run(next, f.id);
    notify(chain[next], `${getUser(f.user_id).name}'s ${f.type.toUpperCase()} ${f.quarter} is awaiting your approval`, '#/form/' + f.id, 'submit');
    notify(f.user_id, `${req.user.name} approved your ${f.type.toUpperCase()} ${f.quarter} — now with ${getUser(chain[next]).name}`, '#/form/' + f.id, 'approved');
  }
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,stage,comment) VALUES (?,?,?,?,?)').run(f.id, req.user.id, 'approve', f.stage_index, comment);
  res.json({ form: formView(db.prepare('SELECT * FROM forms WHERE id=?').get(f.id), req.user) });
});

// Send back — returns to the employee, unlocks for editing.
app.post('/api/form/:id/sendback', requireAuth, (req, res) => {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(req.params.id));
  if (!f || f.status !== 'in_review') return res.status(400).json({ error: 'Form is not awaiting approval' });
  const chain = JSON.parse(f.chain || '[]');
  if (chain[f.stage_index] !== req.user.id) return res.status(403).json({ error: 'It is not your turn to review this form' });
  const comment = req.body.comment || 'Please revise and resubmit.';
  // Persist the manager's in-form edits (field changes + row comments) before returning
  // the form, so the associate sees exactly what the manager changed.
  if (req.body.data && canEditOthersForm(f.user_id, req.user)) {
    const data = normMgrComments(req.body.data);
    db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=? WHERE id=?')
      .run(JSON.stringify(data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  }
  db.prepare("UPDATE forms SET status='sent_back', stage_index=-1, locked=0, updated_at=datetime('now') WHERE id=?").run(f.id);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,stage,comment) VALUES (?,?,?,?,?)').run(f.id, req.user.id, 'send_back', null, comment);
  notify(f.user_id, `${req.user.name} sent back your ${f.type.toUpperCase()} ${f.quarter}: ${comment}`, '#/form/' + f.id, 'sent_back');
  res.json({ form: formView(db.prepare('SELECT * FROM forms WHERE id=?').get(f.id), req.user) });
});

// ---------------------------------------------------------------- appraisal (self / 360 peers / manager review)
// These merge one slice of the appraisal payload at a time, so the appraisee (whose view
// is redacted) can never overwrite the peer/manager scores that are hidden from them.
function loadAppraisal(id) {
  const f = db.prepare('SELECT * FROM forms WHERE id=?').get(Number(id));
  if (!f || f.type !== 'appraisal') return null;
  return f;
}
function saveData(id, data) {
  db.prepare("UPDATE forms SET data=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(data), id);
}

// Employee saves their self-appraisal (only while it is with them).
app.post('/api/form/:id/self', requireAuth, (req, res) => {
  const f = loadAppraisal(req.params.id);
  if (!f) return res.status(404).json({ error: 'Appraisal not found' });
  if (f.user_id !== req.user.id) return res.status(403).json({ error: 'Only the appraisee can edit the self-appraisal' });
  if (!(f.status === 'draft' || f.status === 'sent_back')) return res.status(400).json({ error: 'Self-appraisal is locked — it is already under review' });
  if (!formWindowOpen(f.type, f.fy, f.user_id)) return res.status(403).json({ error: 'The Appraisal window is closed by HR right now.' });
  const data = JSON.parse(f.data || '{}');
  data.kind = 'appraisal-v2';
  data.self = req.body.self || {};
  saveData(f.id, data);
  res.json({ form: formView(loadAppraisal(f.id), req.user) });
});

// Employee adds/updates their remark on the process (allowed at any stage).
app.post('/api/form/:id/remark', requireAuth, (req, res) => {
  const f = loadAppraisal(req.params.id);
  if (!f) return res.status(404).json({ error: 'Appraisal not found' });
  if (f.user_id !== req.user.id) return res.status(403).json({ error: 'Only the appraisee can add an employee remark' });
  const data = JSON.parse(f.data || '{}');
  data.employeeRemark = { text: String(req.body.text || '').slice(0, 4000), at: new Date().toISOString() };
  saveData(f.id, data);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,comment) VALUES (?,?,?,?)').run(f.id, req.user.id, 'remark', 'Employee remark added');
  res.json({ form: formView(loadAppraisal(f.id), req.user) });
});

// Manager (or HR/leadership) enters the 360° peer scores directly.
// Peers are spoken to in person and scored on the manager's own machine — there is no
// invite or reviewer login. `peers` is an ordered list (Person 1, Person 2, …); each
// holds only per-parameter scores (plus an optional name the manager may note).
app.post('/api/form/:id/peers', requireAuth, (req, res) => {
  const f = loadAppraisal(req.params.id);
  if (!f) return res.status(404).json({ error: 'Appraisal not found' });
  if (!ancestorIds(f.user_id).has(req.user.id) && !isHR(req.user) && !['ceo', 'director'].includes(req.user.role))
    return res.status(403).json({ error: 'Only a reporting manager or HR can enter peer scores' });
  if (f.status === 'approved') return res.status(400).json({ error: 'Appraisal is published and locked' });
  const data = JSON.parse(f.data || '{}');
  const incoming = Array.isArray(req.body.peers) ? req.body.peers : [];
  data.peers = incoming.slice(0, 20).map(p => ({
    name: String(p.name || '').slice(0, 80),
    ratings: p.ratings && typeof p.ratings === 'object' ? p.ratings : {},
  }));
  saveData(f.id, data);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,comment) VALUES (?,?,?,?)').run(f.id, req.user.id, 'edit', 'Manager updated 360° peer scores');
  res.json({ form: formView(loadAppraisal(f.id), req.user) });
});

// Manager fills the appraisal-system rating form (per-competency ratings + summary).
app.post('/api/form/:id/manager-review', requireAuth, (req, res) => {
  const f = loadAppraisal(req.params.id);
  if (!f) return res.status(404).json({ error: 'Appraisal not found' });
  if (!ancestorIds(f.user_id).has(req.user.id) && !isHR(req.user) && !['ceo', 'director'].includes(req.user.role))
    return res.status(403).json({ error: 'Only a reporting manager or HR can fill the appraisal form' });
  if (f.status === 'approved') return res.status(400).json({ error: 'Appraisal is published and locked' });
  const data = JSON.parse(f.data || '{}');
  const mr = req.body.managerReview || {};
  const finalScore = mr.finalScore != null && mr.finalScore !== '' ? Number(mr.finalScore) : null;
  data.managerReview = {
    ratings: mr.ratings || {},
    strengths: String(mr.strengths || '').slice(0, 4000),
    improvements: String(mr.improvements || '').slice(0, 4000),
    overall: String(mr.overall || '').slice(0, 4000),
    finalScore,
    by: req.user.name, byId: req.user.id, at: new Date().toISOString(),
  };
  db.prepare("UPDATE forms SET data=?, final_score=?, updated_at=datetime('now') WHERE id=?")
    .run(JSON.stringify(data), finalScore, f.id);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,comment) VALUES (?,?,?,?)').run(f.id, req.user.id, 'edit', 'Manager updated the appraisal ratings');
  res.json({ form: formView(loadAppraisal(f.id), req.user) });
});

// File upload for supporting documents.
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  db.prepare('INSERT INTO uploads (form_id,field,filename,original,user_id) VALUES (?,?,?,?,?)')
    .run(req.body.form_id || null, req.body.field || null, req.file.filename, req.file.originalname, req.user.id);
  res.json({ filename: req.file.filename, original: req.file.originalname, url: '/uploads/' + req.file.filename });
});
app.use('/uploads', requireAuth, express.static(UPLOAD_DIR));

// avatar upload
app.post('/api/avatar', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  db.prepare('UPDATE users SET avatar=? WHERE id=?').run(req.file.filename, req.user.id);
  res.json({ avatar: req.file.filename, url: '/uploads/' + req.file.filename });
});

// ---------------------------------------------------------------- notifications
app.get('/api/notifications', requireAuth, (req, res) => {
  const items = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30').all(req.user.id);
  const unread = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND read=0').get(req.user.id).c;
  res.json({ items, unread });
});
app.post('/api/notifications/read', requireAuth, (req, res) => {
  if (req.body.id) db.prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(Number(req.body.id), req.user.id);
  else db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- page attachments
app.post('/api/pages/:slug/files', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  db.prepare('INSERT INTO page_files (slug,filename,original,uploaded_by) VALUES (?,?,?,?)')
    .run(req.params.slug, req.file.filename, req.file.originalname, req.user.id);
  res.json({ ok: true, url: '/uploads/' + req.file.filename, original: req.file.originalname });
});
app.delete('/api/pages/:slug/files/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM page_files WHERE id=? AND slug=?').run(Number(req.params.id), req.params.slug);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- content pages
app.get('/api/pages', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT slug,section,title,updated_at FROM pages ORDER BY section,title').all();
  res.json({ pages: rows });
});
app.get('/api/pages/:slug', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM pages WHERE slug=?').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Not found' });
  p.files = db.prepare('SELECT id,filename,original,created_at FROM page_files WHERE slug=? ORDER BY created_at DESC').all(req.params.slug);
  res.json({ page: p });
});
app.put('/api/pages/:slug', requireAuth, requireAdmin, (req, res) => {
  const { title, body } = req.body || {};
  db.prepare("UPDATE pages SET title=?, body=?, updated_by=?, updated_at=datetime('now') WHERE slug=?")
    .run(title, body, req.user.id, req.params.slug);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- suggestion box
app.post('/api/suggestions', requireAuth, (req, res) => {
  const { category, subject, message, anonymous } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });
  db.prepare('INSERT INTO suggestions (user_id,anonymous,category,subject,message) VALUES (?,?,?,?,?)')
    .run(anonymous ? null : req.user.id, anonymous ? 1 : 0, category || 'General', subject || '', message);
  const from = anonymous ? 'An associate (anonymous)' : req.user.name;
  for (const hr of db.prepare("SELECT id FROM users WHERE role IN ('hr','hr_admin') AND active=1").all())
    notify(hr.id, `New suggestion from ${from}: ${subject || category || 'General'}`, '#/hr/suggestions', 'info');
  res.json({ ok: true });
});
app.get('/api/suggestions', requireAuth, (req, res) => {
  if (!isAdminLevel(req.user)) return res.status(403).json({ error: 'HR only' });
  const rows = db.prepare(`SELECT s.*, u.name author FROM suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC`).all()
    .map(r => ({ ...r, author: r.anonymous ? 'Anonymous' : r.author }));
  res.json({ suggestions: rows });
});
app.post('/api/suggestions/:id', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  db.prepare('UPDATE suggestions SET status=?, hr_note=? WHERE id=?').run(req.body.status || 'reviewing', req.body.hr_note || '', Number(req.params.id));
  res.json({ ok: true });
});

// Leave requests have been removed from the portal.

// ---------------------------------------------------------------- vacancies
app.get('/api/vacancies', requireAuth, (req, res) => {
  res.json({ vacancies: db.prepare('SELECT * FROM vacancies ORDER BY created_at DESC').all() });
});
app.post('/api/vacancies', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  const { title, department, location, type, description } = req.body || {};
  db.prepare('INSERT INTO vacancies (title,department,location,type,description,posted_by) VALUES (?,?,?,?,?,?)')
    .run(title, department, location, type, description, req.user.id);
  res.json({ ok: true });
});
app.post('/api/vacancies/:id/close', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  db.prepare("UPDATE vacancies SET status='closed' WHERE id=?").run(Number(req.params.id));
  res.json({ ok: true });
});

// ---------------------------------------------------------------- employee referrals
// Any associate can refer a candidate for an open vacancy. HR is notified (in-app).
app.get('/api/referrals', requireAuth, (req, res) => {
  let rows;
  if (isAdminLevel(req.user)) {
    rows = db.prepare(`SELECT r.*, u.name AS referrer, v.title AS vacancy_title
      FROM referrals r LEFT JOIN users u ON u.id=r.referrer_id LEFT JOIN vacancies v ON v.id=r.vacancy_id
      ORDER BY r.created_at DESC`).all();
  } else {
    rows = db.prepare(`SELECT r.*, u.name AS referrer, v.title AS vacancy_title
      FROM referrals r LEFT JOIN users u ON u.id=r.referrer_id LEFT JOIN vacancies v ON v.id=r.vacancy_id
      WHERE r.referrer_id=? ORDER BY r.created_at DESC`).all(req.user.id);
  }
  res.json({ referrals: rows });
});
app.post('/api/referrals', requireAuth, (req, res) => {
  const b = req.body || {};
  if (!b.candidate_name || !String(b.candidate_name).trim()) return res.status(400).json({ error: "Candidate's name is required" });
  const vacId = b.vacancy_id ? Number(b.vacancy_id) : null;
  const vac = vacId ? db.prepare('SELECT * FROM vacancies WHERE id=?').get(vacId) : null;
  db.prepare(`INSERT INTO referrals (vacancy_id,referrer_id,candidate_name,candidate_email,candidate_phone,relationship,resume_file,resume_name,notes)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(
    vac ? vac.id : null, req.user.id,
    String(b.candidate_name).trim().slice(0, 120), String(b.candidate_email || '').slice(0, 160),
    String(b.candidate_phone || '').slice(0, 40), String(b.relationship || '').slice(0, 120),
    b.resume_file || null, b.resume_name || null, String(b.notes || '').slice(0, 2000));
  const role = vac ? ` for ${vac.title}` : '';
  for (const hr of db.prepare("SELECT id FROM users WHERE role IN ('hr','hr_admin') AND active=1").all())
    notify(hr.id, `${req.user.name} referred ${String(b.candidate_name).trim()}${role}`, '#/referrals', 'submit');
  sendOrgEmail(`[Justwords] New referral${role}`, `${req.user.name} referred ${b.candidate_name}`, req.user, 'HR');
  res.json({ ok: true });
});
app.post('/api/referrals/:id', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  const r = db.prepare('SELECT * FROM referrals WHERE id=?').get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Not found' });
  const status = ['submitted', 'reviewing', 'shortlisted', 'hired', 'closed'].includes(req.body.status) ? req.body.status : r.status;
  db.prepare('UPDATE referrals SET status=?, hr_note=? WHERE id=?').run(status, String(req.body.hr_note || '').slice(0, 2000), r.id);
  notify(r.referrer_id, `Your referral of ${r.candidate_name} is now "${status}"`, '#/referrals', 'info');
  res.json({ ok: true });
});

// ---------------------------------------------------------------- reimbursements
// An associate submits a claim; it routes to their reporting manager for approval, with
// HR kept in the loop. Managers/HR decide (approve / reject / mark reimbursed).
app.get('/api/reimbursements', requireAuth, (req, res) => {
  let rows;
  if (isAdminLevel(req.user)) {
    rows = db.prepare(`SELECT r.*, u.name, m.name AS manager_name FROM reimbursements r
      JOIN users u ON u.id=r.user_id LEFT JOIN users m ON m.id=r.manager_id ORDER BY r.created_at DESC`).all();
  } else {
    const scope = [req.user.id, ...subtreeIds(req.user.id)];
    const ph = scope.map(() => '?').join(',');
    rows = db.prepare(`SELECT r.*, u.name, m.name AS manager_name FROM reimbursements r
      JOIN users u ON u.id=r.user_id LEFT JOIN users m ON m.id=r.manager_id
      WHERE r.user_id IN (${ph}) ORDER BY r.created_at DESC`).all(...scope);
  }
  res.json({ reimbursements: rows });
});
app.post('/api/reimbursements', requireAuth, (req, res) => {
  const b = req.body || {};
  const amount = Number(b.amount);
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'A short title is required' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Enter a valid amount' });
  const managerId = req.user.manager_id || null;
  const info = db.prepare(`INSERT INTO reimbursements (user_id,manager_id,category,title,amount,currency,spent_on,description,receipt_file,receipt_name)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    req.user.id, managerId, String(b.category || 'General').slice(0, 60), String(b.title).trim().slice(0, 160),
    amount, String(b.currency || 'INR').slice(0, 8), String(b.spent_on || '').slice(0, 40),
    String(b.description || '').slice(0, 2000), b.receipt_file || null, b.receipt_name || null);
  const label = `${b.currency || 'INR'} ${amount} — ${String(b.title).trim()}`;
  if (managerId) notify(managerId, `${req.user.name} submitted a reimbursement for approval: ${label}`, '#/reimbursements', 'submit');
  for (const hr of db.prepare("SELECT id FROM users WHERE role IN ('hr','hr_admin') AND active=1").all())
    if (hr.id !== managerId) notify(hr.id, `New reimbursement from ${req.user.name}: ${label}`, '#/reimbursements', 'submit');
  sendOrgEmail(`[Justwords] Reimbursement for approval: ${label}`, String(b.description || ''), req.user, 'manager + HR');
  res.json({ ok: true, id: Number(info.lastInsertRowid) });
});
app.post('/api/reimbursements/:id/decide', requireAuth, (req, res) => {
  const r = db.prepare('SELECT * FROM reimbursements WHERE id=?').get(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Not found' });
  const canDecide = r.manager_id === req.user.id || ancestorIds(r.user_id).has(req.user.id) || isAdminLevel(req.user);
  if (!canDecide) return res.status(403).json({ error: 'Not allowed to decide this claim' });
  const status = ['approved', 'rejected', 'reimbursed', 'pending'].includes(req.body.status) ? req.body.status : 'approved';
  db.prepare("UPDATE reimbursements SET status=?, decided_by=?, decided_note=?, decided_at=datetime('now') WHERE id=?")
    .run(status, req.user.id, String(req.body.note || '').slice(0, 1000), r.id);
  notify(r.user_id, `Your reimbursement "${r.title}" was ${status} by ${req.user.name}`, '#/reimbursements', status === 'rejected' ? 'sent_back' : 'approved');
  // When a manager approves, let HR know it's ready to process.
  if (status === 'approved' && !isAdminLevel(req.user)) {
    for (const hr of db.prepare("SELECT id FROM users WHERE role IN ('hr','hr_admin') AND active=1").all())
      notify(hr.id, `${req.user.name} approved ${getUser(r.user_id).name}'s reimbursement "${r.title}" — ready to process`, '#/reimbursements', 'approved');
  }
  res.json({ ok: true });
});

// ---------------------------------------------------------------- announcements / news
app.get('/api/announcements', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.name AS author
    FROM announcements a LEFT JOIN users u ON u.id = a.posted_by
    ORDER BY a.pinned DESC, a.created_at DESC`).all();
  res.json({ announcements: rows });
});
app.post('/api/announcements', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  const { category, title, body, pinned } = req.body || {};
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required' });
  const info = db.prepare('INSERT INTO announcements (category,title,body,pinned,posted_by) VALUES (?,?,?,?,?)')
    .run(category || 'Announcement', String(title).trim(), body || '', pinned ? 1 : 0, req.user.id);
  // Notify the entire organisation. (Email delivery is disabled for now — this uses the
  // in-app notification system; sendOrgEmail() is the future hook for real email.)
  const cat = category || 'Announcement';
  const everyone = db.prepare('SELECT id FROM users WHERE active=1 AND id!=?').all(req.user.id);
  for (const u of everyone) notify(u.id, `New ${cat}: ${String(title).trim()}`, '#/dashboard', 'info');
  sendOrgEmail(`[Justwords] ${cat}: ${String(title).trim()}`, body || '', req.user);
  res.json({ ok: true, id: Number(info.lastInsertRowid), notified: everyone.length });
});
app.delete('/api/announcements/:id', requireAuth, requireRole('hr', 'hr_admin', 'ceo', 'director'), (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id=?').run(Number(req.params.id));
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Asset Tracking Tool
// Viewable by HR + leadership; editable by HR roles only.
const canViewAssets = (u) => isHR(u) || ['ceo', 'director'].includes(u.role);
function requireAssetView(req, res, next) {
  if (!canViewAssets(req.user)) return res.status(403).json({ error: 'Not allowed to view assets' });
  next();
}
// Asset fields. `category` here is the specific item type (Laptop, Monitor, Chair…);
// `asset_class` splits the register into Electronic vs Physical assets.
const ASSET_FIELDS = [
  'asset_class', 'category', 'brand', 'configuration', 'specification', 'identity_no',
  'service_tag', 'laptop_agreement', 'laptop_agreement_name', 'ownership', 'vendor_name', 'jw_asset_no',
  'owned_by', 'issued_to', 'issued_on', 'date_of_return', 'audit_date', 'notes',
];
function cleanAsset(body) {
  const a = {};
  for (const k of ASSET_FIELDS) a[k] = body[k] != null ? String(body[k]).slice(0, 500) : '';
  a.asset_class = a.asset_class === 'physical' ? 'physical' : 'electronic';
  a.ownership = a.ownership === 'rent' ? 'rent' : 'acquisition';
  // Keep only the number that matches the ownership choice.
  if (a.ownership === 'rent') a.jw_asset_no = ''; else a.vendor_name = '';
  return a;
}
const ASSET_COLS = ASSET_FIELDS.join(',');
const ASSET_VALS = ASSET_FIELDS.map(f => '@' + f).join(',');
const ASSET_SET = ASSET_FIELDS.map(f => `${f}=@${f}`).join(',');

app.get('/api/assets', requireAuth, requireAssetView, (req, res) => {
  const assets = db.prepare('SELECT * FROM assets ORDER BY updated_at DESC, id DESC').all();
  res.json({ assets });
});
app.post('/api/assets', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const a = cleanAsset(req.body || {});
  if (!a.category && !a.jw_asset_no && !a.identity_no && !a.service_tag)
    return res.status(400).json({ error: 'Add at least a category or an asset number' });
  const info = db.prepare(`INSERT INTO assets (${ASSET_COLS},created_by) VALUES (${ASSET_VALS},@created_by)`)
    .run({ ...a, created_by: req.user.id });
  res.json({ ok: true, id: info.lastInsertRowid });
});
app.put('/api/assets/:id', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const f = db.prepare('SELECT * FROM assets WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Asset not found' });
  const a = cleanAsset(req.body || {});
  db.prepare(`UPDATE assets SET ${ASSET_SET}, updated_at=datetime('now') WHERE id=@id`).run({ ...a, id: f.id });
  res.json({ ok: true });
});
app.delete('/api/assets/:id', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM asset_audits WHERE asset_id=?').run(id);
  db.prepare('DELETE FROM assets WHERE id=?').run(id);
  res.json({ ok: true });
});

// Audit log: list audit entries (optionally for one asset) and record a new one.
app.get('/api/asset-audits', requireAuth, requireAssetView, (req, res) => {
  const rows = db.prepare(`SELECT aa.*, u.name AS audited_by_name, a.category, a.asset_class, a.jw_asset_no, a.identity_no, a.issued_to
    FROM asset_audits aa LEFT JOIN users u ON u.id=aa.audited_by LEFT JOIN assets a ON a.id=aa.asset_id
    ORDER BY aa.created_at DESC`).all();
  res.json({ audits: rows });
});
// Audit verdict is one of okay | partial | not_okay. The audit date defaults to today
// (the auditor doesn't pick it), and we capture where the asset is / who holds it now,
// whether it's functional, and any notes.
const AUDIT_STATUS = ['okay', 'partial', 'not_okay'];
app.post('/api/asset-audits', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const assetId = Number(req.body.asset_id);
  const asset = db.prepare('SELECT * FROM assets WHERE id=?').get(assetId);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const auditDate = new Date().toISOString().slice(0, 10);   // taken automatically
  const status = AUDIT_STATUS.includes(req.body.status) ? req.body.status : 'okay';
  db.prepare('INSERT INTO asset_audits (asset_id,audit_date,status,belonging_to,functional,remarks,audited_by) VALUES (?,?,?,?,?,?,?)')
    .run(assetId, auditDate, status,
      String(req.body.belonging_to || '').slice(0, 300),
      String(req.body.functional || '').slice(0, 60),
      String(req.body.remarks || '').slice(0, 1000), req.user.id);
  db.prepare("UPDATE assets SET audit_date=?, updated_at=datetime('now') WHERE id=?").run(auditDate, assetId);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- HR admin usage/stats
app.get('/api/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const totals = {
    employees: db.prepare('SELECT COUNT(*) c FROM users WHERE active=1').get().c,
    managers: db.prepare('SELECT COUNT(*) c FROM users WHERE is_manager=1').get().c,
    pending_reset: db.prepare('SELECT COUNT(*) c FROM users WHERE must_reset=1').get().c,
    kpi_forms: db.prepare("SELECT COUNT(*) c FROM forms WHERE type='kpi'").get().c,
    approved: db.prepare("SELECT COUNT(*) c FROM forms WHERE status='approved'").get().c,
    in_review: db.prepare("SELECT COUNT(*) c FROM forms WHERE status='in_review'").get().c,
    open_suggestions: db.prepare("SELECT COUNT(*) c FROM suggestions WHERE status='open'").get().c,
    open_referrals: db.prepare("SELECT COUNT(*) c FROM referrals WHERE status IN ('submitted','reviewing')").get().c,
    pending_reimb: db.prepare("SELECT COUNT(*) c FROM reimbursements WHERE status='pending'").get().c,
  };
  const byDept = db.prepare('SELECT department, COUNT(*) c FROM users WHERE active=1 GROUP BY department ORDER BY c DESC').all();
  const formStatus = db.prepare('SELECT status, COUNT(*) c FROM forms GROUP BY status').all();
  const recent = db.prepare('SELECT a.action, a.at, u.name actor, f.type, f.quarter FROM approvals a JOIN users u ON u.id=a.actor_id JOIN forms f ON f.id=a.form_id ORDER BY a.at DESC LIMIT 15').all();
  res.json({ totals, byDept, formStatus, recent });
});

// ---------------------------------------------------------------- form windows (HR open/close control)
// Employees see whether their own window is open via the form payload (rights.windowOpen).
app.get('/api/form-windows', requireAuth, requireHR, (req, res) => {
  const fy = req.query.fy || 'FY2026-27';
  const globalRow = (type) => {
    const g = db.prepare("SELECT is_open,updated_at,updated_by FROM form_windows WHERE type=? AND fy=? AND scope='global' AND user_id IS NULL").get(type, fy);
    return { is_open: g ? !!g.is_open : true, configured: !!g, updated_at: g ? g.updated_at : null };
  };
  const overrides = db.prepare(`
    SELECT w.id, w.type, w.user_id, w.is_open, w.note, w.updated_at, u.name, u.designation, u.department, u.avatar
    FROM form_windows w JOIN users u ON u.id = w.user_id
    WHERE w.fy=? AND w.scope='user' ORDER BY w.updated_at DESC`).all(fy);
  res.json({
    fy,
    kpi: globalRow('kpi'),
    appraisal: globalRow('appraisal'),
    overrides: overrides.map(o => ({ ...o, is_open: !!o.is_open })),
  });
});
app.post('/api/form-windows', requireAuth, requireHR, (req, res) => {
  const type = req.body.type === 'appraisal' ? 'appraisal' : 'kpi';
  const fy = req.body.fy || 'FY2026-27';
  const isOpen = !!req.body.is_open;
  upsertWindow(type, fy, 'global', null, isOpen, req.body.note, req.user.id);
  res.json({ ok: true });
});
app.post('/api/form-windows/user', requireAuth, requireHR, (req, res) => {
  const type = req.body.type === 'appraisal' ? 'appraisal' : 'kpi';
  const fy = req.body.fy || 'FY2026-27';
  const userId = Number(req.body.user_id);
  if (!userId || !getUser(userId)) return res.status(400).json({ error: 'Valid user_id required' });
  const isOpen = !!req.body.is_open;
  upsertWindow(type, fy, 'user', userId, isOpen, req.body.note, req.user.id);
  notify(userId, `HR ${isOpen ? 'opened' : 'closed'} your ${type.toUpperCase()} form (${fy}).`, type === 'appraisal' ? '#/appraisal' : '#/kpi', isOpen ? 'approved' : 'info');
  res.json({ ok: true });
});
app.delete('/api/form-windows/user/:id', requireAuth, requireHR, (req, res) => {
  db.prepare("DELETE FROM form_windows WHERE id=? AND scope='user'").run(Number(req.params.id));
  res.json({ ok: true });
});

// ---------------------------------------------------------------- chat (channels + DMs)
function dmKey(a, b) { const lo = Math.min(a, b), hi = Math.max(a, b); return lo + ':' + hi; }
function isGroupMember(channelId, userId) {
  return !!db.prepare('SELECT 1 FROM channel_members WHERE channel_id=? AND user_id=?').get(channelId, userId);
}
function canAccessChannel(ch, userId) {
  if (!ch) return false;
  if (ch.is_dm) return ch.dm_a === userId || ch.dm_b === userId; // DMs: participants only
  if (ch.is_group) return isGroupMember(ch.id, userId);          // groups: members only
  return true;                                                   // public channels: everyone
}
function groupMembers(channelId) {
  return db.prepare(`SELECT u.id,u.name,u.designation,u.avatar FROM channel_members cm
    JOIN users u ON u.id=cm.user_id WHERE cm.channel_id=? ORDER BY u.name`).all(channelId);
}
function channelView(ch, userId) {
  const last = db.prepare('SELECT m.body, m.created_at, u.name FROM messages m JOIN users u ON u.id=m.user_id WHERE m.channel_id=? ORDER BY m.id DESC LIMIT 1').get(ch.id);
  const readRow = db.prepare('SELECT last_read FROM channel_reads WHERE user_id=? AND channel_id=?').get(userId, ch.id);
  const lastRead = readRow ? readRow.last_read : '1970-01-01';
  const unread = db.prepare("SELECT COUNT(*) c FROM messages WHERE channel_id=? AND user_id!=? AND created_at > ?").get(ch.id, userId, lastRead).c;
  let name = ch.name, topic = ch.topic, other = null, members = null;
  if (ch.is_dm) {
    const otherId = ch.dm_a === userId ? ch.dm_b : ch.dm_a;
    other = getUser(otherId);
    name = other ? other.name : 'Direct message';
    topic = other ? (other.designation || '') : '';
  } else if (ch.is_group) {
    members = groupMembers(ch.id);
    if (!topic) topic = members.map(m => m.name.split(' ')[0]).join(', ');
  }
  return {
    id: ch.id, is_dm: !!ch.is_dm, is_group: !!ch.is_group, name, topic,
    other: other ? { id: other.id, name: other.name, designation: other.designation, avatar: other.avatar } : null,
    members, member_count: members ? members.length : null,
    unread, last_body: last ? last.body : '', last_at: last ? last.created_at : ch.created_at, last_by: last ? last.name : '',
  };
}
// Channels visible to me: public channels, group channels I belong to, and my DMs.
function myChannels(userId) {
  return db.prepare(`SELECT * FROM channels WHERE
      (is_dm=0 AND IFNULL(is_group,0)=0)
      OR (is_dm=1 AND (dm_a=? OR dm_b=?))
      OR (IFNULL(is_group,0)=1 AND id IN (SELECT channel_id FROM channel_members WHERE user_id=?))`)
    .all(userId, userId, userId);
}
// Overview: public channels + my group chats + my DMs, ordered by most-recent activity.
app.get('/api/chat/overview', requireAuth, (req, res) => {
  const views = myChannels(req.user.id).map(c => channelView(c, req.user.id));
  views.sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)));
  const totalUnread = views.reduce((s, v) => s + v.unread, 0);
  res.json({
    channels: views.filter(v => !v.is_dm && !v.is_group),
    groups: views.filter(v => v.is_group),
    dms: views.filter(v => v.is_dm),
    totalUnread,
  });
});
app.get('/api/chat/unread', requireAuth, (req, res) => {
  const chans = myChannels(req.user.id);
  let unread = 0;
  for (const c of chans) {
    const r = db.prepare('SELECT last_read FROM channel_reads WHERE user_id=? AND channel_id=?').get(req.user.id, c.id);
    unread += db.prepare("SELECT COUNT(*) c FROM messages WHERE channel_id=? AND user_id!=? AND created_at > ?").get(c.id, req.user.id, r ? r.last_read : '1970-01-01').c;
  }
  res.json({ unread });
});
// Create a private group chat with selected members (creator is always included).
app.post('/api/chat/groups', requireAuth, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 60);
  if (!name) return res.status(400).json({ error: 'Group name required' });
  const ids = Array.isArray(req.body.member_ids) ? req.body.member_ids.map(Number).filter(Boolean) : [];
  const members = new Set([req.user.id, ...ids]);
  if (members.size < 2) return res.status(400).json({ error: 'Add at least one other person' });
  const info = db.prepare('INSERT INTO channels (name,topic,is_dm,is_group,created_by) VALUES (?,?,0,1,?)')
    .run(name, String(req.body.topic || '').slice(0, 200), req.user.id);
  const cid = Number(info.lastInsertRowid);
  const add = db.prepare('INSERT OR IGNORE INTO channel_members (channel_id,user_id) VALUES (?,?)');
  for (const uid of members) if (getUser(uid)) add.run(cid, uid);
  for (const uid of members) if (uid !== req.user.id) notify(uid, `${req.user.name} added you to the group "${name}"`, '#/chat/' + cid, 'info');
  res.json({ id: cid });
});
app.get('/api/chat/channels/:id/members', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access' });
  res.json({ members: ch.is_group ? groupMembers(ch.id) : [] });
});
app.post('/api/chat/channels', requireAuth, (req, res) => {
  const name = String(req.body.name || '').trim().toLowerCase().replace(/[^a-z0-9\- ]+/g, '').replace(/\s+/g, '-').slice(0, 40);
  if (!name) return res.status(400).json({ error: 'Channel name required' });
  const existing = db.prepare('SELECT id FROM channels WHERE is_dm=0 AND lower(name)=?').get(name);
  if (existing) return res.json({ id: existing.id });
  const info = db.prepare('INSERT INTO channels (name,topic,is_dm,created_by) VALUES (?,?,0,?)').run(name, String(req.body.topic || '').slice(0, 200), req.user.id);
  res.json({ id: Number(info.lastInsertRowid) });
});
app.post('/api/chat/dm', requireAuth, (req, res) => {
  const otherId = Number(req.body.user_id);
  if (!otherId || otherId === req.user.id || !getUser(otherId)) return res.status(400).json({ error: 'Valid user_id required' });
  const key = dmKey(req.user.id, otherId);
  let ch = db.prepare('SELECT * FROM channels WHERE dm_key=?').get(key);
  if (!ch) {
    const info = db.prepare('INSERT INTO channels (is_dm,dm_a,dm_b,dm_key,created_by) VALUES (1,?,?,?,?)')
      .run(Math.min(req.user.id, otherId), Math.max(req.user.id, otherId), key, req.user.id);
    ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(info.lastInsertRowid));
  }
  res.json({ id: ch.id });
});
app.get('/api/chat/channels/:id', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access to this channel' });
  res.json({ channel: channelView(ch, req.user.id) });
});
app.get('/api/chat/channels/:id/messages', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access to this channel' });
  const after = Number(req.query.after) || 0;
  const rows = db.prepare(`SELECT m.id, m.user_id, m.body, m.created_at, u.name, u.designation, u.avatar
    FROM messages m JOIN users u ON u.id=m.user_id WHERE m.channel_id=? AND m.id > ? ORDER BY m.id ASC LIMIT 300`).all(ch.id, after);
  res.json({ messages: rows });
});
app.post('/api/chat/channels/:id/messages', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access to this channel' });
  const body = String(req.body.body || '').trim().slice(0, 4000);
  if (!body) return res.status(400).json({ error: 'Message is empty' });
  const info = db.prepare('INSERT INTO messages (channel_id,user_id,body) VALUES (?,?,?)').run(ch.id, req.user.id, body);
  db.prepare('INSERT OR REPLACE INTO channel_reads (user_id,channel_id,last_read) VALUES (?,?,datetime(\'now\'))').run(req.user.id, ch.id);
  // notify the other participant of a DM, or the other members of a group
  if (ch.is_dm) {
    const otherId = ch.dm_a === req.user.id ? ch.dm_b : ch.dm_a;
    notify(otherId, `${req.user.name} messaged you: ${body.slice(0, 60)}`, '#/chat/' + ch.id, 'info');
  } else if (ch.is_group) {
    for (const m of groupMembers(ch.id))
      if (m.id !== req.user.id) notify(m.id, `${req.user.name} in ${ch.name}: ${body.slice(0, 50)}`, '#/chat/' + ch.id, 'info');
  }
  res.json({ id: Number(info.lastInsertRowid) });
});
app.post('/api/chat/channels/:id/read', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access' });
  db.prepare('INSERT OR REPLACE INTO channel_reads (user_id,channel_id,last_read) VALUES (?,?,datetime(\'now\'))').run(req.user.id, ch.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- Backup / Restore console
// A standalone, password-gated page (separate from the normal portal login) that can
// export the ENTIRE database to a JSON file and restore it back. Meant for the owner to
// keep their own backups so everything (KPIs, appraisals, users, messages…) can be
// recovered if the data volume is ever lost. The password defaults to 'admin123' but can
// be overridden with the ADMIN_BACKUP_PASSWORD env var — do change it in production.
// Note: physical uploaded files aren't in the DB, so the JSON holds their records but not
// the file bytes.
const BACKUP_ADMIN_USER = process.env.ADMIN_BACKUP_USER || 'admin';
const BACKUP_ADMIN_PASSWORD = process.env.ADMIN_BACKUP_PASSWORD || 'admin123';
const bigJson = express.json({ limit: '64mb' }); // restore payloads can be large

function listTables() {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all().map(r => r.name);
}
function requireBackupAdmin(req, res, next) {
  if (!req.session.backupAdmin) return res.status(401).json({ error: 'Admin login required' });
  next();
}

app.get('/api/admin/backup/status', (req, res) => res.json({ loggedIn: !!req.session.backupAdmin }));

app.post('/api/admin/backup/login', (req, res) => {
  const { username, password } = req.body || {};
  const userOk = !username || String(username) === BACKUP_ADMIN_USER; // username optional
  if (!userOk || String(password || '') !== BACKUP_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong admin username or password' });
  }
  req.session.backupAdmin = true;
  res.json({ ok: true });
});

app.post('/api/admin/backup/logout', (req, res) => { req.session.backupAdmin = false; res.json({ ok: true }); });

// Download everything as one JSON document.
app.get('/api/admin/backup/export', requireBackupAdmin, (req, res) => {
  const dump = {
    meta: { app: 'JCKC', kind: 'portal-backup', version: 1, created_at: new Date().toISOString() },
    tables: {},
  };
  for (const t of listTables()) {
    try { dump.tables[t] = db.prepare(`SELECT * FROM ${t}`).all(); } catch (_) { dump.tables[t] = []; }
  }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="jckc-backup-${stamp}.json"`);
  res.send(JSON.stringify(dump, null, 2));
});

// Restore from a previously exported JSON document. Replaces the contents of every table
// present in the backup, all-or-nothing (rolls back on any error).
app.post('/api/admin/backup/import', requireBackupAdmin, bigJson, (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || !payload.tables || typeof payload.tables !== 'object') {
    return res.status(400).json({ error: 'That file is not a valid JCKC backup (no "tables").' });
  }
  const existing = new Set(listTables());
  const toRestore = Object.keys(payload.tables).filter(t => existing.has(t));
  if (!toRestore.length) return res.status(400).json({ error: 'Backup has no tables that match this database.' });

  let totalRows = 0;
  try {
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec('BEGIN;');
    for (const t of toRestore) {
      db.exec(`DELETE FROM ${t};`);
      const rows = Array.isArray(payload.tables[t]) ? payload.tables[t] : [];
      for (const row of rows) {
        const cols = Object.keys(row);
        if (!cols.length) continue;
        const sql = `INSERT INTO ${t} (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
        db.prepare(sql).run(...cols.map(c => (row[c] === undefined ? null : row[c])));
        totalRows++;
      }
    }
    db.exec('COMMIT;');
  } catch (ex) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    return res.status(500).json({ error: 'Restore failed — no changes applied. ' + ex.message });
  } finally {
    try { db.exec('PRAGMA foreign_keys = ON;'); } catch (_) {}
  }
  res.json({ ok: true, tables: toRestore.length, rows: totalRows });
});

// Standalone console page (served before the SPA fallback so it isn't swallowed).
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ---------------------------------------------------------------- SPA fallback
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n  Justwords Collaborative Knowledge Center running at http://localhost:${PORT}\n`);
});
