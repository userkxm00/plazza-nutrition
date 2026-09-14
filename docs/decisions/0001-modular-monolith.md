# ADR-0001: Start with a Modular Monolith

- **Status:** Accepted for initial production architecture
- **Date:** 2026-09-14
- **Scope:** Application architecture

## Context

Plazza Nutrition combines online commerce, physical POS, inventory, delivery, returns, purchasing and operational finance for one retailer with one current stock location. These domains share strong consistency requirements, especially around stock, money and order state.

The project is initially developed and operated by a small team / solo developer and must remain maintainable and affordable.

## Decision

Build the first production release as a **modular monolith** with explicit domain/application module boundaries and a shared relational database.

External providers such as courier APIs, notifications and future payment providers are isolated behind integration adapters.

Background jobs are used for slow/retryable work, but the core transactional domain remains inside the application boundary.

## Why

- Strong transactional consistency for orders, inventory and financial records.
- Lower deployment and observability complexity than microservices.
- Easier local development and debugging.
- Clear boundaries still allow future extraction of a genuinely scaling-sensitive module.
- Appropriate for the current business size and expected operational model.

## Consequences

### Positive

- One deployable product is easier to operate.
- Shared transactions are straightforward.
- Fewer network failure modes.
- Lower infrastructure cost.

### Negative

- The codebase must enforce module boundaries deliberately.
- A future extraction will require careful API/data boundary work.
- A single application deployment can become a scaling bottleneck if the business grows substantially.

## Revisit triggers

Reconsider service extraction only when there is evidence such as:

- Independent scaling needs with measurable bottlenecks.
- Different reliability or deployment requirements for a specific domain.
- A domain becoming operationally independent.
- Team size/ownership making module independence materially valuable.

Do not introduce microservices merely because they are considered more "professional".
