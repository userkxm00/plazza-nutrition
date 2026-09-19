# ADR 0002 — Initial Technology Stack

- **Status:** Accepted
- **Date:** 2026-09-14
- **Scope:** Application platform for the initial production implementation

## Context

Plazza Nutrition is an Algerian commerce and operations system with a public storefront, authenticated admin/POS workflows, inventory, returns, finance, courier integrations, webhooks, future payment methods and background jobs.

The project must be understandable and maintainable by a small team using AI-assisted development, while avoiding unnecessary vendor lock-in and infrastructure complexity.

## Decision

Use the following initial stack:

- Next.js + React + TypeScript for web;
- NestJS + TypeScript for the API/backend;
- PostgreSQL as system-of-record database;
- Drizzle ORM for schema/query/migrations;
- Better Auth for authentication;
- application-level RBAC for staff authorization;
- S3-compatible object storage for files/images;
- REST/OpenAPI for the primary API;
- Docker-compatible deployment;
- GitHub Actions for CI/CD.

Keep the system as a modular monolith. Add Redis/BullMQ only when background workload and retry requirements justify the operational dependency.

## Rationale

The domain needs relational transactions and explicit business invariants. PostgreSQL is a better fit than a document-first database. A dedicated NestJS backend gives clear ownership of domain rules, integrations, webhook processing and background jobs. Next.js provides the public storefront and admin UI within one React/TypeScript ecosystem. Drizzle keeps SQL and database constraints visible instead of hiding the relational model behind an opaque abstraction.

Supabase remains an acceptable managed Postgres/storage option but is not treated as the architectural center of the application. Cloudflare remains a possible infrastructure component rather than a runtime constraint.

## Consequences

### Positive

- Clear domain/backend boundary.
- Strong relational integrity.
- Portable production deployment.
- Good fit for transactional inventory and finance.
- Provider integrations can be isolated behind adapters.
- AI-generated code can be reviewed against explicit module and database boundaries.

### Negative

- More moving parts than a single Next.js/Supabase prototype.
- Separate frontend and backend applications require API contracts and deployment for both.
- PostgreSQL operations and backups become an explicit engineering responsibility.
- Authentication and RBAC must be designed rather than delegated entirely to a hosted platform.

## Revisit triggers

Reconsider this decision if:

- backend scale or team size justifies separate services;
- a concrete hosting constraint strongly favors a Workers-only runtime;
- the client requires a specific enterprise auth/payment platform;
- measured workload requires a dedicated job/queue infrastructure;
- a mobile application becomes a primary client and API requirements expand substantially.
