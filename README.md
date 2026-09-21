# Inventory & Order Management

Full-stack **inventory, customers, products, and orders** console with dashboard analytics — FastAPI backend, React + Vite frontend, PostgreSQL.

## Problem

Small businesses need a single place to see **stock levels**, **create orders**, and **track revenue trends** without juggling spreadsheets.

## Approach

1. **FastAPI** REST API with async SQLAlchemy against PostgreSQL.
2. **React** SPA (TanStack Table, Recharts) for dashboard, catalog, and order flows.
3. **Docker Compose** for local Postgres + API + static frontend.
4. **render.yaml** / **vercel.json** for deployment sketches.

## Architecture

```
React (Vite) → REST API (FastAPI) → PostgreSQL
     ↑ charts / tables (dashboard, products, orders, customers)
```

## Tech

Python · FastAPI · SQLAlchemy (async) · PostgreSQL · React · TypeScript · Vite · Tailwind · Recharts · Docker

## Decisions

| Decision | Why |
|----------|-----|
| Split frontend/backend | Clear API boundary for portfolio reviewers. |
| Dashboard aggregates via dedicated routes | Keeps list pages fast while charts get summary data. |
| Compose for Postgres | Matches how reviewers run the stack locally. |

## Results

- CRUD for products, customers, and orders with order detail views.
- Dashboard stats and trend charts (orders, revenue, stock distribution).

## Demo

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: **http://localhost:3000**
- API: **http://localhost:8000**

### Local development

Run Postgres from Compose, then start `backend` and `frontend` per their Dockerfiles / package scripts.
