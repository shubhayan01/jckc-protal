/* ============================================================
   Justwords Associates' Portal — SPA client
   ============================================================ */
'use strict';

// ------------------------------------------------- icons (inline SVG)
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M17 6l3 3M15 8l2 2"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.3 1 2.5h6c0-1.2.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  layers: '<path d="M12 3 2 8l10 5 10-5-10-5zM2 16l10 5 10-5M2 12l10 5 10-5"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v18"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6z"/>',
  wrench: '<path d="M14 7a4 4 0 0 1 5 4.9L21 21l-2 2-9.1-2A4 4 0 0 1 5 6l3 3 2-2z"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M16 4a3.5 3.5 0 0 1 0 7M22 21v-1a5 5 0 0 0-4-4.9"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  inbox: '<path d="M3 12h5l2 3h4l2-3h5M3 12l3-7h12l3 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.4l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.4-1.4L13.7 2h-3.4l-.4 2.7a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .5 0 .9.1 1.4l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2.4 1.4l.4 2.7h3.4l.4-2.7a7 7 0 0 0 2.4-1.4l2.4 1 2-3.5-2-1.5c.1-.5.1-.9.1-1.4z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  seo: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  pen: '<path d="M12 19l7-7-3-3-7 7-1 4zM16 5l3 3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.9-1"/>',
  toggle: '<rect x="1" y="6" width="22" height="12" rx="6"/><circle cx="16" cy="12" r="3"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
  trash: '<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"/>',
};
function icon(name, cls) { return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`; }

// ------------------------------------------------- state + api
const State = { me: null, theme: localStorage.getItem('jw-theme') || 'light' };
document.documentElement.setAttribute('data-theme', State.theme);

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error(data.error || ('Request failed (' + res.status + ')'));
  return data;
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function initials(name) { return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function avatarHTML(u, size) {
  const s = size || 34;
  const style = `width:${s}px;height:${s}px;font-size:${Math.round(s * 0.38)}px`;
  if (u && u.avatar) return `<span class="avatar" style="${style};padding:0;overflow:hidden"><img src="/uploads/${esc(u.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover"></span>`;
  return `<span class="avatar" style="${style}">${initials(u && u.name)}</span>`;
}
function fmtDate(s) { if (!s) return '—'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function roleLabel(r) { return ({ ceo: 'CEO', director: 'Director', hr_admin: 'HR Admin', hr: 'HR', manager: 'Manager', employee: 'Associate' }[r] || r); }
// Whoever manages a team or sits in leadership/HR can open the Team Performance view.
function canSeeTeam(me) { return !!me && (me.is_manager || ['manager', 'director', 'ceo', 'hr', 'hr_admin'].includes(me.role)); }
function canManageAssets(me) { return !!me && ['hr', 'hr_admin', 'director', 'ceo'].includes(me.role); }

// Three login tiers: Super Admin (Payel, Amlan) · HR (Gouri, Rushika) · Associate (everyone else).
function accessLevel(me) {
  if (!me) return 'associate';
  if (['ceo', 'director'].includes(me.role)) return 'super_admin';
  if (['hr', 'hr_admin'].includes(me.role)) return 'hr';
  return 'associate';
}
function accessLabel(me) { return ({ super_admin: 'Super Admin', hr: 'HR', associate: 'Associate' })[accessLevel(me)]; }
function isSuperAdmin(me) { return accessLevel(me) === 'super_admin'; }
function isAdminLevel(me) { return accessLevel(me) !== 'associate'; }

// ------------------------------------------------- toast + modal
function toast(msg, kind) {
  const t = document.createElement('div');
  t.className = 'toast ' + (kind || '');
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 3200);
}
function modal(title, bodyHTML, footHTML) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-bg" data-close><div class="modal">
    <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="modal-body">${bodyHTML}</div>
    ${footHTML ? `<div class="modal-foot">${footHTML}</div>` : ''}
  </div></div>`;
  wireClose(root);
}
// Wire every [data-close] in `root` to close the modal. A click anywhere on a close
// control (even on the SVG icon inside the X button) closes; a click on the backdrop
// closes only when it lands on the backdrop itself, not when it bubbles up from content.
function wireClose(root) {
  root.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', e => {
    if (el.classList.contains('modal-bg') && e.target !== el) return; // ignore clicks inside the dialog
    closeModal();
  }));
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

// ------------------------------------------------- nav definition
const NAV = [
  { label: 'Tools', icon: 'grid', items: [{ t: 'Tools & Access', r: '#/page/tools', i: 'grid' }] },
  { label: 'About Us', icon: 'building', items: [
    { t: 'Vision & Mission', r: '#/page/vision', i: 'target' },
    { t: 'Company Documents', r: '#/page/company-documents', i: 'file' },
  ] },
  { label: 'HR Desk', icon: 'brief', items: [
    { t: 'Handbook', r: '#/page/handbook', i: 'book' },
    { t: 'Schemes', r: '#/page/schemes', i: 'layers' },
    { t: 'Policies', r: '#/page/policies', i: 'shield' },
    { t: 'Vacancies', r: '#/vacancies', i: 'brief' },
    { t: 'Refer a Candidate', r: '#/referrals', i: 'users' },
    { t: 'Reimbursements', r: '#/reimbursements', i: 'file' },
  ] },
  { label: 'SOP Documents', icon: 'file', items: [
    { t: 'HR', r: '#/page/sop-hr', i: 'users' },
    { t: 'SEO', r: '#/page/sop-seo', i: 'seo' },
    { t: 'Content', r: '#/page/sop-content', i: 'pen' },
    { t: 'Web Dev', r: '#/page/sop-webdev', i: 'wrench' },
    { t: 'Automation', r: '#/page/sop-automation', i: 'settings' },
  ] },
  { label: 'Performance', icon: 'chart', items: [
    { t: 'KPI Incentive Plan', r: '#/performance/kpi', i: 'chart' },
    { t: 'Appraisal', r: '#/performance/appraisal', i: 'target' },
  ] },
  { label: 'Asset Tracking Tool', icon: 'box', show: canManageAssets, items: [
    { t: 'Asset Register', r: '#/assets', i: 'box' },
    { t: 'Asset Audit', r: '#/asset-audit', i: 'shield' },
  ] },
];

// A flat top-level link (rendered next to the dropdown groups). Messages lives as an
// icon in the toolbar, so it is intentionally not duplicated here.
const NAV_LINKS = [];

// ------------------------------------------------- app shell
const app = () => document.getElementById('app');

function renderShell(content) {
  const me = State.me;
  const navHTML = NAV.filter(g => !g.show || g.show(me)).map((g, gi) => `
    <div class="nav-item" data-navitem="${gi}">
      <button class="nav-link">${icon(g.icon, 'icon-sm')}${g.label}${icon('chevron', 'icon-sm')}</button>
      <div class="dropdown">
        ${g.items.map(it => `<a href="${it.r}">${icon(it.i)}${it.t}</a>`).join('')}
      </div>
    </div>`).join('')
    + NAV_LINKS.map(l => `<div class="nav-item"><a class="nav-link" href="${l.r}">${icon(l.icon, 'icon-sm')}${l.label}</a></div>`).join('');

  const hrLinks = isAdminLevel(me)
    ? `<a href="#/hr/suggestions">${icon('bulb')}Suggestion Inbox</a><a href="#/hr/windows">${icon('toggle')}Form Windows</a>` : '';
  const adminLink = (me.role === 'hr_admin' || isSuperAdmin(me))
    ? `<a href="#/admin">${icon('settings')}HR Admin Console</a>` : '';

  app().innerHTML = `
  <header class="appbar">
    <button class="icon-btn nav-toggle" id="navToggle">${icon('menu')}</button>
    <a href="#/dashboard" class="brand">
      <span class="logo">JW</span>
      <span>Justwords<small>Associates' Portal</small></span>
    </a>
    <nav class="nav" id="mainNav">${navHTML}</nav>
    <div class="spacer"></div>
    <div class="appbar-actions">
      <a href="#/chat" class="icon-btn" title="Messages" style="position:relative">${icon('chat')}<span class="notif-badge" id="chatBadge" style="display:none"></span></a>
      <a href="#/inbox" class="icon-btn" title="Approvals inbox">${icon('inbox')}</a>
      <div class="user-menu" id="notifMenu" style="position:relative">
        <button class="icon-btn" id="notifBtn" title="Notifications" style="position:relative">${icon('bell')}<span class="notif-badge" id="notifBadge" style="display:none"></span></button>
        <div class="user-dd" id="notifDD" style="min-width:320px;max-height:420px;overflow:auto"></div>
      </div>
      <button class="icon-btn" id="themeBtn" title="Toggle theme">${icon(State.theme === 'dark' ? 'sun' : 'moon')}</button>
      <div class="user-menu" id="userMenu">
        <button class="user-btn" id="userBtn">
          ${avatarHTML(me, 32)}
          <span class="user-btn-text"><span class="nm">${esc(me.name)}</span><span class="rl">${esc(accessLabel(me))} · ${esc(roleLabel(me.role))}</span></span>
          ${icon('chevron', 'icon-sm')}
        </button>
        <div class="user-dd">
          <div class="dd-tier">${icon('shield', 'icon-sm')} Signed in as <strong>${esc(accessLabel(me))}</strong></div>
          <button id="howToMenu">${icon('help')}How to use (guided tour)</button>
          <a href="#/dashboard">${icon('home')}Dashboard</a>
          <a href="#/profile">${icon('user')}My Profile</a>
          <a href="#/directory">${icon('users')}Team Directory</a>
          <a href="#/suggestions">${icon('bulb')}Suggestion box</a>
          ${hrLinks}${adminLink}
          <a href="#/password">${icon('key')}Change Password</a>
          <button id="logoutBtn">${icon('logout')}Log out</button>
        </div>
      </div>
    </div>
  </header>
  <main id="view">${content || ''}</main>`;

  // wiring
  document.getElementById('themeBtn').onclick = toggleTheme;
  const howToMenu = document.getElementById('howToMenu'); if (howToMenu) howToMenu.onclick = () => startGuide();
  document.getElementById('logoutBtn').onclick = async () => { await api('/logout', { method: 'POST' }); State.me = null; location.hash = '#/login'; };
  const uMenu = document.getElementById('userMenu');
  document.getElementById('userBtn').onclick = e => { e.stopPropagation(); nMenu.classList.remove('open'); uMenu.classList.toggle('open'); };
  const nMenu = document.getElementById('notifMenu');
  document.getElementById('notifBtn').onclick = e => { e.stopPropagation(); uMenu.classList.remove('open'); nMenu.classList.toggle('open'); if (nMenu.classList.contains('open')) openNotifications(); };
  document.getElementById('navToggle').onclick = () => document.getElementById('mainNav').classList.toggle('show');
  document.querySelectorAll('[data-navitem]').forEach(item => {
    item.querySelector('.nav-link').onclick = e => {
      e.stopPropagation();
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('[data-navitem]').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    };
  });
  document.body.onclick = () => {
    document.querySelectorAll('[data-navitem]').forEach(i => i.classList.remove('open'));
    uMenu.classList.remove('open');
    nMenu.classList.remove('open');
  };
  refreshNotifBadge();
  refreshChatBadge();
  startBadgePolling();
}

let BADGE_TIMER = null;
function startBadgePolling() {
  if (BADGE_TIMER) clearInterval(BADGE_TIMER);
  BADGE_TIMER = setInterval(() => { refreshNotifBadge(); refreshChatBadge(); }, 15000);
}
async function refreshChatBadge() {
  try {
    const { unread } = await api('/chat/unread');
    const b = document.getElementById('chatBadge');
    if (!b) return;
    if (unread > 0) { b.style.display = 'grid'; b.textContent = unread > 9 ? '9+' : unread; }
    else b.style.display = 'none';
  } catch (_) {}
}

async function refreshNotifBadge() {
  try {
    const { unread } = await api('/notifications');
    const b = document.getElementById('notifBadge');
    if (!b) return;
    if (unread > 0) { b.style.display = 'grid'; b.textContent = unread > 9 ? '9+' : unread; }
    else b.style.display = 'none';
  } catch (_) {}
}
async function openNotifications() {
  const dd = document.getElementById('notifDD');
  dd.innerHTML = `<div class="muted" style="padding:12px">Loading…</div>`;
  const { items } = await api('/notifications');
  if (!items.length) { dd.innerHTML = `<div class="empty" style="padding:26px 16px">${icon('bell')}No notifications yet</div>`; return; }
  dd.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:1px solid var(--border)">
      <strong style="font-size:13px">Notifications</strong><button class="btn btn-sm btn-ghost" id="markAllRead">Mark all read</button></div>`
    + items.map(n => `<a href="${esc(n.link || '#/dashboard')}" class="notif-item ${n.read ? '' : 'unread'}" data-nid="${n.id}">
        <span class="notif-dot"></span><span><span style="font-size:13px">${esc(n.text)}</span><br><span class="muted" style="font-size:11px">${fmtDate(n.created_at)}</span></span></a>`).join('');
  dd.querySelector('#markAllRead').onclick = async e => { e.preventDefault(); e.stopPropagation(); await api('/notifications/read', { method: 'POST', body: {} }); refreshNotifBadge(); openNotifications(); };
  dd.querySelectorAll('[data-nid]').forEach(a => a.addEventListener('click', async () => { await api('/notifications/read', { method: 'POST', body: { id: a.dataset.nid } }); refreshNotifBadge(); }));
}

function toggleTheme() {
  State.theme = State.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('jw-theme', State.theme);
  document.documentElement.setAttribute('data-theme', State.theme);
  const b = document.getElementById('themeBtn');
  if (b) b.innerHTML = icon(State.theme === 'dark' ? 'sun' : 'moon');
}
function view() { return document.getElementById('view'); }
function setView(html) { const v = view(); if (v) v.innerHTML = html; }

// ------------------------------------------------- password field with show/hide toggle
// Renders a password <input> wrapped with an eye button. Pair with wirePwToggles()
// after the markup is in the DOM to make the toggle live.
function pwField(id, label, attrs = '') {
  return `<div class="field"><label>${esc(label)}</label>
    <div class="pw-wrap">
      <input type="password" id="${id}" ${attrs}>
      <button type="button" class="pw-eye" data-pwtoggle="${id}" title="Show password" aria-label="Show password">${icon('eye', 'icon-sm')}</button>
    </div></div>`;
}
function wirePwToggles(root) {
  (root || document).querySelectorAll('[data-pwtoggle]').forEach(btn => {
    btn.onclick = () => {
      const input = document.getElementById(btn.dataset.pwtoggle);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('on', show);
      btn.title = btn.ariaLabel = show ? 'Hide password' : 'Show password';
    };
  });
}

// ------------------------------------------------- status badge helper
function statusBadge(status) {
  const map = {
    draft: ['b-draft', 'Draft'], in_review: ['b-review', 'In Review'],
    approved: ['b-approved', 'Approved'], sent_back: ['b-sentback', 'Sent Back'],
  };
  const [cls, label] = map[status] || ['b-draft', status];
  return `<span class="badge ${cls}"><span class="dot"></span>${label}</span>`;
}

// =====================================================================
//  LOGIN
// =====================================================================
function renderLogin() {
  app().innerHTML = `
  <div class="auth-wrap">
    <div class="auth-brand">
      <div class="mark"><span class="logo" style="width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.14);display:grid;place-items:center;">JW</span> Justwords</div>
      <div>
        <h1>Associates'<br>Portal</h1>
        <p>Together we create content-driven, transformational digital journeys for our customers — and a single home for KPIs, appraisals, policies and the people behind the work.</p>
      </div>
      <div class="foot">Justwords Collaborative Knowledge Center · Internal use only</div>
    </div>
    <div class="auth-panel">
      <div class="auth-card">
        <h2>Sign in</h2>
        <p class="sub">Use your Justwords work email to continue.</p>
        <form id="loginForm">
          <div class="field"><label>Work email</label><input type="email" id="email" placeholder="name@justwords.in" autocomplete="username" required></div>
          ${pwField('password', 'Password', 'placeholder="Enter password" autocomplete="current-password" required')}
          <div class="form-error" id="loginErr"></div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;padding:11px" type="submit">Sign in ${icon('arrow', 'icon-sm')}</button>
        </form>
        <div class="hint-box">
          <strong>Test account:</strong> <code>test@justwords.in</code> / <code>Test@1234</code><br>
          <span>Seeded associates sign in with their work email and default password <code>Firstname@justword2026</code> (e.g. <code>Meenaxi@justword2026</code>) and set a new one on first login.</span>
        </div>
      </div>
    </div>
  </div>`;
  wirePwToggles();
  document.getElementById('loginForm').onsubmit = async e => {
    e.preventDefault();
    const err = document.getElementById('loginErr'); err.textContent = '';
    try {
      const { user } = await api('/login', { method: 'POST', body: { email: email.value.trim(), password: password.value } });
      State.me = user;
      location.hash = user.must_reset ? '#/password' : '#/dashboard';
    } catch (ex) { err.textContent = ex.message; }
  };
}

// =====================================================================
//  PASSWORD  (first-login reset + change)
// =====================================================================
function renderPassword() {
  const forced = State.me.must_reset;
  renderShell(`<div class="page" style="max-width:520px">
    <div class="page-head"><div><div class="crumb">Account</div><h1>${forced ? 'Set your password' : 'Change password'}</h1>
    <p>${forced ? 'Choose a new password to finish setting up your account.' : 'Update your account password.'}</p></div></div>
    <div class="card card-pad">
      <form id="pwForm">
        ${forced ? '' : pwField('cur', 'Current password', 'required')}
        ${pwField('np', 'New password', 'minlength="6" required')}
        ${pwField('cp', 'Confirm new password', 'minlength="6" required')}
        <div class="form-error" id="pwErr"></div>
        <button class="btn btn-primary" type="submit">Save password</button>
      </form>
    </div></div>`);
  wirePwToggles();
  document.getElementById('pwForm').onsubmit = async e => {
    e.preventDefault();
    const err = document.getElementById('pwErr'); err.textContent = '';
    if (np.value !== cp.value) { err.textContent = 'Passwords do not match'; return; }
    try {
      await api('/change-password', { method: 'POST', body: { current: forced ? '' : document.getElementById('cur').value, next: np.value } });
      State.me.must_reset = false;
      toast('Password updated', 'ok');
      location.hash = '#/dashboard';
    } catch (ex) { err.textContent = ex.message; }
  };
}

// =====================================================================
//  DASHBOARD
// =====================================================================
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good evening';
}

// A small, non-repetitive set of quick links for the home sidebar. The full set
// of destinations already lives in the top nav — this is just the fast lane.
const QUICK_LINKS = [
  { t: 'Tools & Access',  d: 'Apps & logins you use daily', r: '#/page/tools',       i: 'grid',  c: 'chip-indigo' },
  { t: 'Team Directory',  d: 'Find anyone at Justwords',     r: '#/directory',        i: 'users', c: 'chip-violet' },
  { t: 'Reimbursements',  d: 'Submit & track claims',        r: '#/reimbursements',   i: 'file',  c: 'chip-amber'  },
  { t: 'HR Handbook',     d: 'Policies, schemes & how-tos',  r: '#/page/handbook',    i: 'book',  c: 'chip-teal'   },
];

const QUOTES = [
  ['Great things are done by a series of small things brought together.', 'Vincent van Gogh'],
  ['Alone we can do so little; together we can do so much.', 'Helen Keller'],
  ['Quality is not an act, it is a habit.', 'Aristotle'],
  ['The best way to predict the future is to create it.', 'Peter Drucker'],
  ['Content is the atomic particle of all marketing.', 'Rebecca Lieb'],
];

// category (from the announcements API) -> css suffix used by .tag-* / .cat-*
function catKey(c) {
  const k = String(c || 'announcement').toLowerCase();
  return ['news', 'announcement', 'event', 'celebration', 'policy'].includes(k) ? k : 'announcement';
}
function fmtDay(s) { if (!s) return ''; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

async function renderDashboard() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const me = State.me;
  const isLeader = ['manager', 'director', 'ceo', 'hr', 'hr_admin'].includes(me.role);
  const canPost = ['hr', 'hr_admin'].includes(me.role);

  // Fetch supporting content; degrade gracefully if any endpoint is unavailable.
  let inbox = [], vacancies = [], news = [];
  const jobs = [
    api('/announcements').then(r => { news = r.announcements || []; }).catch(() => {}),
    api('/vacancies').then(r => { vacancies = r.vacancies || []; }).catch(() => {}),
  ];
  if (isLeader) jobs.push(api('/inbox').then(r => { inbox = r.forms || []; }).catch(() => {}));
  await Promise.all(jobs);
  const openRoles = vacancies.filter(v => v.status === 'open').slice(0, 3);

  const now = new Date();
  const dayNum = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const dayCtx = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' });
  const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const [qText, qBy] = QUOTES[doy % QUOTES.length];

  // ---- news / announcements feed
  const newsItem = (a, feature) => {
    const k = catKey(a.category);
    return `<article class="feed-item cat-${k} ${feature ? 'feature' : ''}">
      <div class="feed-head">
        <span class="tag tag-${k}"><span class="dot"></span>${esc(a.category || 'Announcement')}</span>
        ${a.pinned ? `<span class="pin-badge">${icon('info', 'icon-sm')}Pinned</span>` : ''}
        ${canPost ? `<button class="del-x" data-delnews="${a.id}" title="Delete">${icon('x', 'icon-sm')}</button>` : ''}
      </div>
      <h3>${esc(a.title)}</h3>
      ${a.body ? `<p>${esc(a.body)}</p>` : ''}
      <div class="feed-meta">${icon('clock', 'icon-sm')}${esc(fmtDay(a.created_at))}${a.author ? ` · ${esc(a.author)}` : ''}</div>
    </article>`;
  };
  const feedHTML = news.length
    ? news.map((a, i) => newsItem(a, i === 0)).join('')
    : `<div class="card"><div class="empty">${icon('bell')}No announcements yet.</div></div>`;

  // ---- sidebar bits
  const quickHTML = QUICK_LINKS.map(q => `
    <a class="qrow" href="${q.r}"><span class="chip ${q.c}">${icon(q.i)}</span>
      <span><span class="qr-t" style="display:block">${esc(q.t)}</span><span class="qr-d">${esc(q.d)}</span></span>
      <span class="qgo">${icon('arrow', 'icon-sm')}</span></a>`).join('');

  const rolesHTML = openRoles.length ? `
    <div class="side-card">
      <div class="side-title">We’re hiring</div>
      ${openRoles.map(v => `<a class="qrow" href="#/vacancies"><span class="chip chip-pink">${icon('brief')}</span>
        <span><span class="qr-t" style="display:block">${esc(v.title)}</span>
        <span class="qr-d">${esc([v.department, v.location].filter(Boolean).join(' · ')) || 'Justwords'}</span></span>
        <span class="qgo">${icon('arrow', 'icon-sm')}</span></a>`).join('')}
    </div>` : '';

  // ---- approvals (leaders only) — actionable, kept prominent
  const inboxHTML = inbox.length ? `
    <div class="sec-head"><h2>${icon('inbox', 'section-icon')}Awaiting your approval</h2>
      <span class="badge b-review"><span class="dot"></span>${inbox.length} pending</span></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Associate</th><th>Type</th><th>Quarter</th><th>Stage</th><th></th></tr></thead><tbody>
      ${inbox.map(f => `<tr class="row-click" data-form="${f.id}">
        <td><strong>${esc(f.owner.name)}</strong><br><span class="muted">${esc(f.owner.designation)}</span></td>
        <td>${f.type.toUpperCase()}</td><td>${f.quarter}</td><td>${esc(f.stage_label)}</td>
        <td><a class="btn btn-sm btn-primary" href="#/form/${f.id}">Review ${icon('arrow', 'icon-sm')}</a></td></tr>`).join('')}
      </tbody></table></div></div>` : '';

  setView(`<div class="page">
    <div class="hero">
      <div class="hero-meta"><div class="d1">${esc(dayNum)}</div><div class="d2">${esc(dayCtx)}</div></div>
      <div class="eyebrow">${icon('sun', 'icon-sm')} ${greeting()}</div>
      <h1>Hi ${esc(me.name.split(' ')[0])}, welcome back 👋</h1>
      <p class="hero-sub">${esc([me.designation, me.department].filter(Boolean).join(' · ') || 'Justwords Associate')} — here’s what’s happening at Justwords today.</p>
      <div class="hero-actions">
        <a class="btn btn-glass solid" href="#/page/tools">${icon('grid', 'icon-sm')}Explore tools</a>
        <a class="btn btn-glass" href="#/directory">${icon('users', 'icon-sm')}Team directory</a>
      </div>
    </div>

    <div class="train-banner">
      <div>
        <div class="tb-eyebrow">${icon('book', 'icon-sm')} Learn &amp; grow</div>
        <h2>Justwords <span class="hl">Training Centre</span><br>— a dedicated portal for Justwordians.</h2>
        <p>Guides, playbooks and skill-building resources, all in one place. Level up your craft and keep growing with us.</p>
      </div>
      <div class="tb-badge">JW</div>
    </div>

    ${inboxHTML}

    <div class="home-grid">
      <div>
        <div class="sec-head"><h2>${icon('bell', 'section-icon')}News & announcements</h2>
          ${canPost ? `<button class="btn btn-sm btn-primary" id="postNews">${icon('plus', 'icon-sm')}Post</button>` : '<span class="sec-line"></span>'}</div>
        <div class="feed">${feedHTML}</div>
      </div>
      <div class="side">
        <div class="side-card"><div class="side-title">Quick access</div>${quickHTML}</div>
        <div class="spotlight">
          <div class="sp-eyebrow">${icon('bulb', 'icon-sm')}Thought for the day</div>
          <div class="quote">“${esc(qText)}”</div>
          <div class="by">— ${esc(qBy)}</div>
        </div>
        ${rolesHTML}
      </div>
    </div>

    <div class="sec-head"><h2>${icon('bulb', 'section-icon')}Your voice matters</h2><span class="sec-line"></span></div>
    <div class="callout">
      <span class="chip chip-rose">${icon('bulb')}</span>
      <div class="callout-body"><h3>Have an idea to make Justwords better?</h3>
        <p>Share feedback, suggestions or concerns with HR — anonymously if you prefer.</p></div>
      <a class="btn btn-primary" href="#/suggestions">${icon('send', 'icon-sm')}Share an idea</a>
    </div>
  </div>`);

  view().querySelectorAll('[data-form]').forEach(r => r.onclick = e => { if (!e.target.closest('a')) location.hash = '#/form/' + r.dataset.form; });
  view().querySelectorAll('[data-delnews]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this announcement?')) return;
    try { await api('/announcements/' + b.dataset.delnews, { method: 'DELETE' }); toast('Announcement deleted', 'ok'); renderDashboard(); }
    catch (ex) { toast(ex.message, 'err'); }
  });
  const pn = document.getElementById('postNews');
  if (pn) pn.onclick = () => {
    modal('Post an announcement', `
      <div class="field"><label>Category</label><select id="anCat">
        <option>Announcement</option><option>News</option><option>Event</option><option>Celebration</option><option>Policy</option></select></div>
      <div class="field"><label>Title</label><input id="anTitle" placeholder="Short headline"></div>
      <div class="field"><label>Details</label><textarea id="anBody" rows="4" placeholder="What do people need to know?"></textarea></div>
      <label class="check"><input type="checkbox" id="anPin"> Pin to top</label>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="anSave">Post</button>`);
    document.getElementById('anSave').onclick = async () => {
      try {
        await api('/announcements', { method: 'POST', body: { category: anCat.value, title: anTitle.value, body: anBody.value, pinned: anPin.checked } });
        closeModal(); toast('Announcement posted', 'ok'); renderDashboard();
      } catch (ex) { toast(ex.message, 'err'); }
    };
  };
}

// =====================================================================
//  KPI / APPRAISAL FORM
// =====================================================================
const MANDATORY_ROWS = [
  { cat: 'Mandatory Team Objectives', type: 'Mandatory Team Objectives', kpi: 'Achievement of overall revenue target of Justwords', goal: '100%', weight: '', locked: true },
  { cat: 'Mandatory Team Objectives', type: 'Mandatory Team Objectives', kpi: 'Achievement of overall Digital Marketing revenue target of Justwords', goal: '100%', weight: '', locked: true },
];
function defaultData(type) {
  return {
    employee: { financialYear: 'FY2026-27' },
    rows: type === 'appraisal'
      ? [{ cat: 'Individual Objectives', type: 'Objective', kpi: '', goal: '', weight: '' }]
      : JSON.parse(JSON.stringify(MANDATORY_ROWS)).concat([{ cat: 'Individual Objectives', type: 'Individual Objectives', kpi: '', goal: 'Goal', weight: '' }]),
    managerComments: {},
  };
}

const FormCtx = { type: 'kpi', fy: 'FY2026-27', quarter: 'Q1', form: null, userId: null };

async function renderForm(type, params) {
  FormCtx.type = type;
  FormCtx.quarter = params.quarter && ['Q1', 'Q2', 'Q3', 'Q4'].includes(params.quarter) ? params.quarter : (FormCtx.quarter || 'Q1');
  FormCtx.userId = params.user_id ? Number(params.user_id) : State.me.id;
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading form…</div></div>`);
  await loadForm();
}

