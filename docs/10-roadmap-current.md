# Plazza Nutrition — Current Roadmap

> Canonical roadmap after the external architecture review and internal reconciliation. The older `docs/10-roadmap.md` is retained as historical draft because the GitHub contents endpoint reported a revision conflict while replacing it.

## Phase 0 — Discovery & architecture

- Finalize business workflows.
- Confirm product/variant model.
- Confirm stock, batch and expiry rules.
- Confirm POS and cash-register workflows.
- Confirm initial POS offline policy: V1 is online-first (ADR 0002).
- Confirm return/exchange policy.
- Validate ZR Express API capabilities and merchant requirements.
- Define administrative geography dataset (wilayas/communes) separately from courier coverage.
- Define webhook ingress/idempotency model.
- Compare build-vs-buy options and record the decision (ADR 0001).
- Define domain model and invariants.
- Choose final stack using documented ADRs.

**Exit:** approved requirements + architecture + database design + explicit open decisions.

## Phase 1 — Production core / first operational release

### Storefront
- Home/catalog/search/filtering
- Product details
- Cart
- Guest checkout
- Account registration/login
- COD checkout
- Order confirmation/tracking
- French/Arabic + RTL/LTR
- Mobile-first UX
- Structured Wilaya → Commune destination selection from the current authoritative geography dataset

### Commerce backend
- Products/categories/brands/variants
- Orders/order items
- Customer profiles
- Inventory movements
- Basic promotions/coupons
- Reviews and moderation where required for launch
- Provider-free internal new-order notification in the admin/dashboard

### Admin
- Orders
- Products
- Inventory
- Customers
- Reviews
- Basic dashboard
- System settings foundation

### Operational foundations
- Staging environment from early implementation.
- CI checks and migrations under version control.
- Automated tests for critical order/inventory flows before release.

**Exit:** a real end-to-end online order can be created, processed and reflected in inventory, with the release path validated in staging. Production is enabled only after the operational acceptance gate is passed.

## Phase 2 — Delivery operations

- ZR Express integration adapter.
- Secure webhook ingress and idempotent processing.
- Shipment creation.
- Tracking synchronization/webhooks where available.
- Home vs stop-desk delivery.
- Shipping-rate sync action where API supports it.
- Manual rate override and fallback.
- Manual dispatch fallback.
- Delivery cost vs customer shipping price separation.
- Provider coverage mapped independently from administrative geography.

**Exit:** an order can move from confirmed to delivery using either integrated or controlled manual fallback workflows without provider-specific state leaking into the core order model.

## Phase 3 — Physical shop / POS

- Barcode scanning.
- Barcode assignment/generation and basic label-printing support where needed.
- POS sales.
- Shared inventory.
- Cash register opening/closing.
- Cash reconciliation.
- Printable receipts.
- POS returns/exchanges.

V1 POS is online-first. Full offline synchronization is explicitly out of scope until a real business requirement is demonstrated.

**Exit:** online and physical sales use one authoritative inventory and financial domain.

## Phase 4 — Inventory & purchasing

- Suppliers.
- Purchases/receiving.
- Batch/lot tracking where applicable.
- Expiry dates.
- FEFO-oriented workflows/alerts where appropriate.
- Low-stock alerts.
- Stock adjustments with audit.
- Barcode management.

**Exit:** inventory lifecycle is traceable from purchase to sale/return/adjustment.

## Phase 5 — Finance & profitability

- Product/variant margin reporting.
- COGS/costing model.
- Delivery cost.
- Discounts and returns impact.
- Expense management.
- Cash register reconciliation.
- Revenue/profit dashboards.
- Period/date/channel/product reporting.

**Exit:** owner can understand operational profitability using explicit, documented calculations.

## Phase 6 — Staff & security hardening

- Users.
- Roles.
- Granular permissions.
- Audit logs.
- Session/security hardening.
- Rate limiting and abuse controls.
- Backups and restore drills.
- Operational alerts and KPI baseline.

## Phase 7 — Optional integrations

- WhatsApp notifications.
- SMS notifications.
- Email notifications.
- CCP / BaridiMob / other payment methods.
- Additional courier providers.
- Meta Pixel/CAPI and advanced marketing attribution.

These should be added behind provider boundaries and feature flags/settings where appropriate.

## Phase 8 — Production operations & hardening

Phase 8 is **not** the first deployment. Staging/CI/CD and a controlled production release path start earlier. Phase 8 focuses on operational maturity:

- Production hardening.
- CI/CD improvements and release controls.
- Monitoring.
- Structured logs.
- Error tracking.
- Database backups.
- Restore documentation and repeated restore verification.
- Incident/runbook documentation.
- Domain/DNS/TLS setup under the client's ownership.
- Performance tuning based on real telemetry.
- Operational KPI review and reliability improvements.

## Definition of production-ready

The system should not be presented as production-ready until:

- Critical order/inventory/financial flows have automated tests.
- Authorization is tested.
- Webhook/idempotency behavior is tested before external webhooks are enabled.
- Backup and restore have been verified.
- Production secrets are externalized.
- Monitoring/error handling exists.
- Known limitations are documented.
- Geography data source/version is recorded.
- The client has a documented operational procedure for orders, returns, stock and cash reconciliation.
- The client has accepted the operational workflow and owns production infrastructure/accounts.

## Scope-control rule

The roadmap may add supporting controls when they protect correctness or operations, but it must not expand into generic ERP functionality without a new business decision. Batch/expiry remains supported because it is material to the supplement business; it is applied where the product actually requires it rather than universally.
