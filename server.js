'use strict';
/*
 * Justwords Associates' Portal — Express server.
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

app.use(express.json({ limit: '2mb' }));
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
    data,
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
  const isAncestor = ancestorIds(f.user_id).has(req.user.id);
  if (!isAncestor && !(isOwner && (f.status === 'draft' || f.status === 'sent_back')))
    return res.status(403).json({ error: 'Form is locked — awaiting approval' });
  // Owners can only edit while HR has the filing window open (managers/HR exempt).
  if (isOwner && !isAncestor && !formWindowOpen(f.type, f.fy, f.user_id))
    return res.status(403).json({ error: `The ${f.type.toUpperCase()} window is closed by HR — you can't edit right now.` });
  const data = normMgrComments(req.body.data || {});
  db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(JSON.stringify(data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  if (isAncestor && !isOwner) db.prepare('INSERT INTO approvals (form_id,actor_id,action,comment) VALUES (?,?,?,?)').run(f.id, req.user.id, 'edit', 'Manager edited the form');
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
  const chain = approvalChain(f.user_id);
  if (chain.length === 0) return res.status(400).json({ error: 'No reporting manager configured for approval' });
  if (req.body.data) db.prepare('UPDATE forms SET data=?, auto_score=?, final_score=? WHERE id=?').run(JSON.stringify(req.body.data), req.body.auto_score ?? f.auto_score, req.body.final_score ?? f.final_score, f.id);
  db.prepare("UPDATE forms SET status='in_review', stage_index=0, chain=?, locked=1, submit_count=submit_count+1, updated_at=datetime('now') WHERE id=?")
    .run(JSON.stringify(chain), f.id);
  db.prepare('INSERT INTO approvals (form_id,actor_id,action,stage,comment) VALUES (?,?,?,?,?)').run(f.id, req.user.id, 'submit', 0, req.body.comment || 'Submitted for review');
  notify(chain[0], `${req.user.name} submitted their ${f.type.toUpperCase()} ${f.quarter} for your approval`, '#/form/' + f.id, 'submit');
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
  const isAncestor = ancestorIds(f.user_id).has(req.user.id);
  // Persist the approver's in-form edits (field changes + row comments) and/or a
  // per-quarter manager comment, so the associate actually sees them afterwards.
  let data = JSON.parse(f.data || '{}');
  let dataChanged = false;
  if (req.body.data && isAncestor) { data = req.body.data; dataChanged = true; }
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
  if (req.body.data && ancestorIds(f.user_id).has(req.user.id)) {
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

// ---------------------------------------------------------------- leave
app.post('/api/leave', requireAuth, (req, res) => {
  const { type, from_date, to_date, days, reason } = req.body || {};
  db.prepare('INSERT INTO leaves (user_id,type,from_date,to_date,days,reason) VALUES (?,?,?,?,?,?)')
    .run(req.user.id, type || 'Casual', from_date, to_date, Number(days) || 0, reason || '');
  res.json({ ok: true });
});
app.get('/api/leave', requireAuth, (req, res) => {
  let rows;
  if (isHR(req.user) || ['ceo', 'director'].includes(req.user.role)) {
    rows = db.prepare('SELECT l.*, u.name FROM leaves l JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC').all();
  } else {
    const reports = [req.user.id, ...subtreeIds(req.user.id)];
    const ph = reports.map(() => '?').join(',');
    rows = db.prepare(`SELECT l.*, u.name FROM leaves l JOIN users u ON u.id=l.user_id WHERE l.user_id IN (${ph}) ORDER BY l.created_at DESC`).all(...reports);
  }
  res.json({ leaves: rows });
});
app.post('/api/leave/:id', requireAuth, (req, res) => {
  const l = db.prepare('SELECT * FROM leaves WHERE id=?').get(Number(req.params.id));
  if (!l) return res.status(404).json({ error: 'Not found' });
  const canDecide = ancestorIds(l.user_id).has(req.user.id) || isHR(req.user);
  if (!canDecide) return res.status(403).json({ error: 'Not allowed' });
  const st = req.body.status || 'approved';
  db.prepare('UPDATE leaves SET status=?, decided_by=?, decided_note=? WHERE id=?')
    .run(st, req.user.id, req.body.note || '', l.id);
  notify(l.user_id, `Your leave request was ${st} by ${req.user.name}`, '#/leave', st === 'approved' ? 'approved' : 'sent_back');
  res.json({ ok: true });
});

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
  db.prepare('INSERT INTO announcements (category,title,body,pinned,posted_by) VALUES (?,?,?,?,?)')
    .run(category || 'Announcement', String(title).trim(), body || '', pinned ? 1 : 0, req.user.id);
  res.json({ ok: true });
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
const ASSET_FIELDS = ['category', 'specification', 'identity_no', 'owned_by', 'jw_asset_no', 'ownership', 'issued_to', 'issued_on', 'audit_date', 'notes'];
function cleanAsset(body) {
  const a = {};
  for (const k of ASSET_FIELDS) a[k] = body[k] != null ? String(body[k]).slice(0, 500) : '';
  a.ownership = a.ownership === 'rent' ? 'rent' : 'acquisition';
  return a;
}

app.get('/api/assets', requireAuth, requireAssetView, (req, res) => {
  const assets = db.prepare('SELECT * FROM assets ORDER BY updated_at DESC, id DESC').all();
  res.json({ assets });
});
app.post('/api/assets', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const a = cleanAsset(req.body || {});
  if (!a.category && !a.jw_asset_no && !a.identity_no)
    return res.status(400).json({ error: 'Add at least a category or an asset number' });
  const info = db.prepare(`INSERT INTO assets (category,specification,identity_no,owned_by,jw_asset_no,ownership,issued_to,issued_on,audit_date,notes,created_by)
    VALUES (@category,@specification,@identity_no,@owned_by,@jw_asset_no,@ownership,@issued_to,@issued_on,@audit_date,@notes,@created_by)`)
    .run({ ...a, created_by: req.user.id });
  res.json({ ok: true, id: info.lastInsertRowid });
});
app.put('/api/assets/:id', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const f = db.prepare('SELECT * FROM assets WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Asset not found' });
  const a = cleanAsset(req.body || {});
  db.prepare(`UPDATE assets SET category=@category,specification=@specification,identity_no=@identity_no,owned_by=@owned_by,
    jw_asset_no=@jw_asset_no,ownership=@ownership,issued_to=@issued_to,issued_on=@issued_on,audit_date=@audit_date,notes=@notes,
    updated_at=datetime('now') WHERE id=@id`).run({ ...a, id: f.id });
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
  const rows = db.prepare(`SELECT aa.*, u.name AS audited_by_name, a.category, a.jw_asset_no, a.identity_no, a.issued_to
    FROM asset_audits aa LEFT JOIN users u ON u.id=aa.audited_by LEFT JOIN assets a ON a.id=aa.asset_id
    ORDER BY aa.created_at DESC`).all();
  res.json({ audits: rows });
});
app.post('/api/asset-audits', requireAuth, requireRole('hr', 'hr_admin', 'director', 'ceo'), (req, res) => {
  const assetId = Number(req.body.asset_id);
  const asset = db.prepare('SELECT * FROM assets WHERE id=?').get(assetId);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const auditDate = String(req.body.audit_date || '').slice(0, 40) || new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO asset_audits (asset_id,audit_date,status,condition,remarks,audited_by) VALUES (?,?,?,?,?,?)')
    .run(assetId, auditDate, String(req.body.status || '').slice(0, 60), String(req.body.condition || '').slice(0, 60), String(req.body.remarks || '').slice(0, 1000), req.user.id);
  // Keep the asset's headline audit date in sync with its latest audit.
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
    pending_leaves: db.prepare("SELECT COUNT(*) c FROM leaves WHERE status='pending'").get().c,
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
function canAccessChannel(ch, userId) {
  if (!ch) return false;
  if (!ch.is_dm) return true;                    // public channels: everyone
  return ch.dm_a === userId || ch.dm_b === userId; // DMs: participants only
}
function channelView(ch, userId) {
  const last = db.prepare('SELECT m.body, m.created_at, u.name FROM messages m JOIN users u ON u.id=m.user_id WHERE m.channel_id=? ORDER BY m.id DESC LIMIT 1').get(ch.id);
  const readRow = db.prepare('SELECT last_read FROM channel_reads WHERE user_id=? AND channel_id=?').get(userId, ch.id);
  const lastRead = readRow ? readRow.last_read : '1970-01-01';
  const unread = db.prepare("SELECT COUNT(*) c FROM messages WHERE channel_id=? AND user_id!=? AND created_at > ?").get(ch.id, userId, lastRead).c;
  let name = ch.name, topic = ch.topic, other = null;
  if (ch.is_dm) {
    const otherId = ch.dm_a === userId ? ch.dm_b : ch.dm_a;
    other = getUser(otherId);
    name = other ? other.name : 'Direct message';
    topic = other ? (other.designation || '') : '';
  }
  return {
    id: ch.id, is_dm: !!ch.is_dm, name, topic,
    other: other ? { id: other.id, name: other.name, designation: other.designation, avatar: other.avatar } : null,
    unread, last_body: last ? last.body : '', last_at: last ? last.created_at : ch.created_at, last_by: last ? last.name : '',
  };
}
// Overview: public channels + my DMs, ordered by most-recent activity.
app.get('/api/chat/overview', requireAuth, (req, res) => {
  const chans = db.prepare('SELECT * FROM channels WHERE is_dm=0 OR dm_a=? OR dm_b=?').all(req.user.id, req.user.id);
  const views = chans.map(c => channelView(c, req.user.id));
  views.sort((a, b) => String(b.last_at).localeCompare(String(a.last_at)));
  const totalUnread = views.reduce((s, v) => s + v.unread, 0);
  res.json({ channels: views.filter(v => !v.is_dm), dms: views.filter(v => v.is_dm), totalUnread });
});
app.get('/api/chat/unread', requireAuth, (req, res) => {
  const chans = db.prepare('SELECT id FROM channels WHERE is_dm=0 OR dm_a=? OR dm_b=?').all(req.user.id, req.user.id);
  let unread = 0;
  for (const c of chans) {
    const r = db.prepare('SELECT last_read FROM channel_reads WHERE user_id=? AND channel_id=?').get(req.user.id, c.id);
    unread += db.prepare("SELECT COUNT(*) c FROM messages WHERE channel_id=? AND user_id!=? AND created_at > ?").get(c.id, req.user.id, r ? r.last_read : '1970-01-01').c;
  }
  res.json({ unread });
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
  // notify the other participant of a DM
  if (ch.is_dm) {
    const otherId = ch.dm_a === req.user.id ? ch.dm_b : ch.dm_a;
    notify(otherId, `${req.user.name} messaged you: ${body.slice(0, 60)}`, '#/chat/' + ch.id, 'info');
  }
  res.json({ id: Number(info.lastInsertRowid) });
});
app.post('/api/chat/channels/:id/read', requireAuth, (req, res) => {
  const ch = db.prepare('SELECT * FROM channels WHERE id=?').get(Number(req.params.id));
  if (!canAccessChannel(ch, req.user.id)) return res.status(403).json({ error: 'No access' });
  db.prepare('INSERT OR REPLACE INTO channel_reads (user_id,channel_id,last_read) VALUES (?,?,datetime(\'now\'))').run(req.user.id, ch.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- SPA fallback
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n  Justwords Associates' Portal running at http://localhost:${PORT}\n`);
});