async function loadFormById(id) {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading form…</div></div>`);
  const { form } = await api('/form/' + id);
  FormCtx.type = form.type; FormCtx.quarter = form.quarter; FormCtx.fy = form.fy; FormCtx.userId = form.owner.id;
  FormCtx.form = form;
  paintForm();
}
async function loadForm() {
  const q = `?type=${FormCtx.type}&fy=${FormCtx.fy}&quarter=${FormCtx.quarter}&user_id=${FormCtx.userId}`;
  const { form } = await api('/form' + q);
  FormCtx.form = form;
  paintForm();
}

function currentData() {
  const d = FormCtx.form.data && Object.keys(FormCtx.form.data).length ? FormCtx.form.data : defaultData(FormCtx.type);
  if (!d.rows || !d.rows.length) d.rows = defaultData(FormCtx.type).rows;
  if (!d.employee) d.employee = { financialYear: FormCtx.fy };
  if (!d.managerComments) d.managerComments = {};
  // Normalize each quarter's comments to a per-manager list (migrate legacy single objects).
  for (const q of Object.keys(d.managerComments)) {
    const v = d.managerComments[q];
    if (v && !Array.isArray(v)) d.managerComments[q] = v.text ? [v] : [];
  }
  return d;
}

// Manager comments for a quarter, as a list (handles legacy single-object shape).
function mgrCommentList(data, q) {
  const v = (data.managerComments || {})[q];
  if (!v) return [];
  return Array.isArray(v) ? v : (v.text ? [v] : []);
}

function computeAuto(rows) {
  let ws = 0, wsum = 0, simpleSum = 0, n = 0;
  rows.forEach(r => {
    const res = parseFloat(r[FormCtx.quarter.toLowerCase()]);
    if (isNaN(res)) return;
    const w = parseFloat(r.weight);
    if (!isNaN(w) && w > 0) { ws += res * w; wsum += w; }
    simpleSum += res; n++;
  });
  if (wsum > 0) return Math.round(ws / wsum);
  if (n > 0) return Math.round(simpleSum / n);
  return 0;
}

function paintForm() {
  const f = FormCtx.form;
  if (f.type === 'appraisal') return paintAppraisal(f);
  const me = State.me;
  const data = currentData();
  const isKPI = f.type === 'kpi';
  const owner = f.owner;
  const editable = f.rights.canEdit;
  const ro = editable ? '' : 'readonly';
  const managerEditing = f.rights.isAncestor && !f.rights.isOwner;

  // send-back history
  const sendbacks = f.history.filter(h => h.action === 'send_back');
  const auto = computeAuto(data.rows);

  // approval chain strip
  const chainHTML = f.chain.length ? f.chain.map((c, i) => `
    ${i > 0 ? `<div class="chain-arrow">${icon('arrow', 'icon-sm')}</div>` : ''}
    <div class="chain-step s-${c.state}">
      <div class="ci">${c.state === 'approved' ? icon('check', 'icon-sm') : c.state === 'current' ? icon('clock', 'icon-sm') : icon('user', 'icon-sm')}</div>
      <div><div class="nm">${esc(c.name)}</div><div class="rl">${esc(c.designation)}</div></div>
    </div>`).join('') : '<span class="muted">No approval chain configured.</span>';

  const rowsHTML = renderRows(data.rows, editable);

  const windowClosedBanner = (!f.rights.windowOpen && f.rights.isOwner && f.status !== 'approved' && f.status !== 'in_review')
    ? `<div class="locked-banner" style="background:var(--danger-soft);color:var(--danger)">${icon('lock')} The ${isKPI ? 'KPI' : 'Appraisal'} filing window is currently <strong>closed by HR</strong>. You can view your form but can't edit or submit until HR reopens it${f.rights.isAncestor ? '' : ' for you'}.</div>`
    : '';
  const bannerHTML = f.status === 'approved'
    ? `<div class="locked-banner approved-banner">${icon('check')} This ${f.quarter} form is fully approved and locked. Approved by ${esc(owner.name)}'s reporting line up to the CEO.</div>`
    : f.status === 'in_review'
      ? `<div class="locked-banner">${icon('lock')} Submitted and locked for editing — ${esc(f.stage_label)}.${managerEditing ? ' As a reporting manager you may still edit this form.' : ''}</div>`
      : f.status === 'sent_back'
        ? `<div class="locked-banner b-sentback" style="background:var(--danger-soft);color:var(--danger)">${icon('arrow')} Sent back for revision — update and resubmit.</div>`
        : '';

  const qtabs = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => `<button class="qtab ${q === f.quarter ? 'active' : ''}" data-q="${q}">${q}</button>`).join('');

  // manager comment blocks — one entry per manager per quarter, each attributed by name.
  const quartersToShow = isKPI ? ['Q1', 'Q2', 'Q3', 'Q4'] : [f.quarter];
  const mgrComments = quartersToShow.map(q => {
    const list = mgrCommentList(data, q);
    return `<div class="mc-q">
      <div class="mc-q-label">${isKPI ? q + ' — ' : ''}Manager comments</div>
      ${list.length ? list.map(c => `<div class="mc-item">
          <span class="mc-avatar">${esc(initials(c.by))}</span>
          <div><div class="mc-by">${esc(c.by)}</div><div class="mc-text">${esc(c.text)}</div></div>
        </div>`).join('') : `<div class="muted" style="padding:4px 0">No manager comment yet.</div>`}
    </div>`;
  }).join('');

  renderShell(`<div class="page">
    <div class="page-head">
      <div><div class="crumb">Performance · ${isKPI ? 'KPI Incentive Plan' : 'Appraisal'}</div>
        <h1>${isKPI ? 'Performance Based Incentive Plan' : 'Appraisal — Objectives'}</h1>
        <p>${esc(owner.name)} · ${esc(owner.designation)} · ${esc(f.fy)}${f.rights.isOwner ? '' : ' · viewing as ' + roleLabel(me.role)}</p>
      </div>
      <div style="text-align:right">
        ${statusBadge(f.status)}
        <div class="muted" style="margin-top:6px">Submitted ${f.submit_count} time${f.submit_count === 1 ? '' : 's'}</div>
        ${isKPI && canSeeTeam(me) ? `<div style="margin-top:10px"><a class="btn btn-sm" href="#/performance/kpi?tab=team">${icon('users', 'icon-sm')}Team Performance</a></div>` : ''}
      </div>
    </div>

    <div class="card"><div class="card-head">
      <span class="card-title">${icon('layers', 'section-icon')}Where is this form right now?</span>
      <div class="qtabs" id="qtabs">${qtabs}</div>
    </div><div class="card-pad">
      <div class="chain">${chainHTML}</div>
      ${windowClosedBanner ? '<div style="margin-top:16px">' + windowClosedBanner + '</div>' : ''}
      ${bannerHTML ? '<div style="margin-top:16px">' + bannerHTML + '</div>' : ''}
    </div></div>

    ${sendbacks.length ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:10px">${icon('arrow', 'section-icon')}Manager Send-Back History</div>
      ${sendbacks.map(s => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><strong>${esc(s.actor_name)}</strong> <span class="muted">(${fmtDate(s.at)})</span><div class="cmt">${esc(s.comment)}</div></div>`).join('')}
    </div>` : ''}

    <div class="card"><div class="card-head"><span class="card-title">${icon('user', 'section-icon')}Employee Information</span></div>
      <div class="card-pad"><div class="kpi-info">
        <div class="field"><label>Name</label><input value="${esc(owner.name)}" readonly></div>
        <div class="field"><label>Designation</label><input value="${esc(owner.designation)}" readonly></div>
        <div class="field"><label>Department</label><input value="${esc(owner.department || '')}" readonly></div>
        <div class="field"><label>Employee Code</label><input value="${esc(owner.ecode || '')}" readonly></div>
        <div class="field"><label>Date of Birth</label><input type="date" id="fi_dob" value="${esc(data.employee.dob || '')}" ${ro}></div>
        <div class="field"><label>Date of Joining</label><input type="date" id="fi_doj" value="${esc(data.employee.doj || '')}" ${ro}></div>
        <div class="field"><label>Financial Year</label><input value="${esc(data.employee.financialYear || f.fy)}" readonly></div>
        <div class="field"><label>Reporting Manager</label><input value="${esc(f.chain[0] ? f.chain[0].name : '—')}" readonly></div>
      </div></div>
    </div>

    <div class="card"><div class="card-head"><span class="card-title">${icon('chart', 'section-icon')}${isKPI ? 'Key Performance Indicators' : 'Objectives & Key Results'}</span>
      <span class="muted">Filing for ${f.quarter}</span></div>
      <div class="tbl-wrap"><table class="kpi-table" id="kpiTable"><thead><tr>
        <th style="min-width:220px">Objective / KPI</th>
        <th>Goal (Year)</th><th>Weightage&nbsp;%</th><th>YTD&nbsp;%</th>
        <th>${f.quarter} Result</th><th style="min-width:150px">Comments</th><th>Support Doc</th>${editable ? '<th></th>' : ''}
      </tr></thead><tbody>${rowsHTML}</tbody></table></div>
      ${editable ? `<div class="card-pad"><button class="btn btn-sm" id="addRow">${icon('plus', 'icon-sm')}Add ${isKPI ? 'Individual KPI' : 'Objective'} row</button></div>` : ''}
    </div>

    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:14px">${icon('target', 'section-icon')}${f.quarter} Final Score (out of 100)</div>
      <div class="score-box">
        <div><div class="lbl muted">Auto-calculated</div><div class="big" id="autoScore">${auto}</div></div>
        <div><div class="lbl muted">Final score</div><input class="kpi-num" id="finalScore" style="font-size:22px;height:44px;width:90px;text-align:center" value="${f.final_score != null ? f.final_score : ''}" ${ro}></div>
        ${editable ? `<button class="btn btn-sm" id="useCalc">${icon('arrow', 'icon-sm')}Use calculated</button>` : ''}
        <div class="muted" style="max-width:340px">Auto-calculated from ${f.quarter} results weighted by weightage. You can override it in the Final score field.</div>
      </div>
    </div>

    <div class="card card-pad"><div class="card-title" style="margin-bottom:10px">${icon('info', 'section-icon')}Manager Comments</div>${mgrComments}
      ${managerEditing ? `<div class="mc-compose">
        <label class="mc-compose-label">${icon('pen', 'icon-sm')}Your comment${isKPI ? ' for ' + f.quarter : ''} <span class="muted">(as ${esc(me.name)}, ${esc(roleLabel(me.role))})</span></label>
        <textarea id="mgrQComment" rows="3" placeholder="Write your comment for ${esc(owner.name)}…">${esc((mgrCommentList(data, f.quarter).find(c => c.byId === me.id) || {}).text || '')}</textarea>
        <div class="mc-compose-foot">
          <span class="muted">Visible to ${esc(owner.name)}. Your comment is kept separately — later approvers can't overwrite it.</span>
          <button class="btn btn-sm btn-primary" id="saveMgrComment">${icon('send', 'icon-sm')}Save comment</button>
        </div>
      </div>` : ''}
    </div>

    ${f.history.length ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:14px">${icon('clock', 'section-icon')}Approval Timeline</div>
      <div class="timeline">${f.history.map(h => `<div class="tl-item"><div class="who">${esc(h.actor_name)} · ${actionLabel(h.action)}</div><div class="meta">${fmtDate(h.at)}</div>${h.comment ? `<div class="cmt">${esc(h.comment)}</div>` : ''}</div>`).join('')}</div>
    </div>` : ''}

    ${isKPI ? `<p class="muted" style="margin:18px 2px 0">Note: The Performance Based Incentive (PBI) is payable only if the Mandatory Team Objectives (overall company performance) are fully achieved, and is disbursed with the April salary for associates on regular payroll. Not applicable during training, probation or notice period.</p>` : ''}

    ${(editable && f.rights.isOwner) || managerEditing || (f.rights.isOwner && (f.status === 'draft' || f.status === 'sent_back')) || f.rights.canApprove ? `
    <div class="card card-pad form-action-bar"><div class="toolbar">
      ${editable && f.rights.isOwner ? `<button class="btn" id="saveDraft">${icon('edit', 'icon-sm')}Save draft</button>` : ''}
      ${managerEditing ? `<button class="btn" id="saveMgr">${icon('edit', 'icon-sm')}Save changes</button>` : ''}
      ${f.rights.isOwner && (f.status === 'draft' || f.status === 'sent_back') ? `<button class="btn btn-primary" id="submitBtn">${icon('send', 'icon-sm')}${f.submit_count ? 'Resubmit for review' : 'Submit for review'}</button>` : ''}
      ${f.rights.canApprove ? `<button class="btn btn-success right" id="approveBtn">${icon('check', 'icon-sm')}Approve & forward</button>
        <button class="btn btn-danger" id="sendbackBtn">${icon('arrow', 'icon-sm')}Send back</button>` : ''}
    </div></div>` : ''}
  </div>`);

  wireForm();
}

function actionLabel(a) { return ({ submit: 'Submitted for review', approve: 'Approved & forwarded', send_back: 'Sent back for revision', edit: 'Edited the form', remark: 'Added an employee remark' }[a] || a); }

function renderRows(rows, editable) {
  const q = FormCtx.quarter.toLowerCase();
  let html = '';
  let lastCat = null;
  rows.forEach((r, i) => {
    if (r.cat !== lastCat) {
      html += `<tr class="kpi-cat"><td colspan="${editable ? 8 : 7}">${esc(r.cat)}</td></tr>`;
      lastCat = r.cat;
    }
    const rd = r.locked ? 'readonly' : (editable ? '' : 'readonly');
    html += `<tr data-row="${i}">
      <td><textarea rows="2" data-k="kpi" ${rd}>${esc(r.kpi || '')}</textarea></td>
      <td><input class="kpi-num" data-k="goal" ${rd} value="${esc(r.goal || '')}"></td>
      <td><input class="kpi-num" data-k="weight" ${editable ? '' : 'readonly'} value="${esc(r.weight || '')}"></td>
      <td><input class="kpi-num" data-k="ytd" ${editable ? '' : 'readonly'} value="${esc(r.ytd || '')}"></td>
      <td><input class="kpi-num" data-k="${q}" ${editable ? '' : 'readonly'} value="${esc(r[q] || '')}"></td>
      <td><textarea rows="2" data-k="comments" ${editable ? '' : 'readonly'}>${esc(r.comments || '')}</textarea></td>
      <td>${r.doc ? `<a href="/uploads/${esc(r.doc.file)}" target="_blank" class="muted" title="${esc(r.doc.name || 'file')}">${icon('file', 'icon-sm')}${esc(r.doc.name || 'file').slice(0, 14)}</a>` : `<span class="muted">—</span>`}
        ${editable ? `<label class="muted" style="display:block;font-size:10px;margin-top:4px">${r.doc ? 'Replace' : 'Attach'} document<input type="file" data-file="${i}" style="font-size:10px;width:100px;margin-top:2px"></label>` : ''}</td>
      ${editable ? `<td>${r.locked ? '' : `<button class="icon-btn btn-sm" data-del="${i}" title="Remove">${icon('x', 'icon-sm')}</button>`}</td>` : ''}
    </tr>`;
  });
  return html;
}

function collectData() {
  const data = currentData();
  view().querySelectorAll('#kpiTable tbody tr[data-row]').forEach(tr => {
    const i = Number(tr.dataset.row);
    const r = data.rows[i]; if (!r) return;
    tr.querySelectorAll('[data-k]').forEach(inp => { r[inp.dataset.k] = inp.value; });
  });
  const dob = document.getElementById('fi_dob'); if (dob) data.employee.dob = dob.value;
  const doj = document.getElementById('fi_doj'); if (doj) data.employee.doj = doj.value;
  data.employee.financialYear = FormCtx.fy;
  // Inline manager comment for the current quarter — upsert THIS manager's own entry,
  // leaving other managers' comments untouched.
  const mqc = document.getElementById('mgrQComment');
  if (mqc) {
    data.managerComments = data.managerComments || {};
    let arr = data.managerComments[FormCtx.quarter];
    if (!Array.isArray(arr)) arr = arr && arr.text ? [arr] : [];
    const txt = mqc.value.trim();
    const i = arr.findIndex(c => c.byId === State.me.id);
    if (txt) {
      const entry = { byId: State.me.id, by: State.me.name, text: txt, at: new Date().toISOString() };
      if (i >= 0) arr[i] = entry; else arr.push(entry);
    } else if (i >= 0) arr.splice(i, 1);
    data.managerComments[FormCtx.quarter] = arr;
  }
  return data;
}

function wireForm() {
  const f = FormCtx.form;
  // quarter tabs
  view().querySelectorAll('#qtabs .qtab').forEach(b => b.onclick = () => {
    FormCtx.quarter = b.dataset.q;
    if (location.hash.startsWith('#/form/')) { /* keep */ }
    loadForm();
  });
  // recompute auto score live
  const recalc = () => {
    const data = collectData();
    const a = computeAuto(data.rows);
    const el = document.getElementById('autoScore'); if (el) el.textContent = a;
  };
  view().querySelectorAll('#kpiTable input, #kpiTable textarea').forEach(i => i.addEventListener('input', recalc));

  const addRow = document.getElementById('addRow');
  if (addRow) addRow.onclick = () => {
    const data = collectData();
    data.rows.push({ cat: 'Individual Objectives', type: f.type === 'kpi' ? 'Individual Objectives' : 'Objective', kpi: '', goal: f.type === 'kpi' ? 'Goal' : '', weight: '' });
    FormCtx.form.data = data;
    view().querySelector('#kpiTable tbody').innerHTML = renderRows(data.rows, true);
    wireRowEvents();
  };
  wireRowEvents();

  const useCalc = document.getElementById('useCalc');
  if (useCalc) useCalc.onclick = () => { document.getElementById('finalScore').value = document.getElementById('autoScore').textContent; };

  const saveDraft = document.getElementById('saveDraft');
  if (saveDraft) saveDraft.onclick = () => saveForm('Draft saved');
  const saveMgr = document.getElementById('saveMgr');
  if (saveMgr) saveMgr.onclick = () => saveForm('Saved as manager edit');
  const saveMgrComment = document.getElementById('saveMgrComment');
  if (saveMgrComment) saveMgrComment.onclick = () => saveForm('Comment saved');

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.onclick = async () => {
    if (!confirm('Submit this ' + f.quarter + ' form for review? It will be locked while your reporting line approves it.')) return;
    const data = collectData();
    try {
      await api('/form/' + f.id + '/submit', { method: 'POST', body: { data, auto_score: computeAuto(data.rows), final_score: numOrNull(document.getElementById('finalScore').value) } });
      toast('Submitted for review', 'ok'); loadForm();
    } catch (ex) { toast(ex.message, 'err'); }
  };

  // Managers in the chain carry their in-form edits + row comments along with the action.
  const kpiPayload = () => {
    const data = collectData();
    return { data, auto_score: computeAuto(data.rows), final_score: numOrNull((document.getElementById('finalScore') || {}).value) };
  };
  const approveBtn = document.getElementById('approveBtn');
  if (approveBtn) approveBtn.onclick = () => approveModal(f, f.rights.isAncestor && !f.rights.isOwner ? kpiPayload : null);
  const sendbackBtn = document.getElementById('sendbackBtn');
  if (sendbackBtn) sendbackBtn.onclick = () => sendbackModal(f, f.rights.isAncestor && !f.rights.isOwner ? kpiPayload : null);
}

function wireRowEvents() {
  view().querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const data = collectData();
    data.rows.splice(Number(b.dataset.del), 1);
    FormCtx.form.data = data;
    view().querySelector('#kpiTable tbody').innerHTML = renderRows(data.rows, true);
    wireRowEvents();
    view().querySelectorAll('#kpiTable input, #kpiTable textarea').forEach(i => i.addEventListener('input', () => {
      const d = collectData(); const el = document.getElementById('autoScore'); if (el) el.textContent = computeAuto(d.rows);
    }));
  });
  view().querySelectorAll('[data-file]').forEach(inp => inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file); fd.append('form_id', FormCtx.form.id); fd.append('field', 'row' + inp.dataset.file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await res.json(); if (!res.ok) throw new Error(j.error);
      const data = collectData();
      data.rows[Number(inp.dataset.file)].doc = { file: j.filename, name: j.original };
      FormCtx.form.data = data;
      toast('File attached — remember to save', 'ok');
    } catch (ex) { toast(ex.message, 'err'); }
  });
}
function numOrNull(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }

async function saveForm(msg) {
  const f = FormCtx.form;
  const data = collectData();
  try {
    const { form } = await api('/form/' + f.id + '/save', { method: 'POST', body: { data, auto_score: computeAuto(data.rows), final_score: numOrNull((document.getElementById('finalScore') || {}).value) } });
    FormCtx.form = form;
    toast(msg || 'Saved', 'ok');
  } catch (ex) { toast(ex.message, 'err'); }
}

// `getPayload` (optional) returns { data, auto_score, final_score } so a manager's
// in-form edits ride along with the approve/send-back action and persist for the owner.
function approveModal(f, getPayload) {
  modal('Approve & forward', `<div class="field"><label>Manager comment for ${f.quarter} (optional)</label><textarea id="mgrCmt" rows="3" placeholder="Add a note for the associate…"></textarea></div>
    <div class="field"><label>Approval note (optional)</label><input id="apCmt" placeholder="Looks good"></div>
    <p class="muted">Approving forwards this form to the next person in the chain. After the final approver (CEO) it becomes locked and marked approved.</p>`,
    `<button class="btn" data-close>Cancel</button><button class="btn btn-success" id="doApprove">${icon('check', 'icon-sm')}Approve</button>`);
  document.getElementById('doApprove').onclick = async () => {
    try {
      const body = { comment: document.getElementById('apCmt').value, managerComment: document.getElementById('mgrCmt').value };
      if (getPayload) Object.assign(body, getPayload());
      await api('/form/' + f.id + '/approve', { method: 'POST', body });
      closeModal(); toast('Approved & forwarded', 'ok'); loadFormById(f.id);
    } catch (ex) { toast(ex.message, 'err'); }
  };
}
function sendbackModal(f, getPayload) {
  modal('Send back for revision', `<div class="field"><label>Reason / instructions <span style="color:var(--danger)">*</span></label><textarea id="sbCmt" rows="4" placeholder="Explain what needs to change…"></textarea></div>
    <p class="muted">The form returns to ${esc(f.owner.name)} for editing and re-submission from the start of the chain. Any edits or comments you made above are saved and sent back with it.</p>`,
    `<button class="btn" data-close>Cancel</button><button class="btn btn-danger" id="doSendback">Send back</button>`);
  document.getElementById('doSendback').onclick = async () => {
    const c = document.getElementById('sbCmt').value.trim();
    if (!c) { toast('Please add a reason', 'err'); return; }
    try {
      const body = { comment: c };
      if (getPayload) Object.assign(body, getPayload());
      await api('/form/' + f.id + '/sendback', { method: 'POST', body });
      closeModal(); toast('Sent back', 'ok'); loadFormById(f.id);
    } catch (ex) { toast(ex.message, 'err'); }
  };
}

// =====================================================================
//  APPRAISAL  (self → manager enters 360 peer scores + rating form → publish)
// =====================================================================
const APPRAISAL_COMPETENCIES = [
  ['quality', 'Quality of Work'],
  ['productivity', 'Productivity & Ownership'],
  ['communication', 'Communication & Collaboration'],
  ['reliability', 'Reliability & Accountability'],
  ['initiative', 'Initiative & Innovation'],
  ['skills', 'Domain / Technical Skills'],
];
const RATING_WORDS = ['', 'Needs improvement', 'Developing', 'Meets expectations', 'Exceeds expectations', 'Outstanding'];

function ratingLabel(n) { const i = Number(n); return i >= 1 && i <= 5 ? `${i} — ${RATING_WORDS[i]}` : '—'; }
function ratingOptions(v) {
  let s = '<option value="">Not rated</option>';
  for (let i = 1; i <= 5; i++) s += `<option value="${i}" ${String(v) === String(i) ? 'selected' : ''}>${i} — ${RATING_WORDS[i]}</option>`;
  return s;
}
function avgRating(ratings) {
  const vals = APPRAISAL_COMPETENCIES.map(([k]) => Number((ratings || {})[k])).filter(n => n >= 1 && n <= 5);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
function competencyGrid(prefix, ratings, editable) {
  return `<div class="kpi-info">${APPRAISAL_COMPETENCIES.map(([k, label]) => `
    <div class="field"><label>${esc(label)}</label>
      ${editable
        ? `<select data-rk="${k}" id="${prefix}_${k}">${ratingOptions((ratings || {})[k])}</select>`
        : `<input value="${esc(ratingLabel((ratings || {})[k]))}" readonly>`}
    </div>`).join('')}</div>`;
}
function collectRatings(prefix) {
  const r = {};
  APPRAISAL_COMPETENCIES.forEach(([k]) => { const el = document.getElementById(prefix + '_' + k); if (el && el.value) r[k] = Number(el.value); });
  return r;
}
function appraisalData(f) {
  const d = (f.data && f.data.kind === 'appraisal-v2') ? f.data : {};
  return {
    kind: 'appraisal-v2',
    self: d.self || { ratings: {}, achievements: '', strengths: '', improvements: '', goals: '' },
    peers: Array.isArray(d.peers) ? d.peers : [],
    managerReview: d.managerReview || { ratings: {}, strengths: '', improvements: '', overall: '', finalScore: '' },
    employeeRemark: d.employeeRemark || null,
    peerCount: d.peerCount,
    sharedFeedback: d.sharedFeedback || '',
  };
}

// The 360° comparison table: parameters as rows, Self + Person 1..N + Peer avg as columns.
function colAvg(ratingsList) {
  const vals = [];
  APPRAISAL_COMPETENCIES.forEach(([k]) => ratingsList.forEach(r => { const n = Number((r || {})[k]); if (n >= 1 && n <= 5) vals.push(n); }));
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
}
function peerTableHTML(selfRatings, peers, editable) {
  const head = `<tr><th style="min-width:200px">Parameter</th><th>Self</th>${peers.map((p, i) => `<th>Person ${i + 1}</th>`).join('')}<th>Peer avg</th></tr>`;
  const nameRow = `<tr><td class="muted">Peer name (optional)</td><td class="muted">${esc('—')}</td>${peers.map((p, i) => `<td>${editable ? `<input class="ap-name" data-peer="${i}" placeholder="Person ${i + 1}" value="${esc(p.name || '')}" style="width:96px;font-size:12px">` : esc(p.name || '—')}</td>`).join('')}<td></td></tr>`;
  const body = APPRAISAL_COMPETENCIES.map(([k, label]) => {
    const pv = peers.map(p => Number((p.ratings || {})[k])).filter(n => n >= 1 && n <= 5);
    const avg = pv.length ? Math.round((pv.reduce((a, b) => a + b, 0) / pv.length) * 10) / 10 : null;
    return `<tr><td>${esc(label)}</td>
      <td style="text-align:center;font-weight:600">${selfRatings && selfRatings[k] != null ? esc(selfRatings[k]) : '—'}</td>
      ${peers.map((p, i) => `<td style="text-align:center">${editable
        ? `<input class="kpi-num ap-cell" data-peer="${i}" data-rk="${k}" type="number" min="1" max="5" step="1" value="${(p.ratings || {})[k] != null ? esc((p.ratings || {})[k]) : ''}" style="width:52px;text-align:center">`
        : ((p.ratings || {})[k] != null ? esc((p.ratings || {})[k]) : '—')}</td>`).join('')}
      <td class="ap-avg" data-avgk="${k}" style="text-align:center;font-weight:600">${avg != null ? avg : '—'}</td></tr>`;
  }).join('');
  const overall = `<tr class="kpi-cat"><td>Overall average</td>
    <td style="text-align:center">${avgRating(selfRatings) != null ? avgRating(selfRatings) : '—'}</td>
    ${peers.map(p => `<td style="text-align:center">${avgRating(p.ratings) != null ? avgRating(p.ratings) : '—'}</td>`).join('')}
    <td class="ap-overall" style="text-align:center">${colAvg(peers.map(p => p.ratings)) != null ? colAvg(peers.map(p => p.ratings)) : '—'}</td></tr>`;
  return `<table class="kpi-table" id="peerTable"><thead>${head}</thead><tbody>${nameRow}${body}${overall}</tbody></table>`;
}

function paintAppraisal(f) {
  const me = State.me;
  const r = f.rights;
  const d = appraisalData(f);
  const owner = f.owner;
  const selfEditable = r.isOwner && r.canEdit && (f.status === 'draft' || f.status === 'sent_back');
  const mgrEditable = r.fullAccess && f.status !== 'approved';
  const published = f.status === 'approved';

  const chainHTML = f.chain.length ? f.chain.map((c, i) => `
    ${i > 0 ? `<div class="chain-arrow">${icon('arrow', 'icon-sm')}</div>` : ''}
    <div class="chain-step s-${c.state}">
      <div class="ci">${c.state === 'approved' ? icon('check', 'icon-sm') : c.state === 'current' ? icon('clock', 'icon-sm') : icon('user', 'icon-sm')}</div>
      <div><div class="nm">${esc(c.name)}</div><div class="rl">${esc(c.designation)}</div></div>
    </div>`).join('') : '<span class="muted">No approval chain configured.</span>';

  const sendbacks = f.history.filter(h => h.action === 'send_back');
  const bannerHTML = published
    ? `<div class="locked-banner approved-banner">${icon('check')} This appraisal is <strong>approved and published</strong>. Final sign-off completed the reporting line.</div>`
    : f.status === 'in_review'
      ? `<div class="locked-banner">${icon('lock')} Submitted — ${esc(f.stage_label)}.</div>`
      : f.status === 'sent_back'
        ? `<div class="locked-banner b-sentback" style="background:var(--danger-soft);color:var(--danger)">${icon('arrow')} Sent back for revision — update your self-appraisal and resubmit.</div>`
        : `<div class="locked-banner">${icon('edit')} Draft — with the employee. Complete your self-appraisal and submit it to your manager.</div>`;

  // ---------- section: self-appraisal ----------
  const selfSection = `
    <div class="card"><div class="card-head"><span class="card-title">${icon('user', 'section-icon')}Self-Appraisal</span>
      <span class="muted">${r.isOwner ? 'Filled by you' : 'Filled by ' + esc(owner.name)}</span></div>
      <div class="card-pad">
        ${competencyGrid('self', d.self.ratings, selfEditable)}
        <div class="field" style="margin-top:14px"><label>Key achievements this year</label>
          <textarea id="self_ach" rows="3" ${selfEditable ? '' : 'readonly'}>${esc(d.self.achievements || '')}</textarea></div>
        <div class="field"><label>My strengths</label>
          <textarea id="self_str" rows="3" ${selfEditable ? '' : 'readonly'}>${esc(d.self.strengths || '')}</textarea></div>
        <div class="field"><label>Areas I want to improve</label>
          <textarea id="self_imp" rows="3" ${selfEditable ? '' : 'readonly'}>${esc(d.self.improvements || '')}</textarea></div>
        <div class="field"><label>Goals for next year</label>
          <textarea id="self_goal" rows="3" ${selfEditable ? '' : 'readonly'}>${esc(d.self.goals || '')}</textarea></div>
      </div>
    </div>`;

  // ---------- section: 360° peer review table (managers/HR only, confidential) ----------
  // Peers are spoken to in person; the manager enters each Person's score here. The Self
  // column shows what the employee rated themselves, for side-by-side comparison.
  let peersSection = '';
  if (r.fullAccess) {
    FormCtx.peers = d.peers.map(p => ({ name: p.name || '', ratings: { ...(p.ratings || {}) } }));
    peersSection = `
      <div class="card"><div class="card-head"><span class="card-title">${icon('users', 'section-icon')}360° Peer Review</span>
        ${r.canManagePeers ? `<div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm" id="addPeer">${icon('plus', 'icon-sm')}Add peer</button>
          ${d.peers.length ? `<button class="btn btn-sm" id="rmPeer">${icon('x', 'icon-sm')}Remove last</button>` : ''}
          <button class="btn btn-sm btn-primary" id="savePeers">${icon('edit', 'icon-sm')}Save scores</button></div>` : ''}</div>
        <div class="card-pad">
          <p class="muted" style="margin-bottom:12px">Speak to each peer and enter their score (1–5) per parameter. The <strong>Self</strong> column is what ${esc(owner.name.split(' ')[0])} rated themselves. Peer scores are confidential — never shown to ${esc(owner.name.split(' ')[0])}.</p>
          <div class="tbl-wrap" id="peerWrap">${peerTableHTML(d.self.ratings, FormCtx.peers, mgrEditable)}</div>
          ${!d.peers.length && r.canManagePeers ? '<p class="muted" style="margin-top:10px">No peers added yet — click “Add peer” to add Person 1, 2, 3…</p>' : ''}
        </div>
      </div>`;
  }

  // ---------- section: appraisal system form (manager rating) ----------
  let mgrSection = '';
  if (r.fullAccess) {
    const mr = d.managerReview || {};
    mgrSection = `
      <div class="card"><div class="card-head"><span class="card-title">${icon('target', 'section-icon')}Employee Appraisal Form (Manager)</span>
        <span class="muted">${mr.by ? 'Last updated by ' + esc(mr.by) : 'To be completed by the manager'}</span></div>
        <div class="card-pad">
          ${competencyGrid('mgr', mr.ratings, mgrEditable)}
          <div class="field" style="margin-top:14px"><label>Strengths</label>
            <textarea id="mgr_str" rows="3" ${mgrEditable ? '' : 'readonly'}>${esc(mr.strengths || '')}</textarea></div>
          <div class="field"><label>Development areas</label>
            <textarea id="mgr_imp" rows="3" ${mgrEditable ? '' : 'readonly'}>${esc(mr.improvements || '')}</textarea></div>
          <div class="field"><label>Overall summary / message shared with the employee</label>
            <textarea id="mgr_overall" rows="3" ${mgrEditable ? '' : 'readonly'}>${esc(mr.overall || '')}</textarea>
            <span class="muted">Only this summary is visible to ${esc(owner.name.split(' ')[0])} after publishing — ratings stay confidential.</span></div>
          <div class="score-box" style="margin-top:14px">
            <div><div class="lbl muted">Manager avg</div><div class="big">${avgRating(mr.ratings) != null ? avgRating(mr.ratings) : '—'}</div></div>
            <div><div class="lbl muted">Final score /100</div>
              <input class="kpi-num" id="mgr_final" style="font-size:22px;height:44px;width:90px;text-align:center" value="${mr.finalScore != null ? esc(mr.finalScore) : ''}" ${mgrEditable ? '' : 'readonly'}></div>
            ${mgrEditable ? `<button class="btn btn-sm" id="saveMgrReview">${icon('edit', 'icon-sm')}Save appraisal form</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  // ---------- owner's confidential note + shared feedback ----------
  let ownerNote = '';
  if (r.isOwner) {
    ownerNote = `<div class="card card-pad" style="background:var(--accent-soft)">
      <div class="card-title" style="margin-bottom:6px">${icon('lock', 'section-icon')}About your ratings</div>
      <p class="muted">Peer 360° feedback and your manager's ratings are confidential and are not shown to you. ${published ? 'Your appraisal is complete — you can read your manager\'s summary below and download your record.' : 'You\'ll be notified as your appraisal moves through review.'}</p>
      ${published && d.sharedFeedback ? `<div style="margin-top:10px"><strong style="font-size:13px">Manager's summary for you</strong><div class="cmt" style="margin-top:4px">${esc(d.sharedFeedback)}</div></div>` : ''}
    </div>`;
  }

  // ---------- employee remark (owner edit; visible to managers/HR) ----------
  const remark = d.employeeRemark;
  let remarkSection = '';
  if (r.isOwner) {
    remarkSection = `<div class="card"><div class="card-head"><span class="card-title">${icon('chat', 'section-icon')}Your remark on the process</span></div>
      <div class="card-pad">
        <div class="field"><textarea id="empRemark" rows="3" placeholder="Share any remark about your appraisal or the process…">${esc(remark ? remark.text : '')}</textarea></div>
        <div class="toolbar"><button class="btn" id="saveRemark">${icon('edit', 'icon-sm')}Save remark</button>
          ${remark ? `<span class="muted right">Last saved ${fmtDate(remark.at)}</span>` : ''}</div>
      </div></div>`;
  } else if (r.fullAccess && remark) {
    remarkSection = `<div class="card card-pad"><div class="card-title" style="margin-bottom:6px">${icon('chat', 'section-icon')}Employee remark</div>
      <div class="cmt">${esc(remark.text)}</div><div class="muted" style="margin-top:4px">${fmtDate(remark.at)}</div></div>`;
  }

  // ---------- actions ----------
  const actions = `<div class="card card-pad"><div class="toolbar">
    ${selfEditable ? `<button class="btn" id="saveSelf">${icon('edit', 'icon-sm')}Save self-appraisal</button>` : ''}
    ${r.isOwner && (f.status === 'draft' || f.status === 'sent_back') ? `<button class="btn btn-primary" id="submitAppraisal">${icon('send', 'icon-sm')}${f.submit_count ? 'Resubmit' : 'Submit to manager'}</button>` : ''}
    ${r.canApprove ? `<button class="btn btn-success right" id="approveBtn">${icon('check', 'icon-sm')}Approve & forward</button>
      <button class="btn btn-danger" id="sendbackBtn">${icon('arrow', 'icon-sm')}Send back</button>` : ''}
    ${published && (r.isOwner || r.fullAccess) ? `<button class="btn btn-primary right" id="downloadAppraisal">${icon('file', 'icon-sm')}Download appraisal</button>` : ''}
  </div></div>`;

  renderShell(`<div class="page">
    <div class="page-head">
      <div><div class="crumb">Performance · Appraisal</div>
        <h1>Annual Appraisal</h1>
        <p>${esc(owner.name)} · ${esc(owner.designation)} · ${esc(f.fy)}${r.isOwner ? '' : ' · viewing as ' + roleLabel(me.role)}</p>
      </div>
      <div style="text-align:right">${statusBadge(f.status)}</div>
    </div>

    <div class="card"><div class="card-head"><span class="card-title">${icon('layers', 'section-icon')}Where is this appraisal right now?</span></div>
      <div class="card-pad"><div class="chain">${chainHTML}</div>
        <div style="margin-top:16px">${bannerHTML}</div></div></div>

    ${sendbacks.length ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:10px">${icon('arrow', 'section-icon')}Send-back history</div>
      ${sendbacks.map(s => `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><strong>${esc(s.actor_name)}</strong> <span class="muted">(${fmtDate(s.at)})</span><div class="cmt">${esc(s.comment)}</div></div>`).join('')}</div>` : ''}

    ${ownerNote}
    ${selfSection}
    ${peersSection}
    ${mgrSection}
    ${remarkSection}

    ${f.history.length ? `<div class="card card-pad"><div class="card-title" style="margin-bottom:14px">${icon('clock', 'section-icon')}Timeline</div>
      <div class="timeline">${f.history.map(h => `<div class="tl-item"><div class="who">${esc(h.actor_name)} · ${actionLabel(h.action)}</div><div class="meta">${fmtDate(h.at)}</div>${h.comment ? `<div class="cmt">${esc(h.comment)}</div>` : ''}</div>`).join('')}</div></div>` : ''}

    ${actions}
  </div>`);

  wireAppraisal(f);
}

