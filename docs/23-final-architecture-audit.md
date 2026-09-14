# Plazza Nutrition — Final Architecture Audit v0.1

> Status: **Approved for implementation planning, not yet for blind code generation.**

## Purpose

This document is the final consistency review of the project specification before assigning implementation work to a coding agent. It is intentionally an audit, not a coding plan.

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

## 2. Remaining decisions that must be explicit before production

These are the remaining business decisions that should not be invented by an implementation agent:

1. Exact inventory reservation/availability behavior at checkout vs confirmation.
2. Final inventory costing method used for authoritative profitability reporting.
3. Return/refund time window and COD refund procedure.
4. Exact exchange policy, including price differences.
5. Failed-delivery cost allocation.
6. Exact invoice/receipt numbering requirements.
7. Merchant-specific ZR API credentials/capabilities and webhook contract.
8. Exact product catalog attributes, especially supplement facts and variants.
9. Final staff roles and permission matrix after observing real staff workflows.
10. Legal/accounting requirements that must be verified by the merchant or qualified advisor.

The agent may implement configurable boundaries for these, but must not silently invent business policy.

## 3. Architecture risks to monitor

### R1 — Scope explosion

The project includes storefront + POS + inventory + delivery + finance. The solution must ship in vertical slices, not as a giant feature batch.

### R2 — Financial correctness

Profitability must be derived from immutable transactional facts and an explicit costing policy. Reports must distinguish authoritative values from estimates.

### R3 — Inventory concurrency

Overselling and duplicate reservations are high-risk. Transactions, appropriate locking/constraints, and idempotency must be tested before production.

### R4 — External courier coupling

ZR is an adapter, not the owner of local order state. Provider outages must degrade operations rather than corrupt data.

### R5 — AI-generated architectural drift

The coding agent must not introduce new frameworks, SaaS providers, database engines, or architectural patterns without a documented decision.

### R6 — Security drift

Admin, finance, stock, webhook, and integration-secret paths require explicit threat-aware review.

### R7 — Data migration/recovery risk

Production migrations must be reversible where practical, tested against staging data, and accompanied by backup/restore procedures.

## 4. Definition of done for the architecture phase

The architecture phase is considered complete only when all of the following exist:

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
- explicit list of unresolved business decisions.

## 5. What the coding agent is allowed to do

The agent may:

- scaffold the approved repository structure;
- implement approved schema/migrations;
- implement one vertical slice at a time;
- add tests corresponding to agreed behavior;
- refactor code without changing externally observed business rules;
- document implementation details;
- surface ambiguity before making consequential decisions.

## 6. What the coding agent is not allowed to do

The agent must not:

- replace the database/ORM/framework because it prefers another;
- introduce microservices or Kubernetes without an ADR;
- add SaaS dependencies without approval;
- hardcode courier rates or business policies that belong in configuration;
- trust client-provided totals, stock, discounts, costs, or permissions;
- mutate stock without traceable inventory movements;
- rewrite historical financial/order facts;
- bypass migrations;
- disable tests to make CI pass;
- commit secrets or real customer data;
- copy external repositories wholesale into the project.

## 7. First implementation boundary

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

## 8. First vertical slice after bootstrap

Recommended first vertical slice:

**Catalog read path**

`database → API → validation → authorization boundary → web catalog → product detail → tests`

Reason: it validates the complete technical path with relatively low business risk before introducing money/inventory concurrency.

## 9. Review rule

After each vertical slice, the agent must report:

- files changed;
- tests added and results;
- migrations added;
- architectural decisions introduced;
- assumptions made;
- known limitations;
- next proposed slice.

If a new requirement conflicts with an existing decision, stop and create/update an ADR rather than silently changing architecture.
