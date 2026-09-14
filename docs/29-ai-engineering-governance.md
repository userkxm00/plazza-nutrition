# Plazza Nutrition — AI Engineering Governance

## Status
Approved for implementation.

## Purpose

Define how AI coding agents must work on Plazza Nutrition without silently changing architecture, inventing business rules, or reducing production correctness.

This document is project-specific. It may use proven patterns from external governance projects such as Tribunal Kit, but Plazza does not depend on Tribunal Kit as a runtime dependency.

## 1. Core principle

The AI coding agent is an implementation engineer, not the architecture owner or business owner.

The repository documentation, ADRs, approved business decisions, tests, and human approvals form the source of truth.

## 2. Required execution lifecycle

For every non-trivial task:

```text
Task
  ↓
Read relevant docs / ADRs
  ↓
Check for ambiguity or conflicts
  ↓
Plan the smallest coherent change
  ↓
Implement
  ↓
Run deterministic checks
  ↓
Run targeted domain/security/database/API review
  ↓
Human approval gate for consequential changes
  ↓
Commit / merge
  ↓
Report evidence and limitations
```

A complex change must not be treated as a single unrestricted code-generation prompt.

## 3. Clarification gate

Before changing consequential business behavior, the agent must verify:

- relevant requirements;
- relevant state machines;
- relevant ADRs;
- database invariants;
- security constraints;
- existing tests.

If the requested behavior conflicts with an approved decision or remains materially ambiguous, the agent must stop and surface the conflict rather than inventing a rule.

## 4. Review roles

Reviews should be lightweight and proportional to the change. The following reviewer responsibilities are recommended:

### Architecture reviewer
Checks module boundaries, stack decisions, provider isolation, and accidental architectural drift.

### Business/domain reviewer
Checks state transitions, approved business policies, historical snapshots, and domain invariants.

### Database reviewer
Checks migrations, constraints, transactions, indexes, locking, data ownership, and backward compatibility.

### Security reviewer
Checks authentication, authorization, secrets, validation, injection risks, webhook verification, CSRF/session concerns, and privilege escalation.

### Finance/inventory reviewer
Required for changes involving money, stock, COGS, returns, exchanges, cash sessions, or profitability.

### API/integration reviewer
Checks API contracts, idempotency, provider boundaries, retries, error handling, and external dependency isolation.

### Test reviewer
Checks whether tests prove the intended behavior and cover critical failure/edge cases.

### Complexity/minimalism reviewer
Checks whether the change introduces unnecessary abstractions, dependencies, services, or generic ERP functionality.

These can be implemented as human review checklists, agent prompts, CI checks, or future automated review tooling. They do not require a multi-agent runtime.

## 5. Hard prohibitions

The coding agent must not:

- change the approved stack without an ADR;
- introduce microservices or Kubernetes without an ADR;
- add SaaS providers without approval;
- invent courier rates, business policies, or legal rules;
- trust client-provided totals, stock, discounts, costs, or permissions;
- mutate stock without traceable inventory movements;
- rewrite historical order/financial facts;
- bypass versioned migrations;
- disable or weaken tests to make CI pass;
- commit secrets, credentials, or real customer data;
- copy external repositories wholesale;
- silently broaden project scope into generic ERP capabilities.

## 6. Evidence before acceptance

A consequential change should not be accepted based on generated code alone.

Minimum evidence may include:

- passing type/lint checks;
- relevant unit/integration tests;
- migration validation;
- API contract checks where applicable;
- security checks where applicable;
- manual acceptance for important UI or operational flows;
- review notes for money/stock/provider changes.

## 7. Human approval gates

Human review is mandatory before merging changes that materially affect:

- money or profitability;
- inventory reservation/deduction;
- returns/refunds/exchanges;
- authentication or authorization;
- staff permissions;
- database migrations with destructive or hard-to-reverse effects;
- external provider contracts;
- production infrastructure or secrets;
- legal/accounting behavior.

## 8. External governance tooling

Projects such as Tribunal Kit may be used as references or optional development tooling.

They must not become an implicit source of truth for Plazza architecture or business rules.

Any adopted tooling must be:

- license-compatible;
- understood by the team;
- reproducible locally/CI;
- isolated from core business correctness;
- removable without redesigning the application.

## 9. Vertical-slice reporting

After each vertical slice, the agent must report:

- files changed;
- migrations added;
- tests added and results;
- architectural decisions involved;
- business rules referenced;
- assumptions made;
- security/reliability impact;
- known limitations;
- next proposed slice.

## 10. Failure behavior

If reviewers disagree or an important check fails:

```text
Do not hide the failure.
Do not weaken the rule.
Do not bypass the test.
Stop → explain → correct or request a decision.
```

For repeated failed attempts, the agent should escalate to human review rather than endlessly rewriting code.

## 11. Initial implementation standard

The governance process applies immediately to bootstrap and the first catalog vertical slice.

The goal is not to create dozens of agents for every task. The goal is to make every consequential AI-generated change traceable, reviewable, testable, and consistent with the approved Plazza specification.