function collectSelf() {
  return {
    ratings: collectRatings('self'),
    achievements: (document.getElementById('self_ach') || {}).value || '',
    strengths: (document.getElementById('self_str') || {}).value || '',
    improvements: (document.getElementById('self_imp') || {}).value || '',
    goals: (document.getElementById('self_goal') || {}).value || '',
  };
}

function wireAppraisal(f) {
  const r = f.rights;
  const reload = () => loadFormById(f.id);

  const saveSelf = document.getElementById('saveSelf');
  if (saveSelf) saveSelf.onclick = async () => {
    try { await api('/form/' + f.id + '/self', { method: 'POST', body: { self: collectSelf() } }); toast('Self-appraisal saved', 'ok'); reload(); }
    catch (ex) { toast(ex.message, 'err'); }
  };

  const submitBtn = document.getElementById('submitAppraisal');
  if (submitBtn) submitBtn.onclick = async () => {
    if (!confirm('Submit your self-appraisal to your manager? It will be locked while your reporting line reviews it.')) return;
    try {
      await api('/form/' + f.id + '/self', { method: 'POST', body: { self: collectSelf() } });
      await api('/form/' + f.id + '/submit', { method: 'POST', body: { comment: 'Self-appraisal submitted' } });
      toast('Submitted to your manager', 'ok'); reload();
    } catch (ex) { toast(ex.message, 'err'); }
  };

  // ---- 360° peer table (manager-entered) ----
  const rerenderPeers = () => {
    const wrap = document.getElementById('peerWrap'); if (!wrap) return;
    wrap.innerHTML = peerTableHTML(appraisalData(f).self.ratings, FormCtx.peers, true);
    bindPeerCells();
  };
  const addPeer = document.getElementById('addPeer');
  if (addPeer) addPeer.onclick = () => { FormCtx.peers = collectPeers(); FormCtx.peers.push({ name: '', ratings: {} }); rerenderPeers(); };
  const rmPeer = document.getElementById('rmPeer');
  if (rmPeer) rmPeer.onclick = () => { FormCtx.peers = collectPeers(); FormCtx.peers.pop(); rerenderPeers(); };
  const savePeers = document.getElementById('savePeers');
  if (savePeers) savePeers.onclick = async () => {
    try { await api('/form/' + f.id + '/peers', { method: 'POST', body: { peers: collectPeers() } }); toast('Peer scores saved', 'ok'); reload(); }
    catch (ex) { toast(ex.message, 'err'); }
  };
  bindPeerCells();

  const saveMgrReview = document.getElementById('saveMgrReview');
  if (saveMgrReview) saveMgrReview.onclick = async () => {
    try {
      await api('/form/' + f.id + '/manager-review', { method: 'POST', body: { managerReview: {
        ratings: collectRatings('mgr'),
        strengths: (document.getElementById('mgr_str') || {}).value || '',
        improvements: (document.getElementById('mgr_imp') || {}).value || '',
        overall: (document.getElementById('mgr_overall') || {}).value || '',
        finalScore: (document.getElementById('mgr_final') || {}).value || '',
      } } });
      toast('Appraisal form saved', 'ok'); reload();
    } catch (ex) { toast(ex.message, 'err'); }
  };

  const saveRemark = document.getElementById('saveRemark');
  if (saveRemark) saveRemark.onclick = async () => {
    try { await api('/form/' + f.id + '/remark', { method: 'POST', body: { text: (document.getElementById('empRemark') || {}).value || '' } }); toast('Remark saved', 'ok'); reload(); }
    catch (ex) { toast(ex.message, 'err'); }
  };

  const approveBtn = document.getElementById('approveBtn');
  if (approveBtn) approveBtn.onclick = () => approveModal(f);
  const sendbackBtn = document.getElementById('sendbackBtn');
  if (sendbackBtn) sendbackBtn.onclick = () => sendbackModal(f);

  const dl = document.getElementById('downloadAppraisal');
  if (dl) dl.onclick = () => downloadAppraisal(f);
}

