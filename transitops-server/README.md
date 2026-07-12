# TransitOps Backend

Node.js + Express + Prisma + MySQL backend implementing the TransitOps hackathon spec:
auth/RBAC, vehicles, drivers, trips (with full lifecycle validation), maintenance,
fuel/expense logging, dashboard KPIs, and CSV reporting.

## Setup (≈10 minutes)

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed                 # creates 4 demo users + 1 vehicle + 1 driver
npm run dev                  # starts on http://localhost:4000
```

Demo login (after seeding), password for all: `password123`
- fleet@transitops.com (FLEET_MANAGER)
- driver@transitops.com (DRIVER)
- safety@transitops.com (SAFETY_OFFICER)
- finance@transitops.com (FINANCIAL_ANALYST)

## Where the business logic lives

**`src/services/tripService.js`** is the most important file — it's the single
source of truth for every "Mandatory Business Rule" in the spec:
- Cargo weight vs. vehicle capacity
- Vehicle/driver availability checks (Retired, In Shop, On Trip, Suspended, expired license)
- Automatic status transitions on dispatch / complete / cancel
- All state changes run inside a `prisma.$transaction` so two trips can't race
  to grab the same vehicle/driver.

Maintenance open/close logic (vehicle → In Shop → Available) lives in
`src/controllers/maintenanceController.js` for the same reason — it's a small,
self-contained state machine.

## API Overview

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Vehicles | `GET/POST /api/vehicles`, `GET/PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` (retires), `GET /api/vehicles/available` |
| Drivers | `GET/POST /api/drivers`, `GET/PUT /api/drivers/:id`, `POST /api/drivers/:id/suspend`, `POST /api/drivers/:id/reinstate`, `GET /api/drivers/available` |
| Trips | `GET/POST /api/trips`, `GET /api/trips/:id`, `POST /api/trips/:id/dispatch`, `POST /api/trips/:id/complete`, `POST /api/trips/:id/cancel` |
| Maintenance | `GET/POST /api/maintenance`, `POST /api/maintenance/:id/close` |
| Fuel & Expenses | `GET/POST /api/fuel-logs`, `GET/POST /api/expenses`, `GET /api/vehicles/:id/operational-cost` |
| Dashboard/Reports | `GET /api/dashboard`, `GET /api/reports/vehicle/:id`, `GET /api/reports/export.csv` |

All routes except `/register` and `/login` require `Authorization: Bearer <token>`.

## RBAC matrix (as implemented)

| Action | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| Create/edit vehicles | ✅ | – | – | – |
| Create/edit drivers | ✅ | – | – | – |
| Suspend/reinstate driver | ✅ | – | ✅ | – |
| Create/dispatch/complete/cancel trip | ✅ | ✅ | – | – |
| Open/close maintenance | ✅ | – | – | – |
| Log fuel/expense | ✅ | ✅ | – | – |
| View fuel/expense/reports | ✅ | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ | ✅ |

Adjust `requireRole(...)` calls in `src/routes/*.js` if you want a different split.

## Next steps to finish the hackathon build

1. `npx prisma migrate dev` against a real MySQL instance and sanity-check the seed.
2. Wire the React frontend: Axios instance that attaches the JWT, a login page,
   and pages per module hitting the endpoints above.
3. Recharts on `/api/dashboard` response for the KPI cards + fleet utilization chart.
4. `/api/reports/export.csv` already streams a CSV — hook a "Export" button to it.
5. Bonus features (email reminders, PDF export, dark mode) only after the
   "Judging Priorities" list in the brief is fully working end-to-end.
