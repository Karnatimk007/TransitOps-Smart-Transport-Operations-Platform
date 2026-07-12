# TransitOps-Smart-Transport-Operations-Platform
A smart fleet and transport management platform for vehicle, driver, trip, maintenance, fuel, and expense management with RBAC, analytics, and automated business workflows.

## Backend Overview

Node.js + Express + Prisma + MySQL backend implementing the TransitOps platform:
- Auth/RBAC
- Vehicles, drivers, trip lifecycle management
- Maintenance, fuel, and expense logging
- Dashboard KPIs and CSV reporting

## Setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev
```

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

All protected routes require `Authorization: Bearer <token>`.