// Read the current peer scores from the table into an array (Person 1..N).
function collectPeers() {
  return (FormCtx.peers || []).map((p, i) => {
    const ratings = {};
    APPRAISAL_COMPETENCIES.forEach(([k]) => {
      const el = view().querySelector(`.ap-cell[data-peer="${i}"][data-rk="${k}"]`);
      if (el && el.value !== '') { const n = Number(el.value); if (n >= 1 && n <= 5) ratings[k] = n; }
    });
    const nameEl = view().querySelector(`.ap-name[data-peer="${i}"]`);
    return { name: nameEl ? nameEl.value : (p.name || ''), ratings };
  });
}
// Recompute the peer-average column live and keep FormCtx.peers in sync as cells change.
function bindPeerCells() {
  const update = () => {
    FormCtx.peers = collectPeers();
    APPRAISAL_COMPETENCIES.forEach(([k]) => {
      const vals = FormCtx.peers.map(p => p.ratings[k]).filter(n => n >= 1 && n <= 5);
      const el = view().querySelector(`.ap-avg[data-avgk="${k}"]`);
      if (el) el.textContent = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : '—';
    });
    const ov = view().querySelector('.ap-overall');
    if (ov) { const a = colAvg(FormCtx.peers.map(p => p.ratings)); ov.textContent = a != null ? a : '—'; }
  };
  view().querySelectorAll('#peerTable .ap-cell').forEach(inp => inp.oninput = update);
}

