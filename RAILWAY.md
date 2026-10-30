# Deploying to Railway

The Justwords Collaborative Knowledge Center is a single Node/Express service
backed by SQLite (`node:sqlite`, no native build). It reads everything it needs
from environment variables, so deploying is just: connect the repo, set a few
vars, and attach a volume so data survives deploys.

## 1. Push to GitHub

```bash
git add -A
git commit -m "Add Railway deploy config"
git push origin main
```

## 2. Create the Railway service

1. Railway → **New Project** → **Deploy from GitHub repo** → pick this repo.
2. Railway auto-detects Node (Nixpacks) and reads `railway.json` (start command
   `npm start`, health check on `/`). `.nvmrc` pins Node 24, which is required
   for the built-in `node:sqlite`.

## 3. Add a Volume (so data persists)

Without a volume, Railway's filesystem is ephemeral — the database and uploaded
files are wiped on every deploy/restart and the DB is reseeded from
`seed_employees.json`. To keep live KPI/appraisal data and uploads:

- Service → **Variables / Volumes** → **New Volume**
- Mount path: **`/data`**

## 4. Set environment variables

Service → **Variables**:

| Variable         | Value                                             |
|------------------|---------------------------------------------------|
| `NODE_ENV`       | `production`                                       |
| `DATA_DIR`       | `/data`  (same as the volume mount path)           |
| `SESSION_SECRET` | a long random string (example below)               |
| `ADMIN_BACKUP_PASSWORD` | password for the `/admin` backup console (defaults to `admin123` — **change it**) |

A freshly generated secret you can paste (or make your own):

```
190d1106ffe53859d7c7dd8304c7451fe58aa20b7cf1417a3e8ca99fc4eb8d0af2400230cb6346258bb4d608f38ad937
```

> `PORT` is injected by Railway automatically — do **not** set it. The app
> already trusts the platform proxy so secure cookies work behind Railway TLS.

## 5. Generate a domain

Service → **Settings** → **Networking** → **Generate Domain**. Railway maps the
public URL to the app's `PORT`.

## First boot

On an empty volume the app creates `portal.db`, seeds employees from
`seed_employees.json`, and creates `/data/uploads`. Users log in with their
seeded credentials and are prompted to reset the password on first sign-in.

## Notes

- `render.yaml` (Render Blueprint) is kept for reference; it is ignored by Railway.
- Data layout on the volume: `/data/portal.db` (+ WAL files) and `/data/uploads/`.
- The app **never** wipes or reseeds an existing database on deploy — `seed()` runs
  only when the `users` table is completely empty. As long as the volume is attached
  and `DATA_DIR=/data`, KPIs, appraisals, messages and uploads survive every redeploy.

### Danger zone — wiping data (guarded)

- `npm run seed` / `node db.js --reseed` DELETES ALL DATA and rebuilds from the seed.
  It is guarded and now **refuses** unless you also pass `--force`
  (`node db.js --reseed --force`) or set `RESEED_CONFIRM=yes`. Do not add that flag or
  var to the Railway service — a normal deploy must never carry it.

### Backup & restore console (`/admin`)

Visit **`https://<your-domain>/admin`** for a standalone, password-gated console (user
`admin`, password from `ADMIN_BACKUP_PASSWORD`, default `admin123`). It can:

- **Download all data** as one JSON file (every table — employees, KPIs, appraisals,
  messages, assets…). Keep it safe: it holds personal data and password hashes.
- **Restore** from a JSON backup, replacing all current data (all-or-nothing).

This is your recovery net if the volume is ever lost. It does not include the bytes of
uploaded files, only their database records. Change the default password in production.

### One-time cleanup: remove test data, keep the roster

`scripts/clean-test-data.js` wipes all entered/transactional data (forms, approvals,
uploads, messages, suggestions, leaves, referrals, reimbursements, notifications,
assets, announcements, form windows, test chat channels) and deletes the retired
`Test Associate` (JW999) account, while **keeping** the 56 employees and content pages.

Run it once, inside the service so it hits the volume's database:

```bash
railway ssh                        # opens a shell in the running container
node scripts/clean-test-data.js --dry   # preview (changes nothing)
node scripts/clean-test-data.js         # apply
```

(Requires the Railway CLI: `npm i -g @railway/cli`, then `railway login` and
`railway link`. Deploy this commit first so the script exists in the container.)
