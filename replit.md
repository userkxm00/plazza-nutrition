# Plazza Nutrition

Plazza Nutrition is a bilingual sports-nutrition storefront and commerce operations workspace for customers, shop staff, and owners.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/plazza-nutrition/` — React/Vite frontend visual foundation and local fixture boundary.
- `artifacts/api-server/` — shared Express API service; currently health-only until the documented backend phase.
- `lib/api-spec/openapi.yaml` — API contract source of truth.
- `lib/db/src/schema/` — Drizzle schema source of truth.
- `plazza-nutrition-main/docs/DESIGN_DISCOVERY.md` — product understanding, journeys, IA, risks, and assumptions.
- `plazza-nutrition-main/docs/DESIGN_SYSTEM.md` — tokens, typography, density, states, responsive, RTL, and motion rules.
- `plazza-nutrition-main/docs/DESIGN_COVERAGE.md` — route/surface/state coverage matrix.
- `plazza-nutrition-main/docs/DESIGN_QA.md` — visual and interaction review checklist.
- `plazza-nutrition-main/docs/DESIGN_DECISIONS.md` — non-obvious frontend decisions.
- `plazza-nutrition-main/docs/ANTIGRAVITY_FRONTEND_RULES.md` — continuation and integration rules for future engineering.

## Architecture decisions

- The frontend phase uses explicit local fixtures and replaceable service interfaces; it does not claim production persistence or authority.
- Product, price, availability, totals, stock, permissions, status transitions, provider facts, and profitability remain server-owned in the future API.
- The storefront and operations workspace share one brand system but use different information density for their different tasks.
- Arabic RTL and French LTR are first-class presentation requirements, including layout flow and component behavior.

## Product

The product covers customer catalog discovery, product details, cart, COD checkout, accounts, orders, returns, exchanges, reviews, promotions, delivery UX, and a professional operations workspace for orders, customers, products, inventory, purchasing, receiving, delivery, POS, cash, finance, reports, staff, notifications, audit, and settings.

## User preferences

- Follow the attached Plazza Nutrition design-first directive: do not optimize only for the homepage; keep the complete product surface coherent.
- Do not invent real catalog data, claims, reviews, rates, legal rules, or provider capabilities.

## Gotchas

- The `plazza-nutrition-main/docs/` design documents are the frontend handoff contract.
- Visual fixtures must remain clearly replaceable when real API contracts and merchant configuration arrive.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