// Build a self-contained printable HTML record from whatever the current viewer is allowed to see.
function downloadAppraisal(f) {
  const d = appraisalData(f);
  const owner = f.owner;
  const isFull = f.rights.fullAccess;
  const sec = (title, body) => `<h2>${esc(title)}</h2>${body}`;
  const ratingsTable = (ratings) => `<table><tbody>${APPRAISAL_COMPETENCIES.map(([k, l]) =>
    `<tr><td>${esc(l)}</td><td>${esc(ratingLabel((ratings || {})[k]))}</td></tr>`).join('')}</tbody></table>`;
  const para = (t) => `<p>${esc(t || '—').replace(/\n/g, '<br>')}</p>`;

  let body = sec('Self-Appraisal', ratingsTable(d.self.ratings) +
    `<h3>Achievements</h3>${para(d.self.achievements)}<h3>Strengths</h3>${para(d.self.strengths)}<h3>Areas to improve</h3>${para(d.self.improvements)}<h3>Goals</h3>${para(d.self.goals)}`);

  if (isFull) {
    const peers = d.peers || [];
    if (peers.length) {
      const head = `<tr><th>Parameter</th><th>Self</th>${peers.map((p, i) => `<th>${esc(p.name || 'Person ' + (i + 1))}</th>`).join('')}<th>Peer avg</th></tr>`;
      const rows = APPRAISAL_COMPETENCIES.map(([k, l]) => {
        const pv = peers.map(p => Number((p.ratings || {})[k])).filter(n => n >= 1 && n <= 5);
        const avg = pv.length ? Math.round((pv.reduce((a, b) => a + b, 0) / pv.length) * 10) / 10 : '—';
        return `<tr><td>${esc(l)}</td><td>${esc((d.self.ratings || {})[k] != null ? (d.self.ratings || {})[k] : '—')}</td>${peers.map(p => `<td>${esc((p.ratings || {})[k] != null ? (p.ratings || {})[k] : '—')}</td>`).join('')}<td>${avg}</td></tr>`;
      }).join('');
      body += sec(`360° Peer Review (${peers.length} peer${peers.length === 1 ? '' : 's'})`, `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`);
    }
    const mr = d.managerReview || {};
    body += sec('Manager Appraisal', ratingsTable(mr.ratings) +
      `<h3>Strengths</h3>${para(mr.strengths)}<h3>Development areas</h3>${para(mr.improvements)}<h3>Overall</h3>${para(mr.overall)}<p><strong>Final score:</strong> ${mr.finalScore != null && mr.finalScore !== '' ? esc(mr.finalScore) + ' / 100' : '—'}</p>`);
  } else {
    body += `<p style="color:#666"><em>Peer 360° feedback and manager ratings are confidential and are not included in this copy.</em></p>`;
    if (d.sharedFeedback) body += sec("Manager's summary", para(d.sharedFeedback));
  }
  if (d.employeeRemark) body += sec('Employee remark', para(d.employeeRemark.text));

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Appraisal — ${esc(owner.name)}</title>
    <style>body{font-family:Georgia,'Times New Roman',serif;color:#141414;max-width:760px;margin:32px auto;padding:0 20px;line-height:1.5}
    h1{border-bottom:3px solid #f5c518;padding-bottom:8px}h2{margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:4px}
    h3{margin:14px 0 2px;font-size:14px}table{border-collapse:collapse;width:100%;margin:6px 0}td{border:1px solid #e0e0e0;padding:6px 10px;font-size:14px}
    .meta{color:#666;font-size:13px}</style></head><body>
    <h1>Annual Appraisal — ${esc(owner.name)}</h1>
    <p class="meta">${esc(owner.designation || '')} · ${esc(owner.department || '')} · ${esc(f.fy)} · Status: ${esc(f.status)}</p>
    ${body}
    <p class="meta" style="margin-top:32px">Generated from the Justwords Associates' Portal on ${new Date().toLocaleString('en-IN')}.</p>
    </body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Appraisal_${owner.name.replace(/\s+/g, '_')}_${f.fy}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Appraisal downloaded', 'ok');
}

// =====================================================================
//  TEAM / INBOX / DIRECTORY
// =====================================================================
async function renderInbox() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { forms } = await api('/inbox');
  setView(`<div class="page"><div class="page-head"><div><div class="crumb">Approvals</div><h1>My inbox</h1>
    <p>Forms currently waiting for your approval.</p></div></div>
    ${forms.length ? tableOfForms(forms, true) : `<div class="card"><div class="empty">${icon('check')}You're all caught up — nothing awaiting approval.</div></div>`}
  </div>`);
  bindFormRows();
}
// Back-compat: old #/team link now lands on the KPI Team tab.
function renderTeam() { location.hash = '#/performance/kpi?tab=team'; }

const FY = 'FY2026-27';
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

// Performance hub: Performance → KPI / Appraisal, each with Self (+ Team if you manage people).
async function renderPerformance(type, params) {
  type = type === 'appraisal' ? 'appraisal' : 'kpi';
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const me = State.me;
  let forms = [], win = {};
  try {
    ({ forms } = await api('/forms?type=' + type + '&fy=' + FY));
    win = await api('/my-windows?fy=' + FY).catch(() => ({}));
  } catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }

  const mine = forms.filter(f => f.owner.id === me.id);
  const windowOpen = type === 'appraisal' ? !!win.appraisal : !!win.kpi;
  // Team performance lives under the KPI Plan only (not duplicated under Appraisal). The
  // KPI Team tab shows the whole team's performance across BOTH KPI and appraisal.
  const canTeam = me.is_manager || isAdminLevel(me);
  const showTeam = type === 'kpi' && canTeam;

  // which tab (team only exists on the KPI page)
  let tab = params && params.tab === 'team' && showTeam ? 'team' : 'self';

  let teamCombined = [];
  if (tab === 'team') {
    const teamKpi = forms.filter(f => f.owner.id !== me.id);
    let teamAppr = [];
    try { ({ forms: teamAppr } = await api('/forms?type=appraisal&fy=' + FY)); teamAppr = teamAppr.filter(f => f.owner.id !== me.id); } catch (_) {}
    teamCombined = teamKpi.concat(teamAppr).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  const typeLabel = type === 'kpi' ? 'KPI Incentive Plan' : 'Appraisal';
  const tabs = showTeam ? `<div class="seg" id="perfTabs">
      <a class="seg-btn ${tab === 'self' ? 'active' : ''}" href="#/performance/kpi?tab=self">${icon('user', 'icon-sm')}Self</a>
      <a class="seg-btn ${tab === 'team' ? 'active' : ''}" href="#/performance/kpi?tab=team">${icon('users', 'icon-sm')}Team performance</a>
    </div>` : '';
  const typeSwitch = `<div class="seg seg-soft">
      <a class="seg-btn ${type === 'kpi' ? 'active' : ''}" href="#/performance/kpi?tab=self">${icon('chart', 'icon-sm')}KPI</a>
      <a class="seg-btn ${type === 'appraisal' ? 'active' : ''}" href="#/performance/appraisal">${icon('target', 'icon-sm')}Appraisal</a>
    </div>`;

  const body = tab === 'team'
    ? perfTeamView(teamCombined)
    : perfSelfView(type, mine, windowOpen);

  setView(`<div class="page">
    <div class="page-head">
      <div><div class="crumb">Performance</div><h1>${typeLabel}</h1>
        <p>${type === 'kpi' ? 'Your quarterly performance-based incentive plan.' : 'Your annual appraisal.'} · ${FY}</p></div>
      ${typeSwitch}
    </div>
    ${tabs}
    ${body}
  </div>`);
  bindFormRows();
}

// --- Self view: quarter cards (KPI) or a single annual card (appraisal) ---
function perfSelfView(type, mine, windowOpen) {
  const byQ = {}; mine.forEach(f => { byQ[f.quarter] = f; });
  const closedNote = `<div class="locked-banner" style="background:var(--danger-soft);color:var(--danger)">${icon('lock')} The ${type === 'kpi' ? 'KPI' : 'Appraisal'} filing window is currently <strong>closed by HR</strong>. You can view your form${type === 'kpi' ? 's' : ''} but can't start or edit one until HR opens it.</div>`;
  const openNote = `<div class="locked-banner approved-banner">${icon('unlock')} The filing window is <strong>open</strong> — you can start or edit your ${type === 'kpi' ? 'quarter' : 'appraisal'} form${type === 'kpi' ? 's' : ''} now.</div>`;

  if (type === 'appraisal') {
    const f = byQ.Q1 || mine[0] || null;
    return `<div style="margin-bottom:16px">${windowOpen ? openNote : closedNote}</div>
      <div class="asset-grid">${perfCard(type, 'Q1', f, windowOpen, 'Annual appraisal')}</div>`;
  }
  const cards = QUARTERS.map(q => perfCard(type, q, byQ[q], windowOpen, q)).join('');
  return `<div style="margin-bottom:16px">${windowOpen ? openNote : closedNote}</div>
    <div class="asset-grid">${cards}</div>`;
}

// A single form card with status + the right action (view / edit / start), window-gated.
function perfCard(type, quarter, f, windowOpen, label) {
  const status = f ? f.status : 'none';
  const route = `#/${type}?quarter=${quarter}&user_id=${State.me.id}`;
  let action, note = '';
  if (!f || status === 'none') {
    action = windowOpen
      ? `<a class="btn btn-primary btn-sm" href="${route}">${icon('plus', 'icon-sm')}Start form</a>`
      : `<button class="btn btn-sm" disabled>${icon('lock', 'icon-sm')}Start form</button>`;
    note = windowOpen ? 'Not started yet.' : 'Opens when HR opens the window.';
  } else if (status === 'approved') {
    action = `<a class="btn btn-sm" href="#/form/${f.id}">${icon('eye', 'icon-sm')}View</a>`;
    note = 'Approved &amp; locked. ' + (windowOpen && type === 'kpi' ? 'Start another quarter below.' : 'Completed for ' + FY + '.');
  } else if (status === 'in_review') {
    action = `<a class="btn btn-sm" href="#/form/${f.id}">${icon('eye', 'icon-sm')}View</a>`;
    note = esc(f.stage_label || 'In review — locked.');
  } else { // draft or sent_back
    action = windowOpen
      ? `<a class="btn btn-primary btn-sm" href="#/form/${f.id}">${icon('edit', 'icon-sm')}${status === 'sent_back' ? 'Revise &amp; resubmit' : 'Open &amp; edit'}</a>`
      : `<a class="btn btn-sm" href="#/form/${f.id}">${icon('eye', 'icon-sm')}View</a>`;
    note = status === 'sent_back' ? 'Sent back for revision.' : 'Draft in progress.';
  }
  return `<div class="card card-pad perf-card">
    <div class="perf-card-top">
      <div><div class="perf-q">${esc(type === 'appraisal' ? 'Appraisal' : label)}</div>
        <div class="muted">${type === 'kpi' ? 'Quarter ' + quarter : 'Financial year ' + FY}</div></div>
      ${f ? statusBadge(status) : `<span class="badge b-draft"><span class="dot"></span>Not started</span>`}
    </div>
    <div class="perf-card-foot">
      <span class="muted">${note}</span>
      ${action}
    </div>
  </div>`;
}

function perfTeamView(team) {
  if (!team.length) return `<div class="card"><div class="empty">${icon('users')}No team forms yet. When your reports submit, they'll appear here.</div></div>`;
  const awaiting = team.filter(f => f.status === 'in_review' && f.rights && f.rights.canApprove);
  return `${awaiting.length ? `<div class="sec-head"><h2>${icon('inbox', 'section-icon')}Awaiting your approval</h2>
      <span class="badge b-review"><span class="dot"></span>${awaiting.length} pending</span></div>${tableOfForms(awaiting, true)}` : ''}
    <div class="sec-head"><h2>${icon('users', 'section-icon')}All team forms</h2><span class="sec-line"></span></div>
    ${tableOfForms(team, false)}`;
}
function tableOfForms(forms, showAction) {
  return `<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>
    <th>Associate</th><th>Type</th><th>Quarter</th><th>Status</th><th>Location</th><th>Updated</th>${showAction ? '<th></th>' : ''}</tr></thead><tbody>
    ${forms.map(f => `<tr class="row-click" data-form="${f.id}">
      <td><strong>${esc(f.owner.name)}</strong><br><span class="muted">${esc(f.owner.designation)}</span></td>
      <td>${f.type.toUpperCase()}</td><td>${f.quarter}</td><td>${statusBadge(f.status)}</td>
      <td class="muted">${esc(f.stage_label)}</td><td class="muted">${fmtDate(f.updated_at)}</td>
      ${showAction ? `<td><a class="btn btn-sm btn-primary" href="#/form/${f.id}">Review</a></td>` : ''}</tr>`).join('')}
  </tbody></table></div></div>`;
}
function bindFormRows() { view().querySelectorAll('[data-form]').forEach(r => r.onclick = e => { if (!e.target.closest('a')) location.hash = '#/form/' + r.dataset.form; }); }

async function renderDirectory() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { users } = await api('/directory');
  const byId = {}; users.forEach(u => byId[u.id] = u);
  setView(`<div class="page"><div class="page-head"><div><div class="crumb">People</div><h1>Team directory</h1>
    <p>${users.length} associates across Justwords</p></div>
    <input id="dirSearch" placeholder="Search name, role, department…" style="padding:9px 13px;border:1px solid var(--border-strong);border-radius:8px;background:var(--surface);color:var(--text);min-width:260px"></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Designation</th><th>Department</th><th>Reports to</th><th>Role</th><th></th></tr></thead>
    <tbody id="dirBody">${dirRows(users, byId)}</tbody></table></div></div></div>`);
  const bindDM = () => view().querySelectorAll('[data-dm]').forEach(b => b.onclick = async () => {
    try { const { id } = await api('/chat/dm', { method: 'POST', body: { user_id: b.dataset.dm } }); location.hash = '#/chat/' + id; }
    catch (ex) { toast(ex.message, 'err'); }
  });
  bindDM();
  document.getElementById('dirSearch').oninput = e => {
    const q = e.target.value.toLowerCase();
    const filtered = users.filter(u => (u.name + ' ' + u.designation + ' ' + u.department + ' ' + roleLabel(u.role)).toLowerCase().includes(q));
    document.getElementById('dirBody').innerHTML = dirRows(filtered, byId);
    bindDM();
  };
}
function dirRows(users, byId) {
  return users.map(u => `<tr><td><div style="display:flex;align-items:center;gap:10px">${avatarHTML(u, 30)}<strong>${esc(u.name)}</strong></div></td>
    <td>${esc(u.designation)}</td><td>${esc(u.department || '')}</td><td class="muted">${u.manager_id && byId[u.manager_id] ? esc(byId[u.manager_id].name) : '—'}</td>
    <td><span class="badge b-open"><span class="dot"></span>${roleLabel(u.role)}</span></td>
    <td>${u.id !== State.me.id ? `<button class="btn btn-sm btn-ghost" data-dm="${u.id}" title="Send a message">${icon('chat', 'icon-sm')}</button>` : ''}</td></tr>`).join('');
}

// =====================================================================
//  CONTENT PAGES
// =====================================================================
async function renderPage(slug) {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { page } = await api('/pages/' + slug);
  const canEdit = State.me.role === 'hr_admin';
  setView(`<div class="page" style="max-width:820px">
    <div class="page-head"><div><div class="crumb">${esc((page.section || '').toUpperCase())}</div><h1>${esc(page.title)}</h1>
    <p class="muted">Last updated ${fmtDate(page.updated_at)}</p></div>
    ${canEdit ? `<button class="btn" id="editPage">${icon('edit', 'icon-sm')}Edit page</button>` : ''}</div>
    <div class="card card-pad"><div class="prose" id="pageBody">${page.body ? esc(page.body).replace(/\n/g, '<br>') : '<span class="muted">No content yet.</span>'}</div></div>
    <div class="card"><div class="card-head"><span class="card-title">${icon('file', 'section-icon')}Documents</span>
      ${canEdit ? `<button class="btn btn-sm" id="attachBtn">${icon('plus', 'icon-sm')}Attach file</button><input type="file" id="attachInput" style="display:none">` : ''}</div>
      <div class="card-pad">${(page.files && page.files.length) ? `<div class="pill-row" style="flex-direction:column;align-items:stretch">${page.files.map(f => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid var(--border);border-radius:9px">
          <a href="/uploads/${esc(f.filename)}" target="_blank" style="display:flex;align-items:center;gap:9px">${icon('file', 'icon-sm')}${esc(f.original)}</a>
          <span class="muted" style="font-size:12px">${fmtDate(f.created_at)}${canEdit ? ` · <button class="btn btn-sm btn-ghost" data-delfile="${f.id}" style="color:var(--danger)">Remove</button>` : ''}</span>
        </div>`).join('')}</div>` : `<span class="muted">No documents attached${canEdit ? ' yet — use “Attach file” to add the real document.' : '.'}</span>`}</div>
    </div>
  </div>`);
  if (canEdit) {
    const ainput = document.getElementById('attachInput');
    document.getElementById('attachBtn').onclick = () => ainput.click();
    ainput.onchange = async () => {
      const file = ainput.files[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      try { const r = await fetch('/api/pages/' + slug + '/files', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error); toast('File attached', 'ok'); renderPage(slug); }
      catch (ex) { toast(ex.message, 'err'); }
    };
    view().querySelectorAll('[data-delfile]').forEach(b => b.onclick = async () => { await api('/pages/' + slug + '/files/' + b.dataset.delfile, { method: 'DELETE' }); renderPage(slug); });
  }
  if (canEdit) document.getElementById('editPage').onclick = () => {
    modal('Edit — ' + page.title, `<div class="field"><label>Title</label><input id="pgTitle" value="${esc(page.title)}"></div>
      <div class="field"><label>Body</label><textarea id="pgBody" rows="12">${esc(page.body || '')}</textarea></div>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="savePage">Save</button>`);
    document.getElementById('savePage').onclick = async () => {
      try { await api('/pages/' + slug, { method: 'PUT', body: { title: pgTitle.value, body: pgBody.value } }); closeModal(); toast('Page updated', 'ok'); renderPage(slug); }
      catch (ex) { toast(ex.message, 'err'); }
    };
  };
}

// =====================================================================
//  LEAVE
// =====================================================================
// =====================================================================
//  EMPLOYEE REFERRALS  (refer a candidate for an open vacancy)
// =====================================================================
const REFERRAL_STATES = { submitted: ['b-draft', 'Submitted'], reviewing: ['b-review', 'Reviewing'], shortlisted: ['b-review', 'Shortlisted'], hired: ['b-approved', 'Hired'], closed: ['b-sentback', 'Closed'] };
function refBadge(s) { const [c, l] = REFERRAL_STATES[s] || ['b-draft', s]; return `<span class="badge ${c}"><span class="dot"></span>${esc(l)}</span>`; }

async function renderReferrals() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const me = State.me;
  const isHRv = isAdminLevel(me);
  let referrals = [], vacancies = [];
  try { ([{ referrals }, { vacancies }] = await Promise.all([api('/referrals'), api('/vacancies')])); }
  catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }
  const open = vacancies.filter(v => v.status === 'open');

  const openHTML = open.length ? open.map(v => `<div class="card card-pad">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div><div class="card-title">${esc(v.title)}</div>
          <div class="muted" style="margin-top:4px">${esc([v.department, v.location, v.type].filter(Boolean).join(' · '))}</div></div>
        <button class="btn btn-sm btn-primary" data-refer="${v.id}" data-title="${esc(v.title)}">${icon('plus', 'icon-sm')}Refer</button>
      </div>
      ${v.description ? `<div class="prose" style="font-size:13px;margin-top:8px">${esc(v.description)}</div>` : ''}
    </div>`).join('') : `<div class="card"><div class="empty">${icon('brief')}No open vacancies right now. You can still refer for a general role below.</div></div>`;

  const rowsHTML = referrals.length ? referrals.map(r => `<tr>
      <td><strong>${esc(r.candidate_name)}</strong>${r.candidate_email ? `<div class="muted">${esc(r.candidate_email)}</div>` : ''}</td>
      <td>${esc(r.vacancy_title || 'General')}</td>
      ${isHRv ? `<td>${esc(r.referrer || '')}</td>` : ''}
      <td>${refBadge(r.status)}</td>
      <td class="muted">${fmtDate(r.created_at)}</td>
      ${isHRv ? `<td><button class="btn btn-sm" data-manage="${r.id}">Update</button></td>` : ''}
    </tr>`).join('') : `<tr><td colspan="${isHRv ? 6 : 4}"><div class="empty" style="padding:18px">${icon('users')}No referrals yet.</div></td></tr>`;

  setView(`<div class="page">
    <div class="page-head"><div><div class="crumb">HR Desk</div><h1>Employee Referrals</h1>
      <p>Know someone great? Refer them for an open role. HR is notified${isHRv ? '' : ' and will keep you posted'}.</p></div>
      <button class="btn btn-primary" id="referGeneral">${icon('plus', 'icon-sm')}Refer a candidate</button></div>
    <div class="sec-head"><h2>${icon('brief', 'section-icon')}Open vacancies</h2><span class="sec-line"></span></div>
    <div class="grid grid-2">${openHTML}</div>
    <div class="sec-head"><h2>${icon('users', 'section-icon')}${isHRv ? 'All referrals' : 'My referrals'}</h2><span class="sec-line"></span></div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>
      <th>Candidate</th><th>Role</th>${isHRv ? '<th>Referred by</th>' : ''}<th>Status</th><th>Submitted</th>${isHRv ? '<th></th>' : ''}
    </tr></thead><tbody>${rowsHTML}</tbody></table></div></div>
  </div>`);

  const openForm = (vacancyId, title) => {
    const opts = `<option value="">General / future role</option>` + open.map(v => `<option value="${v.id}" ${String(v.id) === String(vacancyId) ? 'selected' : ''}>${esc(v.title)}</option>`).join('');
    modal('Refer a candidate', `
      <div class="field"><label>Vacancy</label><select id="rfVac">${opts}</select></div>
      <div class="grid grid-2">
        <div class="field"><label>Candidate name <span style="color:var(--danger)">*</span></label><input id="rfName" placeholder="Full name"></div>
        <div class="field"><label>How do you know them?</label><input id="rfRel" placeholder="Ex-colleague, friend…"></div>
        <div class="field"><label>Email</label><input id="rfEmail" type="email" placeholder="name@email.com"></div>
        <div class="field"><label>Phone</label><input id="rfPhone" placeholder="Optional"></div>
      </div>
      <div class="field"><label>Why are they a good fit?</label><textarea id="rfNotes" rows="3" placeholder="A line or two helps HR a lot…"></textarea></div>
      <div class="field"><label>Résumé (optional)</label><input type="file" id="rfResume"><span class="muted" id="rfResumeName"></span></div>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="rfSave">${icon('send', 'icon-sm')}Submit referral</button>`);
    let resume = null;
    document.getElementById('rfResume').onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      try { const res = await fetch('/api/upload', { method: 'POST', body: fd }); const j = await res.json(); if (!res.ok) throw new Error(j.error);
        resume = { file: j.filename, name: j.original }; document.getElementById('rfResumeName').textContent = ' ✓ ' + j.original; }
      catch (ex) { toast(ex.message, 'err'); }
    };
    document.getElementById('rfSave').onclick = async () => {
      const name = document.getElementById('rfName').value.trim();
      if (!name) { toast("Enter the candidate's name", 'err'); return; }
      try {
        await api('/referrals', { method: 'POST', body: {
          vacancy_id: document.getElementById('rfVac').value || null, candidate_name: name,
          candidate_email: document.getElementById('rfEmail').value, candidate_phone: document.getElementById('rfPhone').value,
          relationship: document.getElementById('rfRel').value, notes: document.getElementById('rfNotes').value,
          resume_file: resume ? resume.file : null, resume_name: resume ? resume.name : null } });
        closeModal(); toast('Referral submitted — thank you!', 'ok'); renderReferrals();
      } catch (ex) { toast(ex.message, 'err'); }
    };
  };
  document.getElementById('referGeneral').onclick = () => openForm('', '');
  view().querySelectorAll('[data-refer]').forEach(b => b.onclick = () => openForm(b.dataset.refer, b.dataset.title));

  if (isHRv) {
    const byId = {}; referrals.forEach(r => byId[r.id] = r);
    view().querySelectorAll('[data-manage]').forEach(b => b.onclick = () => {
      const r = byId[b.dataset.manage];
      modal('Update referral — ' + esc(r.candidate_name), `
        <div class="field"><label>Status</label><select id="rfStatus">
          ${Object.keys(REFERRAL_STATES).map(s => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${REFERRAL_STATES[s][1]}</option>`).join('')}</select></div>
        <div class="field"><label>Note (optional)</label><textarea id="rfHrNote" rows="3">${esc(r.hr_note || '')}</textarea></div>
        ${r.resume_file ? `<a class="btn btn-sm" href="/uploads/${esc(r.resume_file)}" target="_blank">${icon('file', 'icon-sm')}View résumé</a>` : '<span class="muted">No résumé attached.</span>'}`,
        `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="rfUpd">Save</button>`);
      document.getElementById('rfUpd').onclick = async () => {
        try { await api('/referrals/' + r.id, { method: 'POST', body: { status: document.getElementById('rfStatus').value, hr_note: document.getElementById('rfHrNote').value } });
          closeModal(); toast('Referral updated', 'ok'); renderReferrals(); }
        catch (ex) { toast(ex.message, 'err'); }
      };
    });
  }
}

// =====================================================================
//  REIMBURSEMENTS  (claim → manager approval → HR)
// =====================================================================
const REIMB_STATES = { pending: ['b-review', 'Pending approval'], approved: ['b-approved', 'Approved'], rejected: ['b-sentback', 'Rejected'], reimbursed: ['b-approved', 'Reimbursed'] };
function reimbBadge(s) { const [c, l] = REIMB_STATES[s] || ['b-draft', s]; return `<span class="badge ${c}"><span class="dot"></span>${esc(l)}</span>`; }

async function renderReimbursements() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const me = State.me;
  const canDecideAny = isAdminLevel(me) || canSeeTeam(me);
  let items = [];
  try { ({ reimbursements: items } = await api('/reimbursements')); }
  catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }
  const mine = items.filter(r => r.user_id === me.id);
  const toDecide = items.filter(r => r.user_id !== me.id && r.status === 'pending' && (r.manager_id === me.id || isAdminLevel(me)));
  const others = items.filter(r => r.user_id !== me.id && !toDecide.includes(r));

  const row = (r, withOwner, withActions) => `<tr>
    ${withOwner ? `<td><strong>${esc(r.name)}</strong></td>` : ''}
    <td>${esc(r.title)}<div class="muted">${esc(r.category || '')}${r.spent_on ? ' · ' + esc(r.spent_on) : ''}</div></td>
    <td class="asset-tag"><strong>${esc(r.currency || 'INR')} ${esc(r.amount)}</strong></td>
    <td>${reimbBadge(r.status)}</td>
    <td class="muted">${r.receipt_file ? `<a href="/uploads/${esc(r.receipt_file)}" target="_blank">${icon('file', 'icon-sm')}Receipt</a>` : '—'}</td>
    <td class="muted">${fmtDate(r.created_at)}</td>
    ${withActions ? `<td style="white-space:nowrap">${r.status === 'pending' && r.user_id !== me.id
      ? `<button class="btn btn-sm btn-success" data-appr="${r.id}">Approve</button> <button class="btn btn-sm btn-danger" data-rej="${r.id}">Reject</button>`
      : (isAdminLevel(me) && r.status === 'approved' ? `<button class="btn btn-sm" data-reimb="${r.id}">Mark reimbursed</button>` : '')}</td>` : ''}
  </tr>`;

  const section = (title, list, withOwner, withActions, emptyMsg) => `
    <div class="sec-head"><h2>${icon(withActions ? 'inbox' : 'file', 'section-icon')}${title}</h2>${list.length ? `<span class="badge b-review"><span class="dot"></span>${list.length}</span>` : '<span class="sec-line"></span>'}</div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>
      ${withOwner ? '<th>Who</th>' : ''}<th>Claim</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Submitted</th>${withActions ? '<th></th>' : ''}
    </tr></thead><tbody>${list.length ? list.map(r => row(r, withOwner, withActions)).join('') : `<tr><td colspan="8"><div class="empty" style="padding:16px">${esc(emptyMsg)}</div></td></tr>`}</tbody></table></div></div>`;

  setView(`<div class="page">
    <div class="page-head"><div><div class="crumb">HR Desk</div><h1>Reimbursements</h1>
      <p>Submit an expense claim. It goes to your reporting manager for approval, with HR kept in the loop.</p></div>
      <button class="btn btn-primary" id="newReimb">${icon('plus', 'icon-sm')}New claim</button></div>
    ${canDecideAny ? section('Awaiting your approval', toDecide, true, true, 'Nothing awaiting your approval.') : ''}
    ${section('My claims', mine, false, false, 'No claims yet — submit your first one.')}
    ${canDecideAny && others.length ? section('Team claims', others, true, true, '') : ''}
  </div>`);

  document.getElementById('newReimb').onclick = () => {
    modal('New reimbursement claim', `
      <div class="grid grid-2">
        <div class="field"><label>Title <span style="color:var(--danger)">*</span></label><input id="rbTitle" placeholder="e.g. Client lunch"></div>
        <div class="field"><label>Category</label><select id="rbCat"><option>Travel</option><option>Meals</option><option>Software / Tools</option><option>Office supplies</option><option>Training</option><option>General</option></select></div>
        <div class="field"><label>Amount <span style="color:var(--danger)">*</span></label><input id="rbAmt" type="number" min="0" step="0.01" placeholder="0.00"></div>
        <div class="field"><label>Currency</label><select id="rbCur"><option>INR</option><option>USD</option><option>GBP</option><option>EUR</option></select></div>
        <div class="field"><label>Spent on</label><input id="rbDate" type="date"></div>
      </div>
      <div class="field"><label>Description</label><textarea id="rbDesc" rows="3" placeholder="What was this for?"></textarea></div>
      <div class="field"><label>Receipt (optional)</label><input type="file" id="rbReceipt"><span class="muted" id="rbReceiptName"></span></div>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="rbSave">${icon('send', 'icon-sm')}Submit claim</button>`);
    let receipt = null;
    document.getElementById('rbReceipt').onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      try { const res = await fetch('/api/upload', { method: 'POST', body: fd }); const j = await res.json(); if (!res.ok) throw new Error(j.error);
        receipt = { file: j.filename, name: j.original }; document.getElementById('rbReceiptName').textContent = ' ✓ ' + j.original; }
      catch (ex) { toast(ex.message, 'err'); }
    };
    document.getElementById('rbSave').onclick = async () => {
      const title = document.getElementById('rbTitle').value.trim();
      const amount = document.getElementById('rbAmt').value;
      if (!title) { toast('Add a short title', 'err'); return; }
      if (!amount || Number(amount) <= 0) { toast('Enter a valid amount', 'err'); return; }
      try {
        await api('/reimbursements', { method: 'POST', body: {
          title, amount, category: document.getElementById('rbCat').value, currency: document.getElementById('rbCur').value,
          spent_on: document.getElementById('rbDate').value, description: document.getElementById('rbDesc').value,
          receipt_file: receipt ? receipt.file : null, receipt_name: receipt ? receipt.name : null } });
        closeModal(); toast('Claim submitted for approval', 'ok'); renderReimbursements();
      } catch (ex) { toast(ex.message, 'err'); }
    };
  };
  const decide = async (id, status) => {
    let note = '';
    if (status === 'rejected') { note = prompt('Reason for rejection (optional):') || ''; }
    try { await api('/reimbursements/' + id + '/decide', { method: 'POST', body: { status, note } }); toast('Claim ' + status, 'ok'); renderReimbursements(); }
    catch (ex) { toast(ex.message, 'err'); }
  };
  view().querySelectorAll('[data-appr]').forEach(b => b.onclick = () => decide(b.dataset.appr, 'approved'));
  view().querySelectorAll('[data-rej]').forEach(b => b.onclick = () => decide(b.dataset.rej, 'rejected'));
  view().querySelectorAll('[data-reimb]').forEach(b => b.onclick = () => decide(b.dataset.reimb, 'reimbursed'));
}

