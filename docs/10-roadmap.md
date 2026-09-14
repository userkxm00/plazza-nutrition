# Plazza Nutrition — Roadmap

## Phase 0 — Discovery & architecture

- Finalize business workflows.
- Confirm product/variant model.
- Confirm stock, batch and expiry rules.
- Confirm POS and cash-register workflows.
- Confirm return/exchange policy.
- Validate ZR Express API capabilities and merchant requirements.
- Define domain model and invariants.
- Choose final stack using documented ADRs.

**Exit:** approved requirements + architecture + database design.

## Phase 1 — Production core

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

### Commerce backend
- Products/categories/brands/variants
- Orders/order items
- Customer profiles
- Inventory movements
- Basic promotions/coupons
- Reviews and moderation

### Admin
- Orders
- Products
- Inventory
- Customers
- Reviews
- Basic dashboard

**Exit:** real end-to-end online order can be created, processed and reflected in inventory.

## Phase 2 — Delivery operations

- ZR Express integration adapter.
- Shipment creation.
- Tracking synchronization/webhooks where available.
- Home vs stop-desk delivery.
- Shipping-rate sync action where API supports it.
- Manual rate override and fallback.
- Manual dispatch fallback.
- Delivery cost vs customer shipping price separation.

**Exit:** an order can move from confirmed to delivery using either integrated or controlled manual fallback workflows.

## Phase 3 — Physical shop / POS

- Barcode scanning.
- POS sales.
- Shared inventory.
- Cash register opening/closing.
- Cash reconciliation.
- Printable receipts.
- POS returns/exchanges.

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

## Phase 7 — Optional integrations

- WhatsApp notifications.
- SMS notifications.
- Email notifications.
- CCP / BaridiMob / other payment methods.
- Additional courier providers.
- Meta Pixel/CAPI and advanced marketing attribution.

These should be added behind provider boundaries and feature flags/settings where appropriate.

## Phase 8 — Production operations

- Production deployment.
- CI/CD.
- Monitoring.
- Structured logs.
- Error tracking.
- Database backups.
- Restore documentation and test.
- Incident/runbook documentation.
- Domain/DNS/TLS setup under the client's ownership.

## Definition of production-ready

The system should not be presented as production-ready until:

- Critical order/inventory/financial flows have automated tests.
- Authorization is tested.
- Webhook/idempotency behavior is tested.
- Backup and restore have been verified.
- Production secrets are externalized.
- Monitoring/error handling exists.
- Known limitations are documented.
- The client has a documented operational procedure for orders, returns, stock and cash reconciliation.
