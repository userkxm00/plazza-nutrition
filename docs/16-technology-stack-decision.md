# Plazza Nutrition — Technology Stack Decision v0.1

> Status: Architecture decision — selected stack for implementation, subject to validation during the first vertical slice.

## 1. Decision summary

The project will use a **TypeScript modular-monolith architecture** with a separate customer/admin web application and a single business API/application backend.

### Selected baseline

| Concern | Decision |
|---|---|
| Customer/Admin web | Next.js + React + TypeScript |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | Better Auth, with application-level RBAC |
| File/object storage | S3-compatible object storage; provider chosen at deployment |
| Background work | Queue/worker boundary in the backend; Redis/BullMQ only when workload requires it |
| API | REST-first, OpenAPI documented |
| Validation | Shared TypeScript schemas + server-side validation |
| Testing | Unit + integration + E2E |
| Deployment | Docker-first; provider is replaceable and client-owned in production |
| Observability | Structured logs + error tracking + health checks |
| CI/CD | GitHub Actions |

## 2. Why this architecture

### 2.1 Modular monolith, not microservices

The business needs strong consistency between:

- order creation/confirmation;
- inventory movements;
- POS sales;
- returns/exchanges;
- cash reconciliation;
- profitability facts.

Splitting these into independent microservices would add distributed transactions, message-broker complexity, deployment overhead and more failure modes without a current business requirement. The codebase will therefore be modular internally, with explicit module boundaries and domain services, while initially running as one backend application.

The architecture must still keep provider and domain boundaries clean so a future extraction of a genuinely large module remains possible.

## 3. Frontend: Next.js

Next.js is selected for the storefront and admin application because the project needs both public commerce pages and authenticated, highly interactive operational screens in one React/TypeScript ecosystem.

The App Router is the default direction. Server-side rendering/data access should be used where it improves initial delivery and SEO; client components should be reserved for genuinely interactive UI.

The frontend must not contain business-critical financial, inventory or authorization logic. It calls the backend API and renders server-validated results.

### Alternatives considered

**Astro:** excellent for content-heavy/static storefronts and is proven in CodFlow, but the Plazza project has a large authenticated admin/POS application as well as the storefront. Keeping the primary web application in one React/TypeScript framework reduces context switching and shared UI complexity for this project.

**React + Vite SPA:** viable, but would require more decisions around routing, SSR/SEO, API integration and deployment. It is not the simplest choice for this product's public storefront.

**Next.js full-stack only:** technically possible, but we prefer a dedicated backend boundary because integrations, POS operations, background jobs, webhooks, transactional services and future non-web clients deserve an explicit API layer.

## 4. Backend: NestJS

NestJS is selected for the business backend because the application contains many distinct domains and integrations: catalog, orders, inventory, POS, delivery, returns, finance, users/permissions and notifications.

Nest's module system maps well to the planned modular-monolith structure. Controllers, application services, domain services, guards, validation, logging, queues and OpenAPI support are all available within the same TypeScript ecosystem.

### Backend module boundary

Initial modules are expected to include:

- auth / identity;
- catalog;
- customers;
- carts / checkout;
- orders;
- inventory;
- purchasing;
- POS;
- delivery;
- returns;
- finance;
- promotions;
- reviews;
- notifications;
- audit;
- reporting;
- integrations.

No module may bypass another module's business invariants through arbitrary database writes.

## 5. Database: PostgreSQL

PostgreSQL is the primary system of record.

Reasons:

- relational integrity is central to the domain;
- transactions are required across order/inventory/financial operations;
- foreign keys and constraints protect core invariants;
- indexes and relational queries fit catalog/order/reporting workloads;
- mature backup, migration and operational tooling;
- avoids designing the system around a proprietary schema abstraction.

PostgreSQL 18 is the current major release line as of this architecture review. The actual production provider may expose a supported PostgreSQL version; the application should remain compatible with the selected supported version and documented extensions.

## 6. ORM: Drizzle

Drizzle ORM is selected rather than hiding the database behind a very high-level abstraction.

Reasons:

- TypeScript-first schema definitions;
- strong PostgreSQL support;
- SQL remains visible and understandable;
- migrations are versioned;
- indexes/constraints can be expressed explicitly;
- good fit for a developer who is learning SQL and should not be isolated from the database model.

The project will not rely on the ORM to replace knowledge of SQL. Complex reporting queries may use reviewed SQL where that is clearer or more efficient.

## 7. Authentication: Better Auth + application RBAC

Authentication and authorization are separate concerns.

Better Auth is the initial authentication layer because it integrates with PostgreSQL and keeps authentication concerns inside the application stack rather than requiring the business domain to depend on a hosted auth provider.

The project will implement its own explicit authorization model:

`staff user → role → permissions`

and customer identity will remain separate from staff permissions.

A future migration to another authentication provider should be possible without rewriting catalog/order/inventory business logic.