// =====================================================================
//  VACANCIES
// =====================================================================
async function renderVacancies() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { vacancies } = await api('/vacancies');
  const canPost = ['hr', 'hr_admin'].includes(State.me.role);
  setView(`<div class="page"><div class="page-head"><div><div class="crumb">HR Desk</div><h1>Vacancies</h1>
    <p>Open positions across Justwords — refer great people.</p></div>${canPost ? `<button class="btn btn-primary" id="postVac">${icon('plus', 'icon-sm')}Post vacancy</button>` : ''}</div>
    <div class="grid grid-2">${vacancies.length ? vacancies.map(v => `<div class="card card-pad">
      <div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="card-title">${esc(v.title)}</div>
      <span class="badge ${v.status === 'open' ? 'b-approved' : 'b-draft'}"><span class="dot"></span>${v.status}</span></div>
      <div class="muted" style="margin:6px 0 10px">${esc(v.department || '')} · ${esc(v.location || '')} · ${esc(v.type || '')}</div>
      <div class="prose" style="font-size:13.5px">${esc(v.description || '')}</div>
      ${canPost && v.status === 'open' ? `<button class="btn btn-sm" data-close-vac="${v.id}" style="margin-top:12px">Close</button>` : ''}</div>`).join('')
      : `<div class="card"><div class="empty">${icon('brief')}No open vacancies.</div></div>`}</div></div>`);
  const pv = document.getElementById('postVac');
  if (pv) pv.onclick = () => {
    modal('Post a vacancy', `<div class="field"><label>Title</label><input id="vT"></div>
      <div class="grid grid-2"><div class="field"><label>Department</label><input id="vD"></div><div class="field"><label>Location</label><input id="vL"></div></div>
      <div class="field"><label>Type</label><input id="vTy" value="Full-time"></div>
      <div class="field"><label>Description</label><textarea id="vDesc" rows="4"></textarea></div>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="vSave">Post</button>`);
    document.getElementById('vSave').onclick = async () => {
      try { await api('/vacancies', { method: 'POST', body: { title: vT.value, department: vD.value, location: vL.value, type: vTy.value, description: vDesc.value } }); closeModal(); toast('Vacancy posted', 'ok'); renderVacancies(); }
      catch (ex) { toast(ex.message, 'err'); }
    };
  };
  view().querySelectorAll('[data-close-vac]').forEach(b => b.onclick = async () => { await api('/vacancies/' + b.dataset.closeVac + '/close', { method: 'POST' }); renderVacancies(); });
}

// =====================================================================
//  SUGGESTION BOX  +  HR INBOX
// =====================================================================
const SUGGESTION_CATS = ['General', 'Workplace', 'Process / Tools', 'Culture', 'Facilities', 'Grievance'];
const SG_CAT_ICON = { General: 'bulb', Workplace: 'building', 'Process / Tools': 'settings', Culture: 'smile', Facilities: 'box', Grievance: 'shield' };

function renderSuggestions() {
  renderShell(`<div class="page" style="max-width:680px">
    <div class="page-head"><div><div class="crumb">Your voice</div><h1>Suggestion box</h1>
    <p>Share an idea, a concern or honest feedback — anonymously if you choose.</p></div></div>
    <div class="card card-pad" id="sgCard"><form id="sgForm">
      <div class="field"><label>What is this about?</label>
        <div class="sg-cats" id="sgCats">${SUGGESTION_CATS.map((c, i) => `<label class="sg-cat"><input type="radio" name="sgCat" value="${esc(c)}" ${i === 0 ? 'checked' : ''}>${icon(SG_CAT_ICON[c] || 'bulb', 'icon-sm')}<span>${esc(c)}</span></label>`).join('')}</div>
      </div>
      <div class="field"><label>Subject</label><input id="sgSubj" placeholder="A short headline" maxlength="120"></div>
      <div class="field"><label>Your message <span style="color:var(--danger)">*</span></label><textarea id="sgMsg" rows="5" placeholder="What's on your mind — the more specific, the better." required></textarea></div>
      <label class="check sg-anon"><input type="checkbox" id="sgAnon"> <span><strong>Submit anonymously</strong><br><span class="muted">Your name won't be attached — it will show as “Anonymous”.</span></span></label>
      <div style="margin-top:18px"><button class="btn btn-primary" type="submit">${icon('send', 'icon-sm')}Send suggestion</button></div>
    </form></div></div>`);
  document.getElementById('sgForm').onsubmit = async e => {
    e.preventDefault();
    const cat = (document.querySelector('input[name="sgCat"]:checked') || {}).value || 'General';
    const msg = document.getElementById('sgMsg').value.trim();
    if (!msg) { toast('Please write your message', 'err'); return; }
    try {
      await api('/suggestions', { method: 'POST', body: { category: cat, subject: document.getElementById('sgSubj').value, message: msg, anonymous: document.getElementById('sgAnon').checked } });
      document.getElementById('sgCard').innerHTML = `<div class="empty" style="padding:40px 16px">${icon('check')}
        <h3 style="margin:10px 0 4px">Thank you — your suggestion has been submitted.</h3>
        <p class="muted">Every submission is read and taken seriously.</p>
        <button class="btn" id="sgAgain" style="margin-top:14px">${icon('plus', 'icon-sm')}Submit another</button></div>`;
      document.getElementById('sgAgain').onclick = renderSuggestions;
    } catch (ex) { toast(ex.message, 'err'); }
  };
}

let SG_FILTER = 'all';
async function renderHRSuggestions() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { suggestions } = await api('/suggestions');
  const counts = { all: suggestions.length, open: 0, reviewing: 0, closed: 0 };
  suggestions.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
  const list = suggestions.filter(s => SG_FILTER === 'all' || s.status === SG_FILTER);
  const seg = (k, label) => `<button class="seg-btn ${SG_FILTER === k ? 'active' : ''}" data-filter="${k}">${label} <span class="seg-count">${counts[k] || 0}</span></button>`;

  const card = (s) => `<div class="card card-pad sg-inbox-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <span class="badge b-open"><span class="dot"></span>${icon(SG_CAT_ICON[s.category] || 'bulb', 'icon-sm')} ${esc(s.category)}</span>
        <span class="badge ${s.status === 'closed' ? 'b-approved' : s.status === 'reviewing' ? 'b-review' : 'b-draft'}"><span class="dot"></span>${esc(s.status)}</span></div>
      <div class="card-title" style="margin:10px 0 4px">${esc(s.subject || '(no subject)')}</div>
      <div class="prose" style="font-size:13.5px;white-space:pre-wrap">${esc(s.message)}</div>
      <div class="muted" style="margin-top:10px">— ${esc(s.author || 'Anonymous')} · ${fmtDate(s.created_at)}</div>
      ${s.hr_note ? `<div class="mc-item" style="margin-top:10px"><span class="mc-avatar">${icon('pen', 'icon-sm')}</span><div><div class="mc-by">HR note</div><div class="mc-text">${esc(s.hr_note)}</div></div></div>` : ''}
      <div class="toolbar" style="margin-top:12px">
        ${s.status !== 'reviewing' ? `<button class="btn btn-sm" data-rev="${s.id}">${icon('clock', 'icon-sm')}Reviewing</button>` : ''}
        <button class="btn btn-sm" data-note="${s.id}">${icon('pen', 'icon-sm')}${s.hr_note ? 'Edit note' : 'Add note'}</button>
        ${s.status !== 'closed' ? `<button class="btn btn-sm btn-success" data-cls="${s.id}">${icon('check', 'icon-sm')}Close</button>` : `<button class="btn btn-sm" data-reopen="${s.id}">Reopen</button>`}
      </div></div>`;

  setView(`<div class="page"><div class="page-head"><div><div class="crumb">HR</div><h1>Suggestion inbox</h1>
    <p>${suggestions.length} submission${suggestions.length === 1 ? '' : 's'} from associates</p></div></div>
    <div class="seg" id="sgFilters" style="margin-bottom:18px">${seg('all', 'All')}${seg('open', 'Open')}${seg('reviewing', 'Reviewing')}${seg('closed', 'Closed')}</div>
    ${list.length ? `<div class="grid grid-2">${list.map(card).join('')}</div>` : `<div class="card"><div class="empty">${icon('bulb')}Nothing here under this filter.</div></div>`}
  </div>`);

  const byId = {}; suggestions.forEach(s => byId[s.id] = s);
  const setStatus = async (id, status, hr_note) => {
    const s = byId[id];
    await api('/suggestions/' + id, { method: 'POST', body: { status, hr_note: hr_note != null ? hr_note : (s.hr_note || '') } });
    renderHRSuggestions();
  };
  view().querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { SG_FILTER = b.dataset.filter; renderHRSuggestions(); });
  view().querySelectorAll('[data-rev]').forEach(b => b.onclick = () => setStatus(b.dataset.rev, 'reviewing'));
  view().querySelectorAll('[data-cls]').forEach(b => b.onclick = () => setStatus(b.dataset.cls, 'closed'));
  view().querySelectorAll('[data-reopen]').forEach(b => b.onclick = () => setStatus(b.dataset.reopen, 'open'));
  view().querySelectorAll('[data-note]').forEach(b => b.onclick = () => {
    const s = byId[b.dataset.note];
    modal('HR note — ' + esc(s.subject || s.category), `<div class="field"><label>Internal note (visible to HR &amp; leadership)</label>
      <textarea id="sgNote" rows="4">${esc(s.hr_note || '')}</textarea></div>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="sgNoteSave">Save note</button>`);
    document.getElementById('sgNoteSave').onclick = async () => {
      await setStatus(s.id, s.status === 'open' ? 'reviewing' : s.status, document.getElementById('sgNote').value);
      closeModal();
    };
  });
}

// =====================================================================
//  HR ADMIN CONSOLE
// =====================================================================
async function renderAdmin() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const { totals, byDept, formStatus, recent } = await api('/admin/stats');
  const stat = (lbl, val, foot) => `<div class="stat"><div class="lbl">${lbl}</div><div class="val">${val}</div>${foot ? `<div class="foot">${foot}</div>` : ''}</div>`;
  setView(`<div class="page"><div class="page-head"><div><div class="crumb">HR Admin</div><h1>Admin console</h1>
    <p>Usage and workforce overview · Justwords Associates' Portal</p></div></div>
    <div class="grid grid-4">
      ${stat('Associates', totals.employees)}
      ${stat('Managers', totals.managers)}
      ${stat('Pending password reset', totals.pending_reset)}
      ${stat('Open suggestions', totals.open_suggestions)}
    </div>
    <div class="grid grid-4" style="margin-top:18px">
      ${stat('KPI forms', totals.kpi_forms)}
      ${stat('In review', totals.in_review)}
      ${stat('Open referrals', totals.open_referrals)}
      ${stat('Pending reimbursements', totals.pending_reimb)}
    </div>
    <div class="grid grid-2" style="margin-top:18px">
      <div class="card"><div class="card-head"><span class="card-title">${icon('users', 'section-icon')}Headcount by department</span></div>
        <div class="card-pad">${byDept.map(d => barRow(d.department, d.c, byDept[0].c)).join('')}</div></div>
      <div class="card"><div class="card-head"><span class="card-title">${icon('layers', 'section-icon')}Form status breakdown</span></div>
        <div class="card-pad">${formStatus.length ? formStatus.map(s => barRow(labelStatus(s.status), s.c, Math.max(...formStatus.map(x => x.c)))).join('') : '<span class="muted">No forms yet.</span>'}</div></div>
    </div>
    <div class="card" style="margin-top:18px"><div class="card-head"><span class="card-title">${icon('clock', 'section-icon')}Recent activity</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Who</th><th>Action</th><th>Form</th><th>When</th></tr></thead>
      <tbody>${recent.length ? recent.map(r => `<tr><td>${esc(r.actor)}</td><td>${actionLabel(r.action)}</td><td>${r.type.toUpperCase()} · ${r.quarter}</td><td class="muted">${fmtDate(r.at)}</td></tr>`).join('') : '<tr><td colspan="4" class="muted" style="padding:16px">No activity yet.</td></tr>'}</tbody></table></div></div>
    <div class="card card-pad" style="margin-top:18px"><div class="card-title" style="margin-bottom:8px">${icon('info', 'section-icon')}HR Admin capabilities</div>
      <p class="muted">As HR Admin you can edit About Us / HR Desk / SOP content pages, manage vacancies & referrals, approve reimbursements, review the full suggestion inbox, and view every associate's KPI and appraisal forms across the org.</p></div>
  </div>`);
}
function barRow(label, val, max) {
  const pct = max ? Math.round((val / max) * 100) : 0;
  return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>${esc(label)}</span><strong>${val}</strong></div>
    <div style="height:8px;background:var(--surface-3);border-radius:6px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--accent);border-radius:6px"></div></div></div>`;
}
function labelStatus(s) { return ({ draft: 'Draft', in_review: 'In review', approved: 'Approved', sent_back: 'Sent back' }[s] || s); }

// =====================================================================
//  PROFILE
// =====================================================================
function renderProfile() {
  const me = State.me;
  renderShell(`<div class="page" style="max-width:640px"><div class="page-head"><div><div class="crumb">Account</div><h1>My profile</h1></div></div>
    <div class="card card-pad" style="display:flex;gap:18px;align-items:center">
      <div style="position:relative">${avatarHTML(me, 68)}
        <button class="icon-btn" id="avatarBtn" title="Change photo" style="position:absolute;right:-6px;bottom:-6px;width:28px;height:28px;background:var(--surface);border:1px solid var(--border);border-radius:50%">${icon('camera', 'icon-sm')}</button>
        <input type="file" id="avatarInput" accept="image/*" style="display:none"></div>
      <div><div style="font-size:20px;font-weight:700">${esc(me.name)}</div><div class="muted">${esc(me.designation)} · ${esc(me.department || '')}</div>
      <div style="margin-top:6px" class="pill-row"><span class="badge b-open"><span class="dot"></span>${roleLabel(me.role)}</span><span class="badge b-draft"><span class="dot"></span>${esc(me.ecode || '')}</span></div></div>
    </div>
    <div class="card card-pad"><div class="kpi-info">
      <div class="field"><label>Email</label><input value="${esc(me.email)}" readonly></div>
      <div class="field"><label>Employee code</label><input value="${esc(me.ecode || '')}" readonly></div>
      <div class="field"><label>Department</label><input value="${esc(me.department || '')}" readonly></div>
      <div class="field"><label>Role</label><input value="${roleLabel(me.role)}" readonly></div>
    </div>
    <div style="margin-top:16px"><a class="btn" href="#/password">${icon('key', 'icon-sm')}Change password</a></div></div>
  </div>`);
  const ai = document.getElementById('avatarInput');
  document.getElementById('avatarBtn').onclick = () => ai.click();
  ai.onchange = async () => {
    const file = ai.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const r = await fetch('/api/avatar', { method: 'POST', body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      State.me.avatar = j.avatar; toast('Photo updated', 'ok'); renderProfile();
    } catch (ex) { toast(ex.message, 'err'); }
  };
}

// =====================================================================
//  CHAT  (Slack-style channels + direct messages)
// =====================================================================
const ChatState = { channelId: null, lastMsgId: 0, poll: null };
function clearChatPoll() { if (ChatState.poll) { clearInterval(ChatState.poll); ChatState.poll = null; } }
function fmtTime(s) { if (!s) return ''; const d = new Date(s.endsWith && !s.endsWith('Z') ? s.replace(' ', 'T') + 'Z' : s); return isNaN(d) ? '' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
function fmtDayTime(s) { if (!s) return ''; const d = new Date(s.replace ? s.replace(' ', 'T') + 'Z' : s); if (isNaN(d)) return ''; const today = new Date().toDateString() === d.toDateString(); return today ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

function chatSideItem(c, active) {
  const cls = 'chat-chan' + (active ? ' active' : '') + (c.unread ? ' has-unread' : '');
  const glyph = c.is_dm ? avatarHTML(c.other, 26)
    : c.is_group ? `<span class="chan-hash">${icon('users', 'icon-sm')}</span>`
    : `<span class="chan-hash">${icon('hash', 'icon-sm')}</span>`;
  return `<a class="${cls}" href="#/chat/${c.id}" data-chan="${c.id}">
    ${glyph}<span class="chan-name">${esc(c.name)}</span>
    ${c.unread ? `<span class="chan-unread">${c.unread > 9 ? '9+' : c.unread}</span>` : ''}</a>`;
}

async function renderChat(channelId) {
  clearChatPoll();
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading messages…</div></div>`);
  let ov;
  try { ov = await api('/chat/overview'); } catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }
  const cid = channelId ? Number(channelId) : (ov.channels[0] ? ov.channels[0].id : (ov.dms[0] ? ov.dms[0].id : null));

  const groups = ov.groups || [];
  const sideHTML = `
    <div class="chat-side">
      <div class="chat-side-head">
        <span>${icon('chat', 'section-icon')}Messages</span>
      </div>
      <div class="chat-group-head">Channels</div>
      <div class="chat-list">${ov.channels.length ? ov.channels.map(c => chatSideItem(c, c.id === cid)).join('') : '<div class="muted" style="padding:6px 14px">No channels</div>'}</div>
      <div class="chat-group-head">Group chats <button class="chat-add" id="newGroup" title="Create a group chat">${icon('plus', 'icon-sm')}</button></div>
      <div class="chat-list">${groups.length ? groups.map(c => chatSideItem(c, c.id === cid)).join('') : '<div class="muted" style="padding:6px 14px">No groups yet</div>'}</div>
      <div class="chat-group-head">Direct messages <button class="chat-add" id="newDM" title="Start a direct message">${icon('plus', 'icon-sm')}</button></div>
      <div class="chat-list">${ov.dms.length ? ov.dms.map(c => chatSideItem(c, c.id === cid)).join('') : '<div class="muted" style="padding:6px 14px">No conversations yet</div>'}</div>
    </div>`;

  setView(`<div class="chat-wrap">${sideHTML}<div class="chat-main" id="chatMain"></div></div>`);
  document.getElementById('newGroup').onclick = newGroupModal;
  document.getElementById('newDM').onclick = newDMModal;

  if (cid) openChannel(cid);
  else document.getElementById('chatMain').innerHTML = `<div class="chat-empty">${icon('chat')}<h3>Welcome to Messages</h3><p>Pick a channel on the left, create one, or start a direct message with a teammate.</p></div>`;
}

function msgHTML(m) {
  const mine = m.user_id === State.me.id;
  return `<div class="msg${mine ? ' mine' : ''}">
    ${avatarHTML({ name: m.name, avatar: m.avatar }, 38)}
    <div class="msg-body">
      <div class="msg-head"><span class="msg-name">${esc(m.name)}</span><span class="msg-time">${fmtDayTime(m.created_at)}</span></div>
      <div class="msg-text">${esc(m.body).replace(/\n/g, '<br>')}</div>
    </div></div>`;
}

async function openChannel(id) {
  ChatState.channelId = id; ChatState.lastMsgId = 0;
  const main = document.getElementById('chatMain');
  if (!main) return;
  main.innerHTML = `<div class="empty" style="margin:auto">${icon('clock')}Loading…</div>`;
  let ch;
  try { ch = (await api('/chat/channels/' + id)).channel; }
  catch (ex) { main.innerHTML = `<div class="chat-empty">${icon('info')}<h3>${esc(ex.message)}</h3></div>`; return; }

  const title = ch.is_dm
    ? `${avatarHTML(ch.other, 30)}<span>${esc(ch.name)}</span><span class="muted" style="font-weight:500">${esc(ch.topic || '')}</span>`
    : ch.is_group
      ? `<span class="chan-hash big">${icon('users', 'icon-sm')}</span><span>${esc(ch.name)}</span><span class="muted" style="font-weight:500">${ch.member_count || 0} member${ch.member_count === 1 ? '' : 's'}${ch.topic ? ' · ' + esc(ch.topic) : ''}</span>`
      : `<span class="chan-hash big">${icon('hash', 'icon-sm')}</span><span>${esc(ch.name)}</span><span class="muted" style="font-weight:500">${esc(ch.topic || '')}</span>`;

  main.innerHTML = `
    <div class="chat-head">${title}</div>
    <div class="chat-msgs" id="chatMsgs"></div>
    <div class="chat-composer">
      <textarea id="chatInput" rows="1" placeholder="Message ${ch.is_dm ? esc(ch.name) : '#' + esc(ch.name)}…"></textarea>
      <button class="btn btn-primary" id="chatSend">${icon('send', 'icon-sm')}Send</button>
    </div>`;

  const { messages } = await api('/chat/channels/' + id + '/messages?after=0');
  const box = document.getElementById('chatMsgs');
  box.innerHTML = messages.length ? messages.map(msgHTML).join('') : `<div class="chat-empty">${icon('smile')}<h3>No messages yet</h3><p>Say hello — this is the very beginning of the conversation.</p></div>`;
  ChatState.lastMsgId = messages.length ? messages[messages.length - 1].id : 0;
  box.scrollTop = box.scrollHeight;
  api('/chat/channels/' + id + '/read', { method: 'POST' }).then(refreshChatBadge).catch(() => {});

  const ta = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const doSend = async () => {
    const body = ta.value.trim(); if (!body) return;
    ta.value = ''; ta.style.height = 'auto';
    try { await api('/chat/channels/' + id + '/messages', { method: 'POST', body: { body } }); await pollMessages(true); }
    catch (ex) { toast(ex.message, 'err'); ta.value = body; }
  };
  send.onclick = doSend;
  ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; });
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
  ta.focus();

  clearChatPoll();
  ChatState.poll = setInterval(() => pollMessages(false), 4000);
}

