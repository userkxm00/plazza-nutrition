# Plazza Nutrition — Project Structure & Environment Strategy v0.1

> Status: implementation preparation. This document defines the repository layout and environment boundaries before application code is introduced.

## 1. Repository shape

The project will use a small monorepo. The goal is shared types/configuration without turning the repository into an unnecessary multi-service platform.

```text
plazza-nutrition/
├── apps/
│   ├── web/                 # Next.js customer storefront
│   └── api/                 # NestJS modular-monolith API
├── packages/
│   ├── contracts/           # API schemas / shared DTO contracts
│   ├── config/              # shared TypeScript/tooling config only
│   ├── i18n/                # locale keys/resources
│   └── ui/                  # truly shared UI primitives
├── infra/
│   ├── docker/              # local/production container assets
│   └── scripts/              # safe operational scripts
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
├── research/
├── .github/
│   └── workflows/
├── docker-compose.yml       # local infrastructure only
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

The repository should not start with separate microservice packages for orders, inventory, payments, etc. Those are internal NestJS modules inside `apps/api`.

## 2. Backend module boundaries

The API is one deployable application but internally separated by domain:

```text
apps/api/src/
├── auth/
├── users/
├── catalog/
├── customers/
├── cart/
├── orders/
├── inventory/
├── purchasing/
├── pos/
├── delivery/
├── returns/
├── finance/
├── promotions/
├── reviews/
├── notifications/
├── integrations/
├── reports/
├── audit/
└── shared/
```

Modules communicate through explicit application/domain services. Cross-module access to persistence should be deliberate; modules should not query arbitrary tables simply because they can.

## 3. Frontend boundaries

`apps/web` owns customer-facing routes and presentation.

The browser must never contain authoritative business calculations. It may provide previews, but the API is authoritative for:

- prices;
- discounts;
- shipping;
- stock availability;
- order totals;
- permissions;
- profit/financial values.

Admin UI should remain a dedicated route area within the same frontend initially, with its own layouts and authorization guards.

## 4. Packages

Shared packages are deliberately small.

### `packages/contracts`

Contains API request/response schemas generated or maintained from the API contract. It must not contain database implementation details.

### `packages/ui`

Contains reusable visual primitives only. Business-specific admin components remain in `apps/web`.

### `packages/i18n`

Contains translation keys/resources and locale utilities. Arabic and French are first-class; RTL/LTR must be handled centrally.

### `packages/config`

Tooling/configuration only. Secrets and environment-specific values do not belong here.

## 5. Environment model

Three logical environments are required:

```text
local → staging → production
```

### Local

Used for development. Docker may provide local PostgreSQL and other dependencies. No production secrets or customer data.

### Staging

Production-like environment for migrations, integration testing, ZR sandbox/testing where available, and release verification.

### Production

Real customer/order data. Only production-approved builds and migrations. Backups, monitoring and alerts enabled.

## 6. Configuration rules

Configuration is separated into:

```text
PUBLIC CONFIG       # safe to expose to browser
SERVER CONFIG       # API/server only
SECRET CONFIG       # encrypted secret storage
```

Examples of secrets:

- database credentials;
- auth/session secrets;
- ZR API credentials;
- webhook signing secrets;
- storage access keys;
- notification provider credentials.

Secrets must never be committed to Git, placed in client bundles, or copied into documentation.

## 7. Local Docker strategy

Local Docker should provide at minimum:

- PostgreSQL;
- optional object-storage emulator only if genuinely useful;
- optional mail testing service;
- optional observability components when needed.

We should not emulate every external provider locally. ZR/WhatsApp/SMS integrations must have explicit adapters and mocked contract tests.

## 8. Database migration strategy

Migrations are append-only and version-controlled.

Rules:

1. Never edit an already-applied production migration.
2. Schema changes use a new migration.
3. Destructive changes require a staged migration plan.
4. Production migrations run before the application version that requires them, unless the migration is explicitly backward compatible.
5. Seed data is separate from schema migrations.

## 9. Build/release principle

A release should follow:

```text
lint → typecheck → unit tests → integration tests → build → migration validation → deploy → smoke tests
```

Application deployments and database migrations must be observable and reversible where practical.

## 10. Important rule for AI-assisted development

AI-generated code must respect this repository structure.

AI must not:

- create arbitrary top-level applications;
- move business logic into UI components;
- access the database directly from the frontend;
- bypass domain services for sensitive operations;
- introduce a new provider without an ADR;
- add a dependency simply to avoid understanding an existing abstraction.

Every significant architectural change must update the relevant documentation/ADR first.
