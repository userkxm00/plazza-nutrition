# Plazza Nutrition — State Machines v0.1

> Purpose: define legal state transitions before database constraints/API implementation.

## 1. Order state machine

### Primary lifecycle

`pending → confirmed → preparing → shipped → delivered → completed`

### Allowed alternate paths

- `pending → cancelled`
- `confirmed → cancelled`
- `preparing → cancelled` (authorized override only)
- `preparing → shipped`
- `shipped → failed_delivery`
- `failed_delivery → reattempting`
- `failed_delivery → returned`
- `delivered → return_requested`

### Rules

- `completed` is terminal for the original fulfillment lifecycle.
- A return/exchange is represented by a separate return/exchange record, not by changing `completed` back to an earlier sales state.
- Every transition records actor, timestamp and reason where applicable.
- Direct arbitrary jumps are forbidden.

## 2. Inventory reservation state machine

`none → reserved → committed | released`

- `reserved`: stock is committed to a confirmed order but has not yet been consumed by final fulfillment.
- `committed`: the stock movement has become a sale/fulfillment movement.
- `released`: reservation is no longer held.

A reservation cannot be committed twice. Release must be idempotent.

## 3. Shipment state machine

Provider-neutral states:

`not_created → created → dispatched → in_transit → delivered`

Failure branches:

- `created → failed`
- `dispatched → failed`
- `in_transit → failed`
- `failed → reattempting`
- `failed → returned_to_sender`

Provider-specific events are mapped into these normalized states while preserving the raw provider event for audit/debugging.

## 4. Return state machine

`requested → under_review → approved | rejected`

Approved path:

`approved → received → inspected → dispositioned → financially_settled → closed`

A return may be rejected before receipt. A record is never deleted to undo a mistake; corrections use auditable adjustments.

## 5. Exchange state machine

`requested → approved → item_returned → replacement_allocated → settled → closed`

Possible rejection/cancellation before settlement:

`requested → rejected`
`approved → cancelled`

The replacement item is inventory-controlled independently of the original returned item.

## 6. POS session state machine

`opening → open → closing → reconciled → closed`

`open → suspended` may be introduced later if operationally useful.

Rules:
- Only one active session per register/terminal unless multi-session behavior is explicitly supported.
- Cash movements after closing require a controlled correction workflow.
- Closing records expected cash, counted cash and variance.

## 7. Purchase/receiving state machine

`draft → ordered → partially_received → received`

Cancellation path:

`draft → cancelled`
`ordered → cancelled`

Receiving creates inventory movements. A received quantity must never silently appear in stock without a receiving record.

## 8. Notification delivery state machine

`queued → sending → sent`

Failure path:

`sending → failed → retrying → sent | permanently_failed`

Notification failure does not change the state of the underlying order/return/etc.

## 9. Review state machine

`pending → approved | rejected`

An approved review may later be hidden/moderated without deleting its audit history.

## 10. Coupon/promotion lifecycle

`draft → scheduled → active → expired`

Optional administrative path:

`active → disabled`

A promotion configuration change must never mutate historical order pricing.

## 11. State-machine implementation rules

1. Transition logic belongs in the domain/application layer, not in UI code.
2. Database constraints should prevent impossible states where practical.
3. APIs accept requested actions/commands rather than arbitrary target-state strings.
4. Every transition is idempotent where external retries are possible.
5. State history should be available for operationally sensitive entities.
6. Raw external provider states must not leak into core business state.