async function pollMessages(forceScroll) {
  if (!ChatState.channelId) return;
  let messages;
  try { ({ messages } = await api('/chat/channels/' + ChatState.channelId + '/messages?after=' + ChatState.lastMsgId)); }
  catch (_) { return; }
  if (!messages.length) return;
  const box = document.getElementById('chatMsgs');
  if (!box) return;
  const first = box.querySelector('.chat-empty'); if (first) box.innerHTML = '';
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 140;
  box.insertAdjacentHTML('beforeend', messages.map(msgHTML).join(''));
  ChatState.lastMsgId = messages[messages.length - 1].id;
  if (forceScroll || nearBottom) box.scrollTop = box.scrollHeight;
  // if someone else sent, update read + sidebar count
  if (messages.some(m => m.user_id !== State.me.id)) {
    api('/chat/channels/' + ChatState.channelId + '/read', { method: 'POST' }).then(refreshChatBadge).catch(() => {});
    const chip = document.querySelector(`[data-chan="${ChatState.channelId}"] .chan-unread`);
    if (chip) chip.remove();
  }
}

async function newGroupModal() {
  modal('New group chat', `
    <div class="field"><label>Group name</label><input id="grName" placeholder="e.g. Content Pod" maxlength="60"></div>
    <div class="field"><label>Add people</label><input id="grSearch" placeholder="Search teammates…" autocomplete="off"></div>
    <div id="grSelected" class="gr-selected"></div>
    <div id="grList" class="dm-picker"><div class="muted" style="padding:10px">Loading…</div></div>
    <p class="muted">A group chat is private to the people you add. You're included automatically.</p>`,
    `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="grCreate">${icon('users', 'icon-sm')}Create group</button>`);
  const { users } = await api('/directory');
  const others = users.filter(u => u.id !== State.me.id);
  const picked = new Map();
  const renderPicked = () => {
    document.getElementById('grSelected').innerHTML = picked.size
      ? [...picked.values()].map(u => `<span class="gr-chip">${esc(u.name.split(' ')[0])}<button data-unpick="${u.id}" aria-label="Remove">${icon('x', 'icon-sm')}</button></span>`).join('')
      : '<span class="muted" style="font-size:12px">No one added yet.</span>';
    document.querySelectorAll('[data-unpick]').forEach(b => b.onclick = () => { picked.delete(Number(b.dataset.unpick)); renderPicked(); paint(filterList()); });
  };
  const filterList = () => {
    const q = (document.getElementById('grSearch').value || '').toLowerCase();
    return others.filter(u => !picked.has(u.id) && (u.name + ' ' + (u.designation || '') + ' ' + (u.department || '')).toLowerCase().includes(q));
  };
  const paint = (list) => {
    document.getElementById('grList').innerHTML = list.length ? list.map(u => `<button class="dm-pick" data-uid="${u.id}">
      ${avatarHTML(u, 32)}<span><span class="dm-nm">${esc(u.name)}</span><span class="dm-rl">${esc(u.designation || '')}</span></span></button>`).join('')
      : `<div class="muted" style="padding:10px">No matches</div>`;
    document.querySelectorAll('#grList .dm-pick').forEach(b => b.onclick = () => {
      const u = others.find(x => x.id === Number(b.dataset.uid)); if (u) picked.set(u.id, u);
      renderPicked(); paint(filterList());
    });
  };
  renderPicked(); paint(others);
  document.getElementById('grSearch').oninput = () => paint(filterList());
  document.getElementById('grCreate').onclick = async () => {
    const name = document.getElementById('grName').value.trim();
    if (!name) { toast('Give the group a name', 'err'); return; }
    if (!picked.size) { toast('Add at least one person', 'err'); return; }
    try { const { id } = await api('/chat/groups', { method: 'POST', body: { name, member_ids: [...picked.keys()] } }); closeModal(); location.hash = '#/chat/' + id; }
    catch (ex) { toast(ex.message, 'err'); }
  };
}

async function newDMModal() {
  modal('New direct message', `<div class="field"><input id="dmSearch" placeholder="Search teammates…" autocomplete="off"></div>
    <div id="dmList" class="dm-picker"><div class="muted" style="padding:10px">Loading…</div></div>`,
    `<button class="btn" data-close>Cancel</button>`);
  const { users } = await api('/directory');
  const others = users.filter(u => u.id !== State.me.id);
  const paint = (list) => {
    document.getElementById('dmList').innerHTML = list.length ? list.map(u => `<button class="dm-pick" data-uid="${u.id}">
      ${avatarHTML(u, 32)}<span><span class="dm-nm">${esc(u.name)}</span><span class="dm-rl">${esc(u.designation || '')}</span></span></button>`).join('')
      : `<div class="muted" style="padding:10px">No matches</div>`;
    document.querySelectorAll('.dm-pick').forEach(b => b.onclick = async () => {
      try { const { id } = await api('/chat/dm', { method: 'POST', body: { user_id: b.dataset.uid } }); closeModal(); location.hash = '#/chat/' + id; }
      catch (ex) { toast(ex.message, 'err'); }
    });
  };
  paint(others);
  document.getElementById('dmSearch').oninput = e => {
    const q = e.target.value.toLowerCase();
    paint(others.filter(u => (u.name + ' ' + u.designation + ' ' + u.department).toLowerCase().includes(q)));
  };
  document.getElementById('dmSearch').focus();
}

// =====================================================================
//  HR — FORM WINDOWS (open / close KPI & Appraisal)
// =====================================================================
async function renderFormWindows() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  const fy = 'FY2026-27';
  let data, users;
  try {
    data = await api('/form-windows?fy=' + fy);
    ({ users } = await api('/directory'));
  } catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }

  const windowCard = (type, w) => {
    const open = w.is_open;
    return `<div class="card card-pad wnd-card">
      <div class="wnd-top">
        <div><div class="card-title">${icon(type === 'kpi' ? 'chart' : 'target', 'section-icon')}${type === 'kpi' ? 'KPI Incentive Plan' : 'Appraisal — Objectives'}</div>
          <div class="muted" style="margin-top:4px">${fy} · Company-wide filing window</div></div>
        <span class="badge ${open ? 'b-approved' : 'b-sentback'}"><span class="dot"></span>${open ? 'Open' : 'Closed'}</span>
      </div>
      <label class="switch-row">
        <span class="switch"><input type="checkbox" data-wtype="${type}" ${open ? 'checked' : ''}><span class="slider"></span></span>
        <span>${open ? 'Everyone can fill and submit their ' + type.toUpperCase() : 'Filing is closed — associates can\'t edit or submit'}</span>
      </label>
      <p class="muted" style="margin-top:8px">Toggle any number of times. A per-person setting below always overrides this company-wide switch.</p>
    </div>`;
  };

  const overridesHTML = data.overrides.length ? `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Associate</th><th>Form</th><th>State</th><th>Set</th><th></th></tr></thead><tbody>
    ${data.overrides.map(o => `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">${avatarHTML(o, 28)}<div><strong>${esc(o.name)}</strong><br><span class="muted">${esc(o.designation || '')}</span></div></div></td>
      <td>${o.type.toUpperCase()}</td>
      <td><span class="badge ${o.is_open ? 'b-approved' : 'b-sentback'}"><span class="dot"></span>${o.is_open ? 'Open' : 'Closed'}</span></td>
      <td class="muted">${fmtDate(o.updated_at)}</td>
      <td><button class="btn btn-sm btn-ghost" data-rmov="${o.id}" style="color:var(--danger)">Remove</button></td></tr>`).join('')}
  </tbody></table></div>` : `<div class="empty" style="padding:28px">${icon('users')}No per-person overrides. Everyone follows the company-wide switches above.</div>`;

  setView(`<div class="page">
    <div class="page-head"><div><div class="crumb">HR Control</div><h1>Form windows</h1>
      <p>Open or close the KPI and Appraisal filing windows for everyone — or for one specific person. When a window is closed, associates can view but not edit or submit.</p></div></div>
    <div class="grid grid-2">${windowCard('kpi', data.kpi)}${windowCard('appraisal', data.appraisal)}</div>
    <div class="card" style="margin-top:18px"><div class="card-head">
      <span class="card-title">${icon('user', 'section-icon')}Per-person overrides</span>
      <button class="btn btn-sm btn-primary" id="addOverride">${icon('plus', 'icon-sm')}Add override</button></div>
      <div class="card-pad">${overridesHTML}</div>
    </div></div>`);

  view().querySelectorAll('[data-wtype]').forEach(cb => cb.onchange = async () => {
    try { await api('/form-windows', { method: 'POST', body: { type: cb.dataset.wtype, fy, is_open: cb.checked } });
      toast(`${cb.dataset.wtype.toUpperCase()} window ${cb.checked ? 'opened' : 'closed'}`, 'ok'); renderFormWindows(); }
    catch (ex) { toast(ex.message, 'err'); renderFormWindows(); }
  });
  view().querySelectorAll('[data-rmov]').forEach(b => b.onclick = async () => {
    try { await api('/form-windows/user/' + b.dataset.rmov, { method: 'DELETE' }); toast('Override removed', 'ok'); renderFormWindows(); }
    catch (ex) { toast(ex.message, 'err'); }
  });
  document.getElementById('addOverride').onclick = () => {
    const opts = users.map(u => `<option value="${u.id}">${esc(u.name)} — ${esc(u.designation || '')}</option>`).join('');
    modal('Add a per-person override', `
      <div class="field"><label>Associate</label><select id="ovUser">${opts}</select></div>
      <div class="field"><label>Form</label><select id="ovType"><option value="kpi">KPI Incentive Plan</option><option value="appraisal">Appraisal</option></select></div>
      <div class="field"><label>State</label><select id="ovOpen"><option value="1">Open — allow this person to fill</option><option value="0">Closed — block this person</option></select></div>
      <p class="muted">This overrides the company-wide switch for the selected person only.</p>`,
      `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="ovSave">Save override</button>`);
    document.getElementById('ovSave').onclick = async () => {
      try {
        await api('/form-windows/user', { method: 'POST', body: { user_id: document.getElementById('ovUser').value, type: document.getElementById('ovType').value, fy, is_open: document.getElementById('ovOpen').value === '1' } });
        closeModal(); toast('Override saved', 'ok'); renderFormWindows();
      } catch (ex) { toast(ex.message, 'err'); }
    };
  };
}

// =====================================================================
//  ASSET TRACKING TOOL  (register + audit)
// =====================================================================
function canEditAssets(me) { return !!me && ['hr', 'hr_admin', 'director', 'ceo'].includes(me.role); }
const OWN_LABEL = { rent: 'Rental', acquisition: 'Acquisition' };
const ASSET_CATS = {
  electronic: ['Laptop', 'Desktop', 'CPU', 'UPS', 'Mouse', 'Keyboard', 'Monitor', 'Hard Drive', 'SSD', 'Projector', 'TV', 'Wifi Router', 'Access Points - Leaseline', 'Biometric Machine', 'Telephones', 'Headphones', 'Camera'],
  physical: ['Storage', 'Chairs', 'Fan', 'Boards', 'Table', 'Projector Screen', 'Keys', 'Phone Sims', 'Tripod'],
};

// The asset modal is re-rendered on class / ownership change so the right fields show.
function assetFormBody(a = {}) {
  const cls = a.asset_class === 'physical' ? 'physical' : 'electronic';
  const rent = a.ownership === 'rent';
  const catOpts = `<option value="">Select…</option>` + ASSET_CATS[cls].map(c => `<option ${a.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')
    + (a.category && !ASSET_CATS[cls].includes(a.category) ? `<option selected>${esc(a.category)}</option>` : '');
  const classSeg = `<div class="seg seg-soft" id="as_classSeg">
      <button type="button" class="seg-btn ${cls === 'electronic' ? 'active' : ''}" data-aclass="electronic">${icon('settings', 'icon-sm')}Electronic</button>
      <button type="button" class="seg-btn ${cls === 'physical' ? 'active' : ''}" data-aclass="physical">${icon('box', 'icon-sm')}Physical</button>
    </div>`;

  const electronicFields = `
      <div class="field"><label>Brand</label><input id="as_brand" value="${esc(a.brand || '')}" placeholder="Dell, HP, Apple…"></div>
      <div class="field"><label>Configuration</label><input id="as_configuration" value="${esc(a.configuration || '')}" placeholder="i5 / 16GB / 512GB SSD"></div>
      <div class="field"><label>Service Tag no.</label><input id="as_service_tag" value="${esc(a.service_tag || '')}" placeholder="Serial / service tag"></div>
      <div class="field"><label>Laptop Agreement</label><input id="as_laptop_agreement" value="${esc(a.laptop_agreement || '')}" placeholder="Signed / N/A"></div>
      <div class="field"><label>Issued to</label><input id="as_issued_to" value="${esc(a.issued_to || '')}" placeholder="Associate / team"></div>
      <div class="field"><label>Date of Issuance</label><input type="date" id="as_issued_on" value="${esc(a.issued_on || '')}"></div>
      <div class="field"><label>Rental / Acquisition</label><select id="as_ownership">
        <option value="acquisition" ${rent ? '' : 'selected'}>Acquisition</option>
        <option value="rent" ${rent ? 'selected' : ''}>Rental</option></select></div>
      <div class="field" id="as_ownNumWrap">${rent
        ? `<label>Vendor's Name</label><input id="as_vendor_name" value="${esc(a.vendor_name || '')}" placeholder="Rental vendor">`
        : `<label>JW Asset No.</label><input id="as_jw_asset_no" value="${esc(a.jw_asset_no || '')}" placeholder="JW-0001">`}</div>
      <div class="field"><label>Date of Return</label><input type="date" id="as_date_of_return" value="${esc(a.date_of_return || '')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Any comments</label><textarea id="as_notes" rows="2">${esc(a.notes || '')}</textarea></div>`;

  const physicalFields = `
      <div class="field"><label>Brand / make <span class="muted">(optional)</span></label><input id="as_brand" value="${esc(a.brand || '')}" placeholder="Optional"></div>
      <div class="field"><label>Specification <span class="muted">(optional)</span></label><input id="as_configuration" value="${esc(a.configuration || '')}" placeholder="Size, colour, model…"></div>
      <div class="field"><label>Issued to / location</label><input id="as_issued_to" value="${esc(a.issued_to || '')}" placeholder="Associate / room"></div>
      <div class="field"><label>Date of Issuance</label><input type="date" id="as_issued_on" value="${esc(a.issued_on || '')}"></div>
      <div class="field" style="grid-column:1/-1"><label>Any comments</label><textarea id="as_notes" rows="2">${esc(a.notes || '')}</textarea></div>`;

  return `
    <input type="hidden" id="as_asset_class" value="${cls}">
    <div class="field"><label>Asset type</label>${classSeg}</div>
    <div class="asset-grid">
      <div class="field"><label>Category</label><select id="as_category">${catOpts}</select></div>
      ${cls === 'electronic' ? electronicFields : physicalFields}
    </div>`;
}
// Re-render the modal body in place when the class or ownership changes, preserving
// whatever the user has typed so far.
function wireAssetForm() {
  const reopen = (patch) => {
    const a = Object.assign(readAssetForm(), patch);
    const body = document.querySelector('.modal-body'); if (!body) return;
    body.innerHTML = assetFormBody(a);
    wireAssetForm();
  };
  document.querySelectorAll('[data-aclass]').forEach(b => b.onclick = () => {
    const next = b.dataset.aclass;
    const cur = readAssetForm();
    // dropping into the other class clears the category if it doesn't belong there
    if (!ASSET_CATS[next].includes(cur.category)) cur.category = '';
    reopen({ asset_class: next, category: cur.category });
  });
  const own = document.getElementById('as_ownership');
  if (own) own.onchange = () => reopen({ ownership: own.value });
}
function readAssetForm() {
  const g = id => (document.getElementById(id) || {}).value || '';
  return {
    asset_class: g('as_asset_class'), category: g('as_category'), brand: g('as_brand'),
    configuration: g('as_configuration'), service_tag: g('as_service_tag'), laptop_agreement: g('as_laptop_agreement'),
    ownership: g('as_ownership') || 'acquisition', vendor_name: g('as_vendor_name'), jw_asset_no: g('as_jw_asset_no'),
    issued_to: g('as_issued_to'), issued_on: g('as_issued_on'), date_of_return: g('as_date_of_return'), notes: g('as_notes'),
  };
}

async function renderAssets() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  let assets = [];
  try { ({ assets } = await api('/assets')); }
  catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }
  const canEdit = canEditAssets(State.me);
  const electronic = assets.filter(a => (a.asset_class || 'electronic') !== 'physical');
  const physical = assets.filter(a => a.asset_class === 'physical');

  const actionsCell = (a) => canEdit ? `<td style="white-space:nowrap">
      <button class="icon-btn btn-sm" data-edit="${a.id}" title="Edit">${icon('edit', 'icon-sm')}</button>
      <button class="icon-btn btn-sm" data-del="${a.id}" title="Delete" style="color:var(--danger)">${icon('trash', 'icon-sm')}</button></td>` : '';

  const ownCell = (a) => `<span class="pill-own ${a.ownership === 'rent' ? 'rent' : 'acq'}">${OWN_LABEL[a.ownership] || 'Acquisition'}</span>`;
  const idCell = (a) => a.ownership === 'rent' ? (a.vendor_name ? 'Vendor: ' + esc(a.vendor_name) : '—') : `<strong>${esc(a.jw_asset_no || '—')}</strong>`;

  const elecTable = `<div class="tbl-wrap"><table class="tbl"><thead><tr>
      <th>Category</th><th>Brand</th><th>Configuration</th><th>Service Tag</th><th>Issued to</th><th>Ownership</th><th>JW no. / Vendor</th><th>Return</th>${canEdit ? '<th></th>' : ''}
    </tr></thead><tbody>${electronic.length ? electronic.map(a => `<tr data-asset="${a.id}">
      <td><strong>${esc(a.category || '—')}</strong></td>
      <td>${esc(a.brand || '—')}</td>
      <td class="muted">${esc(a.configuration || a.specification || '—')}</td>
      <td class="asset-tag">${esc(a.service_tag || a.identity_no || '—')}</td>
      <td>${esc(a.issued_to || '—')}<div class="muted">${a.issued_on ? fmtDay(a.issued_on) : ''}</div></td>
      <td>${ownCell(a)}</td>
      <td class="asset-tag">${idCell(a)}</td>
      <td class="muted">${a.date_of_return ? fmtDay(a.date_of_return) : '—'}</td>
      ${actionsCell(a)}
    </tr>`).join('') : `<tr><td colspan="${canEdit ? 9 : 8}"><div class="empty">${icon('settings')}No electronic assets yet.</div></td></tr>`}</tbody></table></div>`;

  const physTable = `<div class="tbl-wrap"><table class="tbl"><thead><tr>
      <th>Category</th><th>Brand / make</th><th>Specification</th><th>Issued to / location</th><th>Issued on</th><th>Comments</th>${canEdit ? '<th></th>' : ''}
    </tr></thead><tbody>${physical.length ? physical.map(a => `<tr data-asset="${a.id}">
      <td><strong>${esc(a.category || '—')}</strong></td>
      <td>${esc(a.brand || '—')}</td>
      <td class="muted">${esc(a.configuration || a.specification || '—')}</td>
      <td>${esc(a.issued_to || '—')}</td>
      <td class="muted">${a.issued_on ? fmtDay(a.issued_on) : '—'}</td>
      <td class="muted">${esc(a.notes || '')}</td>
      ${actionsCell(a)}
    </tr>`).join('') : `<tr><td colspan="${canEdit ? 7 : 6}"><div class="empty">${icon('box')}No physical assets yet.</div></td></tr>`}</tbody></table></div>`;

  setView(`<div class="page">
    <div class="page-head"><div><div class="crumb">Asset Tracking Tool</div><h1>Asset Register</h1>
      <p>Every Justwords asset — split into electronic and physical — what it is, who holds it, and how it's owned.</p></div>
      ${canEdit ? `<button class="btn btn-primary" id="addAsset">${icon('plus', 'icon-sm')}Add asset</button>` : ''}</div>
    <div class="card"><div class="card-head"><span class="card-title">${icon('settings', 'section-icon')}Electronic assets</span><span class="muted">${electronic.length}</span></div>${elecTable}</div>
    <div class="card" style="margin-top:18px"><div class="card-head"><span class="card-title">${icon('box', 'section-icon')}Physical assets</span><span class="muted">${physical.length}</span></div>${physTable}</div>
  </div>`);

  if (canEdit) {
    const openForm = (a) => {
      modal(a ? 'Edit asset' : 'Add asset', assetFormBody(a || { asset_class: 'electronic', ownership: 'acquisition' }),
        `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="saveAsset">${icon('send', 'icon-sm')}Save</button>`);
      wireAssetForm();
      document.getElementById('saveAsset').onclick = async () => {
        try {
          const body = readAssetForm();
          if (!body.category) { toast('Pick a category', 'err'); return; }
          if (a) await api('/assets/' + a.id, { method: 'PUT', body });
          else await api('/assets', { method: 'POST', body });
          closeModal(); toast('Asset saved', 'ok'); renderAssets();
        } catch (ex) { toast(ex.message, 'err'); }
      };
    };
    const byId = {}; assets.forEach(a => byId[a.id] = a);
    const addBtn = document.getElementById('addAsset'); if (addBtn) addBtn.onclick = () => openForm(null);
    view().querySelectorAll('[data-edit]').forEach(b => b.onclick = e => { e.stopPropagation(); openForm(byId[b.dataset.edit]); });
    view().querySelectorAll('[data-del]').forEach(b => b.onclick = async e => {
      e.stopPropagation();
      if (!confirm('Delete this asset and its audit history? This cannot be undone.')) return;
      try { await api('/assets/' + b.dataset.del, { method: 'DELETE' }); toast('Asset deleted', 'ok'); renderAssets(); }
      catch (ex) { toast(ex.message, 'err'); }
    });
  }
}

