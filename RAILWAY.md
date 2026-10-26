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
- To reseed employees from the spreadsheet/JSON later: `npm run seed`.
