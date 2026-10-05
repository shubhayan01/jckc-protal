# Justwords Associates' Portal

An internal Employee Management System for Justwords — login, role-based navigation,
a quarterly KPI Incentive Plan + Appraisal workflow with a full manager → director → CEO
approval chain, HR Desk, SOP documents, leave, vacancies, a suggestion box, an Asset Tracking
Tool (asset register + audit log), and an HR-Admin console.
Modern dual-theme (light/dark) UI, no external services required.

## Run it

```bash
npm install      # once
npm start        # -> http://localhost:3000
```

First `npm start` creates `portal.db` (SQLite) and seeds all 55 employees from
`Emp Details - JCKC.xlsx` plus a test account. Data persists across restarts.

- Change the port: `PORT=4000 npm start`
- Wipe & reseed from scratch: `npm run seed`

Requires Node 22.5+ (uses the built-in `node:sqlite` — no native build/compiler needed).

## Logins

| Who | Email | Password |
|-----|-------|----------|
| **Test user** | `test@justwords.in` | `Test@1234` |
| Associate (e.g. Meenaxi) | `meenaxi.badola@justwords.in` | `Meenaxi@justword2026` |
| Reporting Manager | `C` | `Saurav@justword2026` |
| Director | `amlan@justwords.in` | `Amlan@justword2026` |
| CEO | `payel@justwords.in` | `Payel@justword2026` |
| HR Admin | `rushika.hr@justwords.in` | `Rushika@justword2026` |
| HR | `gouri.singla@justwords.in` | `Gouri@justword2026` |

Every seeded associate's default password is **`Firstname@justword2026`** (first name,
capitalised). They are forced to set a new password on first login. The test user is not.

To exercise the whole approval chain quickly, log in as the **test user**, open **Performance →
KPI**, fill a quarter and **Submit** — then log in as **Saurav → Amlan → Payel** and approve at
each step.

## Roles

- **Associate** — fills own KPI/Appraisal, applies for leave, submits suggestions.
- **Manager** (anyone with direct reports) — sees & can *edit* their reports' forms, approves
  when it's their turn, decides team leave.
- **Director / CEO** — approval steps in the chain; can view all forms.
- **HR** — suggestion inbox, vacancies, leave.
- **HR Admin** (Rushika) — everything HR can do **plus** edit content pages (About / HR Desk / SOP),
  and the **Admin Console** (usage & workforce stats).

## The KPI / Appraisal workflow

1. Associate fills the quarter's form (Employee Info + KPI rows + score) and **Submits**.
2. The form **locks** and routes up the associate's actual reporting line:
   **Reporting Manager → Director → CEO**. Each approver **Approves & forwards** or **Sends back**.
3. **Send back** unlocks the form for the associate to revise and resubmit (with a visible
   send-back history).
4. After the **CEO** approves, the quarter is **Approved & locked**, shown at every level.
5. **Q1–Q4** are tracked independently — each quarter runs through the same chain.
6. The **dashboard** and the form's *"Where is this form right now?"* strip always show the
   current stage and who holds it. Any manager in the chain can edit an associate's form.

## Nav map

- **Tools** — Tools & Access
- **About Us** — Vision & Mission · Company Documents
- **HR Desk** — Handbook · Schemes · Policies · Leave · Vacancies
- **SOP Documents** — HR · SEO · Content · Web Dev · Automation
- **Performance** — KPI Incentive Plan · Appraisal (Objectives)

## Note on the reporting hierarchy

Manager relationships are seeded from the **Excel** ("Reporting Manager" column), which is the
authoritative source. It differs from the hand-typed list in a few places — most notably the SEO
executives (Nitesh, Rajeev, Nutan, Himanshu, Krishan) report to **Abhishek Chauhan** in the Excel,
not Mohit Kakkar. Tell me if you want the typed hierarchy to win instead and I'll re-map them.

## Tech

Node.js + Express · `node:sqlite` · bcryptjs (hashed passwords) · express-session ·
multer (supporting-doc uploads) · vanilla JS SPA. All data local in `portal.db`; uploads in `/uploads`.