const AUDIT_VERDICT = {
  okay: { label: 'Okay', cls: 'v-okay', badge: 'b-approved' },
  partial: { label: 'Partial okay', cls: 'v-partial', badge: 'b-review' },
  not_okay: { label: 'Not okay', cls: 'v-notokay', badge: 'b-sentback' },
  none: { label: 'Not audited', cls: 'v-none', badge: 'b-draft' },
};
function verdictBadge(v) { const m = AUDIT_VERDICT[v] || AUDIT_VERDICT.none; return `<span class="badge ${m.badge}"><span class="dot"></span>${m.label}</span>`; }
let AUDIT_FILTER = null;   // null = show all; otherwise one of okay/partial/not_okay/none

async function renderAssetAudit() {
  renderShell(`<div class="page"><div class="empty">${icon('clock')}Loading…</div></div>`);
  let assets = [], audits = [];
  try { ([{ assets }, { audits }] = await Promise.all([api('/assets'), api('/asset-audits')])); }
  catch (ex) { setView(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}${esc(ex.message)}</div></div></div>`); return; }
  const canEdit = canEditAssets(State.me);

  // Latest audit per asset → each asset's current verdict.
  const latest = {};
  audits.forEach(a => { if (!latest[a.asset_id]) latest[a.asset_id] = a; }); // audits come newest-first
  const assetLabel = (a) => `${a.category || 'Asset'}${a.jw_asset_no ? ' · ' + a.jw_asset_no : (a.service_tag ? ' · ' + a.service_tag : '')}`;
  const verdictOf = (a) => (latest[a.id] && AUDIT_VERDICT[latest[a.id].status]) ? latest[a.id].status : 'none';

  // Counts for the chart.
  const counts = { okay: 0, partial: 0, not_okay: 0, none: 0 };
  assets.forEach(a => { counts[verdictOf(a)]++; });
  const total = assets.length || 1;
  const chartKeys = ['okay', 'partial', 'not_okay', 'none'];
  const chart = `<div class="audit-chart">
    ${chartKeys.map(k => {
      const pct = Math.round((counts[k] / total) * 100);
      const m = AUDIT_VERDICT[k];
      const active = AUDIT_FILTER === k;
      return `<button class="audit-bar ${m.cls} ${active ? 'active' : ''}" data-vfilter="${k}" title="Click to see these assets">
        <span class="ab-top"><span class="ab-label">${m.label}</span><span class="ab-count">${counts[k]}</span></span>
        <span class="ab-track"><span class="ab-fill" style="width:${pct}%"></span></span>
        <span class="ab-pct muted">${pct}%</span></button>`;
    }).join('')}
  </div>`;

  const shown = assets.filter(a => !AUDIT_FILTER || verdictOf(a) === AUDIT_FILTER);
  const assetRows = shown.length ? shown.map(a => {
    const v = verdictOf(a); const la = latest[a.id];
    return `<tr>
      <td><strong>${esc(a.category || '—')}</strong><div class="muted">${esc(a.jw_asset_no || a.service_tag || a.identity_no || '')}</div></td>
      <td>${esc(a.issued_to || '—')}</td>
      <td>${verdictBadge(v)}</td>
      <td class="muted">${la ? esc(la.belonging_to || '—') : '—'}</td>
      <td class="muted">${la && la.functional ? esc(la.functional) : '—'}</td>
      <td class="muted">${la ? fmtDay(la.audit_date) : 'Never'}</td>
      ${canEdit ? `<td><button class="btn btn-sm btn-primary" data-audit="${a.id}">${icon('shield', 'icon-sm')}Start audit</button></td>` : ''}
    </tr>`;
  }).join('') : `<tr><td colspan="${canEdit ? 7 : 6}"><div class="empty">${icon('box')}${AUDIT_FILTER ? 'No assets with this verdict.' : 'No assets to audit yet.'}</div></td></tr>`;

  const logRows = audits.length ? audits.slice(0, 60).map(a => `<tr>
      <td class="muted">${esc(fmtDay(a.audit_date))}</td>
      <td><strong>${esc(a.category || '—')}</strong><div class="muted asset-tag">${esc(a.jw_asset_no || a.identity_no || '')}</div></td>
      <td>${verdictBadge(AUDIT_VERDICT[a.status] ? a.status : 'none')}</td>
      <td class="muted">${esc(a.belonging_to || '—')}</td>
      <td class="muted">${esc(a.functional || '—')}</td>
      <td>${esc(a.remarks || '')}</td><td class="muted">${esc(a.audited_by_name || '')}</td>
    </tr>`).join('') : `<tr><td colspan="7"><div class="empty">${icon('file')}No audits recorded yet.</div></td></tr>`;

  setView(`<div class="page">
    <div class="page-head"><div><div class="crumb">Asset Tracking Tool</div><h1>Asset Audit</h1>
      <p>Audit status at a glance. Click a bar to see those assets, then start an audit to log where each one is, whether it works, and your verdict.</p></div></div>
    <div class="card"><div class="card-head"><span class="card-title">${icon('chart', 'section-icon')}Audit status overview</span>
      ${AUDIT_FILTER ? `<button class="btn btn-sm btn-ghost" id="clearVFilter">${icon('x', 'icon-sm')}Clear filter</button>` : `<span class="muted">${assets.length} asset${assets.length === 1 ? '' : 's'}</span>`}</div>
      <div class="card-pad">${chart}</div></div>
    <div class="card" style="margin-top:18px"><div class="card-head"><span class="card-title">${icon('box', 'section-icon')}Assets${AUDIT_FILTER ? ' · ' + AUDIT_VERDICT[AUDIT_FILTER].label : ''}</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr>
        <th>Asset</th><th>Issued to</th><th>Latest verdict</th><th>Current position / belonging to</th><th>Functional?</th><th>Last audited</th>${canEdit ? '<th></th>' : ''}
      </tr></thead><tbody>${assetRows}</tbody></table></div></div>
    <div class="card" style="margin-top:18px"><div class="card-head"><span class="card-title">${icon('clock', 'section-icon')}Audit history</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr>
        <th>Date</th><th>Asset</th><th>Verdict</th><th>Position / belonging to</th><th>Functional?</th><th>Notes</th><th>Audited by</th>
      </tr></thead><tbody>${logRows}</tbody></table></div></div>
  </div>`);

  view().querySelectorAll('[data-vfilter]').forEach(b => b.onclick = () => {
    AUDIT_FILTER = AUDIT_FILTER === b.dataset.vfilter ? null : b.dataset.vfilter;
    renderAssetAudit();
  });
  const clr = document.getElementById('clearVFilter'); if (clr) clr.onclick = () => { AUDIT_FILTER = null; renderAssetAudit(); };

  if (canEdit) {
    const byId = {}; assets.forEach(a => byId[a.id] = a);
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    view().querySelectorAll('[data-audit]').forEach(b => b.onclick = () => {
      const a = byId[b.dataset.audit];
      const la = latest[a.id];
      modal(`Start audit — ${esc(assetLabel(a))}`, `
        <div class="audit-asset-meta">
          <div><span class="muted">Category</span><strong>${esc(a.category || '—')}</strong></div>
          <div><span class="muted">${a.ownership === 'rent' ? 'Vendor' : 'JW Asset No.'}</span><strong>${esc(a.ownership === 'rent' ? (a.vendor_name || '—') : (a.jw_asset_no || '—'))}</strong></div>
          <div><span class="muted">Issued to</span><strong>${esc(a.issued_to || '—')}</strong></div>
          <div><span class="muted">Audit date</span><strong>${today} <span class="muted">(auto)</span></strong></div>
        </div>
        <div class="field" style="margin-top:14px"><label>Current position / belonging to</label>
          <input id="au_belong" value="${esc(la ? (la.belonging_to || '') : (a.issued_to || ''))}" placeholder="Where is it now / who holds it?"></div>
        <div class="field"><label>Functional?</label><select id="au_func">
          <option>Yes</option><option>Partially</option><option>No</option></select></div>
        <div class="field"><label>Verdict</label>
          <div class="seg seg-soft" id="au_verdict">
            <button type="button" class="seg-btn active" data-verdict="okay">${icon('check', 'icon-sm')}Okay</button>
            <button type="button" class="seg-btn" data-verdict="partial">Partial okay</button>
            <button type="button" class="seg-btn" data-verdict="not_okay">Not okay</button>
          </div></div>
        <div class="field"><label>Notes</label><textarea id="au_notes" rows="2" placeholder="Anything worth noting…"></textarea></div>`,
        `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" id="saveAudit">${icon('send', 'icon-sm')}Save audit</button>`);
      let verdict = 'okay';
      document.querySelectorAll('#au_verdict [data-verdict]').forEach(btn => btn.onclick = () => {
        verdict = btn.dataset.verdict;
        document.querySelectorAll('#au_verdict [data-verdict]').forEach(x => x.classList.toggle('active', x === btn));
      });
      document.getElementById('saveAudit').onclick = async () => {
        try {
          await api('/asset-audits', { method: 'POST', body: {
            asset_id: a.id, status: verdict,
            belonging_to: document.getElementById('au_belong').value,
            functional: document.getElementById('au_func').value,
            remarks: document.getElementById('au_notes').value } });
          closeModal(); toast('Audit recorded', 'ok'); renderAssetAudit();
        } catch (ex) { toast(ex.message, 'err'); }
      };
    });
  }
}

// =====================================================================
//  HOW TO USE — guided tour (tailored to the signed-in access level)
// =====================================================================
function guideSteps(me) {
  const level = accessLevel(me);
  const common = [
    { icon: 'home', title: 'Welcome to the Justwords Portal', body: `Hi ${esc(me.name.split(' ')[0])}! This quick tour shows what you can do here as <strong>${esc(accessLabel(me))}</strong>. Use the ← → buttons to move through it, or Skip any time.` },
    { icon: 'bell', title: 'Dashboard & announcements', body: 'Your home screen shows company news, the Training Centre, quick links and — for approvers — anything awaiting your action.' },
    { icon: 'grid', title: 'Tools, About & HR Desk', body: 'The top navigation groups everything: Tools & Access, About Us, the HR Desk (handbook, policies, vacancies, referrals & reimbursements) and SOP documents.' },
    { icon: 'chat', title: 'Messages & directory', body: 'Use Messages for internal chat, and the Team Directory to find any colleague and start a direct message.' },
  ];
  const perfSelf = { icon: 'chart', title: 'Performance → KPI & Appraisal', body: 'Open <strong>Performance</strong> and pick KPI or Appraisal. The <strong>Self</strong> tab holds your own forms. Fill a quarter, submit, and track it up the approval chain. A form only opens for editing while HR has the filing window open.' };
  const perfTeam = { icon: 'users', title: 'Performance → Team tab', body: 'Because people report to you, each Performance page also has a <strong>Team</strong> tab: review, comment on, approve or send back your team\'s KPI and appraisal forms. Your edits and comments are saved and shown to them.' };
  const newForm = { icon: 'plus', title: 'Starting another form', body: 'Once a form is approved it locks. When HR opens the next window, a <strong>Start form</strong> button appears on the Self tab so you can begin the next quarter.' };
  const assets = { icon: 'box', title: 'Asset Tracking Tool', body: 'Under <strong>Asset Tracking Tool</strong>: keep the Asset Register split into <strong>Electronic</strong> and <strong>Physical</strong> assets (brand, configuration, service tag, rental vs acquisition, issued-to), then use <strong>Asset Audit</strong> to start an audit — it logs the date automatically and your okay / partial / not-okay verdict, charted for a quick overview.' };
  const windows = { icon: 'toggle', title: 'Form windows (open/close)', body: 'From your profile menu → <strong>Form Windows</strong>, open or close KPI and Appraisal filing for everyone, or per person. Nobody can start or edit a form while its window is closed.' };
  const inbox = { icon: 'bulb', title: 'Suggestion inbox', body: 'The Suggestion Inbox collects feedback from associates (anonymous or named) for you to review and resolve.' };
  const console_ = { icon: 'settings', title: 'HR Admin Console', body: 'The HR Admin Console gives usage stats, content-page editing and a full org-wide view of every KPI and appraisal.' };

  if (level === 'associate') {
    const steps = [...common, perfSelf];
    if (me.is_manager) steps.push(perfTeam);
    steps.push(newForm);
    return steps;
  }
  if (level === 'hr') {
    return [...common, perfSelf, perfTeam, newForm, windows, inbox, assets, console_];
  }
  // super_admin
  return [
    ...common, perfSelf, perfTeam, newForm, windows, inbox, assets, console_,
    { icon: 'shield', title: 'You are a Super Admin', body: 'As Super Admin (Payel & Amlan) you have full control: everything HR can do, plus the HR Admin Console and the final approval on every form.' },
  ];
}

let GuideIdx = 0;
function startGuide() {
  GuideIdx = 0;
  renderGuide();
}
function renderGuide() {
  const steps = guideSteps(State.me);
  const i = Math.max(0, Math.min(GuideIdx, steps.length - 1));
  const s = steps[i];
  const dots = steps.map((_, k) => `<span class="g-dot ${k === i ? 'on' : ''}"></span>`).join('');
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-bg" data-close><div class="modal guide-modal">
    <div class="guide-body">
      <div class="guide-icon">${icon(s.icon)}</div>
      <div class="guide-step">Step ${i + 1} of ${steps.length}</div>
      <h3>${s.title}</h3>
      <p>${s.body}</p>
      <div class="guide-dots">${dots}</div>
    </div>
    <div class="modal-foot guide-foot">
      <button class="btn btn-ghost" data-close>Skip</button>
      <div style="display:flex;gap:8px">
        <button class="btn" id="gPrev" ${i === 0 ? 'disabled' : ''}>${icon('arrow', 'icon-sm')}Back</button>
        <button class="btn btn-primary" id="gNext">${i === steps.length - 1 ? icon('check', 'icon-sm') + 'Done' : 'Next' + icon('arrow', 'icon-sm')}</button>
      </div>
    </div>
  </div></div>`;
  wireClose(root);
  document.getElementById('gPrev').onclick = () => { GuideIdx = i - 1; renderGuide(); };
  document.getElementById('gNext').onclick = () => { if (i === steps.length - 1) closeModal(); else { GuideIdx = i + 1; renderGuide(); } };
}

// =====================================================================
//  ROUTER
// =====================================================================
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/dashboard';
  const [path, qs] = raw.split('?');
  const params = {};
  if (qs) qs.split('&').forEach(kv => { const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { path, params };
}

async function route() {
  // ensure session
  if (!State.me) {
    try { const { user } = await api('/me'); State.me = user; }
    catch (_) { renderLogin(); return; }
  }
  const { path, params } = parseHash();
  if (State.me.must_reset && path !== '/password') { location.hash = '#/password'; return; }
  if (!path.startsWith('/chat')) clearChatPoll();

  try {
    if (path === '/login') { if (State.me) { location.hash = '#/dashboard'; return; } renderLogin(); return; }
    if (path === '/password') return renderPassword();
    if (path === '/dashboard' || path === '/') return renderDashboard();
    if (path === '/performance/kpi') return renderPerformance('kpi', params);
    if (path === '/performance/appraisal') return renderPerformance('appraisal', params);
    if (path === '/performance') return renderPerformance('kpi', params);
    if (path === '/kpi') return renderForm('kpi', params);
    if (path === '/appraisal') return renderForm('appraisal', params);
    if (path.startsWith('/form/')) return loadFormById(path.split('/')[2]);
    if (path === '/inbox') return renderInbox();
    if (path === '/team') return renderTeam();
    if (path === '/assets') return renderAssets();
    if (path === '/asset-audit') return renderAssetAudit();
    if (path === '/directory') return renderDirectory();
    if (path.startsWith('/page/')) return renderPage(path.split('/')[2]);
    if (path === '/vacancies') return renderVacancies();
    if (path === '/referrals') return renderReferrals();
    if (path === '/reimbursements') return renderReimbursements();
    if (path === '/suggestions') return renderSuggestions();
    if (path === '/hr/suggestions') return renderHRSuggestions();
    if (path === '/hr/windows') return renderFormWindows();
    if (path === '/chat') return renderChat(null);
    if (path.startsWith('/chat/')) return renderChat(path.split('/')[2]);
    if (path === '/admin') return renderAdmin();
    if (path === '/profile') return renderProfile();
    renderDashboard();
  } catch (ex) {
    renderShell(`<div class="page"><div class="card card-pad"><div class="empty">${icon('info')}<strong>${esc(ex.message)}</strong><br><a href="#/dashboard">Back to dashboard</a></div></div></div>`);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

// =====================================================================
//  MEOW — a tiny ginger cat that strolls by with a kind word.
//  Appears now and then, ambles across the screen, then vanishes.
//  Try it any time from the console:  meow()
// =====================================================================
const JW_CAT_LINES = [
  "hey, you're working hard — keep it up!",
  "it's okay to step out sometimes 🌿",
  "you've got this, one task at a time",
  "psst… drink some water 💧",
  "great things take time — breathe",
  "you're doing better than you think!",
  "stretch those shoulders, superstar ✨",
  "small steps count too 🐾",
  "take a little break, you earned it",
  "proud of you today 💛",
  "deep breath… now carry on 🐱",
  "be kind to yourself, okay?",
];

const JW_CAT_SVG = `
<svg class="jw-cat" viewBox="0 0 74 74" aria-hidden="true">
  <path class="tail" d="M19 52 C 1 55 -6 39 5 28 C 9 37 15 44 22 48 Z" fill="#e08a43"/>
  <ellipse cx="37" cy="54" rx="20" ry="17" fill="#ef9d5a"/>
  <ellipse cx="37" cy="58" rx="11" ry="11" fill="#fbe9d2"/>
  <ellipse class="paw-l" cx="27" cy="70" rx="6" ry="5" fill="#fbe9d2"/>
  <ellipse class="paw-r" cx="47" cy="70" rx="6" ry="5" fill="#fbe9d2"/>
  <circle cx="37" cy="30" r="21" fill="#ef9d5a"/>
  <polygon points="17,18 22,1 35,12" fill="#ef9d5a"/>
  <polygon points="57,18 52,1 39,12" fill="#ef9d5a"/>
  <polygon points="21,14 24,5 30,12" fill="#f2a9b8"/>
  <polygon points="53,14 50,5 44,12" fill="#f2a9b8"/>
  <path d="M28 13 q9 -4 18 0" stroke="#e08a43" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M30 19 q7 -3 14 0" stroke="#e08a43" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>
  <circle cx="24" cy="35" r="4" fill="#f2a9b8" opacity=".55"/>
  <circle cx="50" cy="35" r="4" fill="#f2a9b8" opacity=".55"/>
  <path class="eye" d="M25 30 q5 5 10 0" stroke="#4a3320" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path class="eye" d="M39 30 q5 5 10 0" stroke="#4a3320" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <polygon points="34,37 40,37 37,40.5" fill="#e07a92"/>
  <path d="M37 40.5 q-3 3 -6 2" stroke="#4a3320" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M37 40.5 q3 3 6 2" stroke="#4a3320" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M11 33 L23 35 M11 38 L23 39" stroke="#4a3320" stroke-width=".9" opacity=".45" stroke-linecap="round"/>
  <path d="M63 33 L51 35 M63 38 L51 39" stroke="#4a3320" stroke-width=".9" opacity=".45" stroke-linecap="round"/>
</svg>`;

function jwSpawnCat() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('.jw-cat-run')) return;          // one cat at a time
  if (document.hidden) return;                                 // not on hidden tabs
  if (!State.me || location.hash.includes('login')) return;    // only inside the portal

  const msg = JW_CAT_LINES[Math.floor(Math.random() * JW_CAT_LINES.length)];
  const rtl = Math.random() < 0.5;
  const dur = (8.5 + Math.random() * 3.5).toFixed(1) + 's';

  const el = document.createElement('div');
  el.className = 'jw-cat-run' + (rtl ? ' rtl' : '');
  el.style.setProperty('--cat-dur', dur);
  el.innerHTML =
    `<div class="jw-cat-bubble">${esc(msg)}</div>` +
    `<div class="jw-cat-spark">✦</div>` +
    `<div class="jw-cat-hop">${JW_CAT_SVG}</div>`;
  document.body.appendChild(el);

  el.addEventListener('animationend', e => {
    if (e.animationName && e.animationName.indexOf('jw-cat-cross') === 0) el.remove();
  });
  // hard safety cleanup
  setTimeout(() => el.remove(), 15000);
}
window.meow = jwSpawnCat;   // manual trigger for fun

function jwScheduleCat() {
  const next = 60000 + Math.random() * 90000;   // every ~1–2.5 min
  setTimeout(() => { jwSpawnCat(); jwScheduleCat(); }, next);
}
window.addEventListener('load', () => {
  setTimeout(jwSpawnCat, 6500);   // a friendly hello shortly after you arrive
  jwScheduleCat();
});
