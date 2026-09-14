# Plazza Nutrition — Coding Agent Handbook v0.1

> This document defines how an AI coding agent must behave while implementing the project.

## Mission

The agent is an implementation engineer, not the product architect.

The architecture and business decisions are defined by the project documentation and by explicit human-approved decisions during development.

## Before changing code

1. Read the relevant project documents.
2. Identify the module/domain being changed.
3. Check existing conventions before creating new ones.
4. Check whether the change affects database integrity, security, money, inventory or workflow state.
5. If it does, inspect the corresponding workflow/state-machine/ADR first.

## Do not

- Replace the agreed stack without an explicit decision.
- Introduce a new SaaS/provider because it is easier.
- Put business rules in React components.
- Access PostgreSQL directly from the browser.
- Trust client-submitted totals, prices, stock or permissions.
- Create arbitrary status strings.
- Mutate inventory without a traceable movement.
- Delete historical financial/order records when a reversible business action is required.
- Put secrets in source control.
- Disable tests to make a task pass.
- Generate the whole application in one uncontrolled change.
- Copy external repositories wholesale into the project.

## When a task is ambiguous

Stop and ask for clarification or create a proposed ADR. Do not silently choose an architecture-changing interpretation.

## External projects

External repositories may be used for research, API compatibility ideas, or isolated implementation patterns after license/security review.

No external repository becomes a trusted dependency merely because it exists on GitHub.

## Database rules

- Migrations are versioned and immutable once applied.
- Foreign keys, uniqueness, checks and indexes are deliberate.
- Financial amounts use exact representations.
- Timestamps use a consistent timezone strategy.
- Historical snapshots remain stable.
- Transaction boundaries are explicit for order, stock, cash and financial operations.

## API rules

- REST endpoints follow the documented contract.
- Validation happens server-side.
- Authorization happens server-side.
- Idempotency is required for retryable state-changing operations.
- Errors use the shared response shape.
- Webhooks verify authenticity before processing.

## Testing rules

Every important business module should eventually have:

- unit tests for pure domain rules;
- integration tests for database/business transactions;
- API/contract tests for endpoints;
- end-to-end tests for critical customer and operator journeys.

Failure paths are part of the feature, not optional extras.

## Delivery discipline

Prefer small, reviewable commits and focused vertical slices.

After each meaningful slice, report:

- what changed;
- which documents/contracts were affected;
- what tests were added/run;
- known limitations;
- any new architectural question.
