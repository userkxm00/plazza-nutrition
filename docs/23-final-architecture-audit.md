# Plazza Nutrition — Final Architecture Audit v0.2

> Status: **Approved for implementation.**

## Purpose

This document is the final consistency review of the project specification before assigning implementation work to a coding agent. The remaining business-policy decisions from v0.1 have now been closed in `docs/28-final-business-decisions.md`.

## 1. Consistency check

### Business → Domain

The domain model matches the business scope:

- online commerce;
- physical POS;
- unified inventory;
- batch/expiry-aware stock where required;
- purchasing and suppliers;
- delivery and ZR integration;
- returns/exchanges;
- cash register and operational finance;
- profitability reporting;
- staff/RBAC/audit;
- promotions/reviews;
- future notifications and payments.

### Domain → Workflows

Core entities have corresponding workflows and state transitions. No critical business flow should depend on a UI-only state.

### Workflows → Database

The schema proposal supports the required transaction histories, snapshots, movement records, and provider boundaries. Historical commercial records are treated as immutable facts rather than live references to mutable catalog data.

### Database → API

The API contract follows domain boundaries rather than exposing raw table CRUD. Sensitive calculations remain server-side.

### API → Security

Authentication, authorization, idempotency, validation, webhook verification, auditability, and transaction boundaries are defined as cross-cutting backend concerns.

### Architecture → Infrastructure

The proposed deployment can host the modular monolith, PostgreSQL, object storage, asynchronous jobs, and monitoring without requiring microservices or Kubernetes.

## 2. Business decisions now closed

The implementation baseline is now explicit for:

1. COD stock reservation: no authoritative reservation at cart/PENDING stage; confirmation performs the transactional stock commitment.
2. Inventory costing: perpetual moving weighted-average cost per variant/location.
3. Returns/refunds: 15-calendar-day default request window from confirmed delivery, with configured eligibility and controlled COD refund workflow.
4. Exchanges: same default return window; customer pays a positive difference, receives a refund/credit for a negative difference, or no adjustment for equal value.
5. Failed delivery: merchant absorbs actual courier delivery/return cost as operational delivery cost/loss; uncollected customer shipping is not revenue.
6. Numbering: separate immutable monotonic order, invoice and receipt sequences.
7. ZR integration: provider adapter; actual merchant credentials/API/webhook contract is required before live integration is enabled.
8. Product catalog: structured supplement-aware baseline attributes are defined.
9. Staff roles: OWNER, MANAGER, ORDER_OPERATOR, CASHIER, WAREHOUSE_OPERATOR, FINANCE.
10. Legal/accounting: the system remains an operational commerce system; merchant-specific tax/statutory details must be verified before production activation.

See `docs/28-final-business-decisions.md` for the authoritative definitions.

## 3. External validation gates before production

Only merchant-specific or externally controlled facts remain to be supplied/validated:

- current ZR merchant credentials and exact API/webhook contract;
- merchant tax/VAT/accounting status and required statutory document fields;
- applicability of any cash-register/software integrity, security, conservation and archiving requirements;
- final published terms, return exceptions and merchant legal information.

These are **validation inputs**, not open architecture decisions. The implementation agent must not invent them.

## 4. Architecture risks to monitor

### R1 — Scope explosion

The project includes storefront + POS + inventory + delivery + finance. The solution must ship in vertical slices, not as a giant feature batch.

### R2 — Financial correctness

Profitability must be derived from immutable transactional facts and the approved moving-average costing policy. Reports must distinguish authoritative values from estimates.

### R3 — Inventory concurrency

Overselling is high-risk. Confirmation and POS completion require transactional stock checks, appropriate locking/constraints, and idempotency tests before production.

### R4 — External courier coupling

ZR is an adapter, not the owner of local order state. Provider outages must degrade operations rather than corrupt data.

### R5 — AI-generated architectural drift

The coding agent must not introduce new frameworks, SaaS providers, database engines, or architectural patterns without a documented decision.

### R6 — Security drift

Admin, finance, stock, webhook, and integration-secret paths require explicit threat-aware review.

### R7 — Data migration/recovery risk

Production migrations must be reversible where practical, tested against staging data, and accompanied by backup/restore procedures.

## 5. Definition of done for the architecture phase

The architecture phase is now considered complete because the project contains:

- business requirements;
- domain model;
- workflow definitions;
- state machines;
- ERD and relationship review;
- physical schema proposal;
- technology decisions;
- API contracts;
- security architecture;
- deployment/infrastructure plan;
- repository/project structure;
- coding-agent handbook;
- implementation roadmap;
- explicit business decisions;
- explicit external-validation gates.

## 6. What the coding agent is allowed to do

The agent may:

- scaffold the approved repository structure;
- implement approved schema/migrations;
- implement one vertical slice at a time;
- add tests corresponding to agreed behavior;
- refactor code without changing externally observed business rules;
- document implementation details;
- surface missing external evidence at the defined validation boundaries.

## 7. What the coding agent is not allowed to do

The agent must not:

- replace the database/ORM/framework because it prefers another;
- introduce microservices or Kubernetes without an ADR;
- add SaaS dependencies without approval;
- hardcode courier rates or merchant-specific legal/tax values;
- trust client-provided totals, stock, discounts, costs, or permissions;
- mutate stock without traceable inventory movements;
- rewrite historical financial/order facts;
- bypass migrations;
- disable tests to make CI pass;
- commit secrets or real customer data;
- copy external repositories wholesale into the project;
- override the business decisions in `docs/28-final-business-decisions.md`.

## 8. First implementation boundary

The first implementation task should be **bootstrap only**:

1. establish monorepo/workspace;
2. create the approved web and API applications;
3. configure shared TypeScript/lint/format/test conventions;
4. configure environment variable validation and examples;
5. establish Docker/dev infrastructure;
6. establish database connection/migration tooling without yet implementing every business table;
7. add CI checks;
8. add a minimal health/readiness endpoint and minimal frontend shell;
9. prove local development and test commands work.

No storefront feature, POS feature, payment feature, ZR integration, or financial feature should be built in the bootstrap task.

## 9. First vertical slice after bootstrap

Recommended first vertical slice:

**Catalog read path**

`database → API → validation → authorization boundary → web catalog → product detail → tests`

Reason: it validates the complete technical path with relatively low business risk before introducing money/inventory concurrency.

## 10. Review rule

After each vertical slice, the agent must report:

- files changed;
- tests added and results;
- migrations added;
- architectural decisions introduced;
- assumptions made;
- known limitations;
- next proposed slice.

If a new requirement conflicts with an existing decision, stop and create/update an ADR rather than silently changing architecture.