## 8. Why not make Supabase the architecture?

Supabase remains a valid infrastructure option and could be used as a managed PostgreSQL provider, especially for development/demo or if the client chooses it for production.

However, **Supabase is not the application architecture**.

We will not make the business domain depend on Supabase-specific database APIs or SDK calls throughout the codebase. PostgreSQL remains the system of record and the backend owns business rules.

This preserves portability while retaining the option of using Supabase-managed Postgres, backups and storage when economically useful.

## 9. Storage

Product images, receipts/PDFs and other blobs will use an S3-compatible object-storage abstraction.

The application database stores metadata and object keys, not arbitrary large binary content.

This allows deployment on:

- Cloudflare R2;
- AWS S3;
- another S3-compatible provider;
- a future provider chosen by the client.

The storage adapter must not leak provider-specific APIs into catalog/order modules.

## 10. Background jobs

Several operations should not block the checkout or admin HTTP request:

- notification sending;
- retrying failed external API calls;
- processing courier webhook side effects;
- generating some reports/documents;
- future SMS/WhatsApp/email jobs.

The application will expose a job boundary from the beginning. Redis/BullMQ is **not required on day one** if the initial workload can be safely processed with a simpler worker/outbox strategy. It becomes an infrastructure dependency when the measured workload or retry requirements justify it.

## 11. API style

REST-first API with OpenAPI documentation.

Reasons:

- easy interoperability with the storefront, POS clients and future mobile apps;
- suitable for courier integrations and webhooks;
- straightforward debugging;
- explicit request/response contracts.

GraphQL is not required for the first production release.

## 12. Payments

Current payment method: cash on delivery and cash in the physical store.

The payment domain is provider-neutral so future methods such as CCP and BaridiMob can be introduced without changing order or accounting concepts.

The system will not falsely implement a payment method before its real operational requirements and provider integration are available.

## 13. Delivery integrations

The first courier adapter is ZR Express.

Core domain code communicates with a generic `DeliveryProvider` interface. ZR-specific API fields, authentication and webhook signatures stay inside the ZR adapter.

Manual shipment creation/tracking remains available as a fallback.

## 14. Deployment strategy

### Development

Everything should run locally through Docker-compatible services where appropriate:

- web application;
- API;
- PostgreSQL;
- optional worker/Redis when enabled.

### Demo

A temporary/demo deployment may use free or low-cost managed services. It must not be treated as production infrastructure.

### Production

Production infrastructure must be owned by the client where practical:

- domain;
- database;
- object storage;
- application hosting;
- third-party integration accounts.

The repository must remain deployable to a standard Linux/Docker environment so the client is not permanently locked to one host.

## 15. Why not Cloudflare-only?

Cloudflare Workers + D1 + R2 is a legitimate architecture and CodFlow demonstrates it for an Algerian COD platform.

For Plazza Nutrition we prefer standard PostgreSQL plus a conventional Node backend because:

- the domain requires complex transactional relationships;
- the team is learning PostgreSQL directly;
- POS/admin workloads are not just static web workloads;
- portability to a normal Linux/VPS/cloud environment is valuable;
- the project should not be constrained by a Workers-specific runtime while the requirements are still evolving.

Cloudflare can still be used later for CDN, DNS, WAF, R2 or even Hyperdrive if it provides a concrete benefit.

## 16. Security baseline

- Server-side authorization on every protected mutation.
- Secure, httpOnly session handling.
- CSRF protection where cookie-based browser flows require it.
- Password hashing delegated to the authentication library using a current secure algorithm/configuration.
- Rate limiting on login, checkout and sensitive endpoints.
- Webhook signature verification for supported couriers.
- Idempotency keys for checkout and webhook processing.
- Secrets only in environment/secret stores.
- Audit logging for sensitive operations.
- Least-privilege database/service credentials.

## 17. Architecture fitness criteria

The selected stack must pass these tests before production:

1. A duplicate checkout cannot create duplicate stock/order effects.
2. A duplicate ZR webhook cannot double-apply a transition.
3. Two concurrent sales cannot silently oversell the same stock.
4. A completed order retains historical pricing/cost facts.
5. Returns cannot silently rewrite original sales.
6. Staff permissions cannot be bypassed through direct API calls.
7. The database can be restored from a tested backup.
8. Integrations can be disabled without making the local order system unusable.
9. The application can be redeployed without manual database edits.
10. A new courier can be added behind an adapter without changing order logic.

## 18. Final recommendation

Implement the first vertical slice with:

`Next.js + NestJS + PostgreSQL + Drizzle + Better Auth + S3-compatible storage`

and keep:

`Redis/BullMQ + external notification providers + additional courier adapters`

as conditional infrastructure that is introduced when the real requirements justify them.

This is deliberately more infrastructure than a simple CRUD Supabase demo and less infrastructure than a premature microservices platform.
