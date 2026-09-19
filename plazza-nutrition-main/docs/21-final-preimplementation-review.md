# Plazza Nutrition — Final Pre-Implementation Review v0.1

> Status: planning only. No application code or migrations are created by this document.

## Purpose

This review is the gate between architecture/design and implementation. The project is intended to be built by a coding agent under human supervision. The agent must implement the documented plan; it must not invent a new architecture because it is convenient.

## Confirmed product shape

Plazza Nutrition is a unified commerce and business-operations platform for a physical Algerian sports-nutrition retailer.

Core surfaces:

- Customer storefront
- Customer accounts and guest checkout
- Staff/admin dashboard
- Physical POS/cash register
- Shared inventory
- Purchasing/suppliers
- Orders and COD fulfillment
- ZR Express delivery integration with manual fallback
- Returns/exchanges/refunds
- Expenses, cash reconciliation and profitability reporting
- Reviews, coupons and promotions
- Auditability, backups and operational monitoring
- Provider-based notification foundation

## Architecture gate

### Architectural style

**Modular monolith** for the application backend.

The modules are logically separated in one deployable backend. They communicate through explicit application/domain boundaries rather than direct cross-module database manipulation.

### Initial stack decision

- Web: Next.js + React + TypeScript
- API: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Drizzle
- API style: REST + OpenAPI
- Authentication: server-managed secure sessions/cookies; exact library choice remains an implementation detail constrained by the security document
- Authorization: application RBAC/permissions
- Storage: S3-compatible object storage
- Deployment: container-compatible API + managed web hosting + managed PostgreSQL
- CI/CD: GitHub Actions

### Principles

1. Business logic belongs in domain/application services, not UI components.
2. Frontend is never trusted for prices, totals, stock, profit, permissions or workflow transitions.
3. External providers are behind integration adapters.
4. Core order/inventory/financial facts are local system-of-record data.
5. Critical state changes are transactional and idempotent.
6. Historical transaction snapshots are immutable.
7. Production secrets never enter Git.

## Implementation boundary

The coding agent is authorized to implement only after reading and respecting:

- `README.md`
- `docs/01-business-analysis.md`
- `docs/02-requirements.md`
- `docs/03-domain-model.md`
- `docs/04-architecture.md`
- `docs/05-database-design.md`
- `docs/11-business-workflows.md`
- `docs/12-decision-resolution.md`
- `docs/13-state-machines.md`
- `docs/14-erd-and-relationship-review.md`
- `docs/15-physical-schema.md`
- `docs/16-technology-stack-decision.md`
- `docs/17-api-contracts.md`
- `docs/18-security-architecture.md`
- `docs/19-deployment-and-infrastructure.md`
- `docs/20-project-structure.md`

If implementation reveals a contradiction, the agent must stop and propose a documented decision/ADR instead of silently changing the architecture.

## Vertical-slice implementation strategy

Do not generate the entire product in one operation.

Recommended order:

1. Repository/tooling bootstrap
2. Database foundation + migrations
3. Authentication and staff RBAC foundation
4. Catalog/product/variant foundations
5. Customer + guest checkout foundations
6. Order creation + order state machine
7. Inventory movement/reservation foundation
8. POS + cash session foundation
9. Delivery abstraction + manual shipment flow
10. ZR integration behind the adapter boundary
11. Returns/exchanges
12. Purchases/batches/expiry
13. Finance/expenses/profitability
14. Reviews/promotions
15. Notifications
16. Reports/dashboard
17. Hardening, observability, backups and production readiness

Each slice must have:

- domain rules
- API contract
- DB/migration changes
- validation
- authorization
- tests
- observability
- documentation update when behavior changes

## Definition of done for production-sensitive work

A feature is not complete merely because the UI works.

For sensitive workflows, completion requires:

- server-side validation
- authorization checks
- transaction boundaries where required
- idempotency where retry is possible
- audit record when required
- tests for normal and failure paths
- explicit error handling
- no secret leakage
- migration reviewed
- rollback/recovery impact understood

## Explicit non-goals for initial implementation

Avoid premature complexity:

- microservices
- Kubernetes
- multi-region active/active
- full ERP/accounting replacement
- dozens of courier integrations before the core is stable
- payment providers not currently required
- large AI/agent features inside the business core

Future extensibility should be preserved through module/provider boundaries, not speculative infrastructure.

## Current implementation gate

Planning is considered sufficiently mature to start implementation bootstrap, but the first agent task must be a **repository/bootstrap task only**, followed by review.

The agent must not start with the full commerce feature set.
