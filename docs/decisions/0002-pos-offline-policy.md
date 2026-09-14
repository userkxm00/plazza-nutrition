# ADR 0002 — POS Offline Policy

## Status
Decision: V1 POS is online-first; full offline sales are not part of the initial release.

## Context
A physical POS may experience temporary Internet outages. Full offline operation would require local persistence, synchronization, conflict resolution, offline identity/security controls and careful handling of stock concurrency across devices.

The current business has one physical stock location, cash-first POS and a small operational footprint. The project should not add distributed synchronization complexity without evidence that the shop actually needs it.

## Decision
For the initial production release:

- POS requires a healthy connection to the application backend for completing sales.
- The UI should detect connectivity loss clearly and avoid pretending a sale was completed when the server did not commit it.
- Cashiers must have an operational fallback procedure for a temporary outage (for example, manual receipt/log procedure agreed with the owner).
- Local draft/cart state may be retained for usability, but drafts are not authoritative sales and must not alter stock until committed by the backend.
- The architecture must keep the POS domain sufficiently isolated that a future offline mode can be evaluated without redesigning the core sales/inventory model.

## Why not full offline V1?
A correct offline POS is not just a browser cache. It requires a synchronization protocol and explicit conflict semantics for inventory, duplicate sales, sequence/receipt numbering, permissions and recovery. That complexity is not justified until the merchant confirms a real operational requirement.

## Revisit triggers
Reconsider full offline support if the store documents repeated connectivity outages that materially interrupt POS operations, or if multiple disconnected POS devices become a normal operating pattern.

## Security / financial rule
An offline client must never be allowed to fabricate authoritative completed sales, inventory deductions or financial records merely because it has locally cached data.
