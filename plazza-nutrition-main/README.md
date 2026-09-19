# Plazza Nutrition

Production-oriented e-commerce and business management platform for an Algerian sports nutrition retailer.

> **Project status:** Discovery & architecture — no production code yet.

## Product vision

Plazza Nutrition is not just an online storefront. The target system is a unified commerce platform connecting:

- Customer storefront
- Physical-store POS / caisse
- Inventory and batch/expiry management
- Orders and COD operations
- Delivery operations (starting with ZR Express)
- Purchases and suppliers
- Returns and exchanges
- Expenses, cash management, revenue and profitability
- Customer accounts and CRM foundations
- Staff roles and granular permissions
- Reviews, coupons and promotions
- Notification providers (future WhatsApp/SMS/email integrations)
- Reporting, audit logs, backups and operational observability

## Business context

Current sales are primarily handled through Instagram and WhatsApp. Orders are confirmed manually and then dispatched through ZR Express. The store has physical stock and a physical shop, while delivery prices differ by destination and by home delivery vs stop-desk delivery.

The platform must centralize the business without making production operations dependent on a single third-party provider.

## Core principles

1. **Business-first:** requirements and workflows come before technology choices.
2. **Production-minded:** no demo-only architecture for production data.
3. **Single source of truth:** online orders, POS sales, inventory and financial records use shared domain rules.
4. **Provider isolation:** external services live behind integration/provider boundaries.
5. **Manual fallback:** critical operations must remain usable when an external API is unavailable.
6. **Auditability:** financial, stock and permission-sensitive operations are traceable.
7. **Recoverability:** backups, migrations and restore procedures are first-class concerns.
8. **Mobile-first storefront:** a large share of traffic is expected to originate from social media on phones.
9. **Bilingual:** French and Arabic with RTL/LTR support; language should be user-switchable even when auto-detected.
10. **Incremental delivery:** build a production-ready core before optional advanced features.

## Key decisions captured so far

### Commerce
- Guest checkout and customer accounts are both supported.
- COD is the current payment method.
- Payment architecture should allow future CCP and BaridiMob support.
- Reviews can be enabled/disabled by admin and moderated.
- Coupons/promotions are admin-controlled.

### Inventory
- One physical shop / stock location currently.
- Products may or may not track batches and expiry dates.
- Batch-aware inventory is required where applicable.
- Expiry/low-stock alerts should be supported.
- Barcode scanning is desired for stock/POS workflows.
- Purchase/supplier support should exist without turning the product into a full ERP.

### POS
- Physical-store sales must share inventory and financial rules with online sales.
- Current in-store payment is cash.
- Future payment methods must be addable without redesigning core sales logic.

### Delivery
- ZR Express is the initial courier integration target.
- Customer shipping price and merchant courier cost are separate concepts.
- Admin should be able to manage home/stop-desk pricing and territories.
- If the provider exposes usable rate data, the admin should have a **Sync shipping rates** action; manual editing remains a fallback.
- Shipment creation/tracking should support API integration where available and manual operations where it is not.

### Returns & exchanges
- Returns/exchanges are core requirements.
- Returned quantities must affect inventory correctly.
- Financial impact must be represented in reporting.
- Workflow must support approval/status/history rather than a simple refund button.

### Finance
- Revenue, discounts, product cost, delivery cost, refunds/returns and operating expenses must be distinguishable.
- Profitability should be reportable per product/variant and for broader periods.
- Cash register reconciliation is required for the physical shop.
- Accounting terminology will be defined carefully; the product should not pretend to replace a certified accounting system.

### Notifications
- Notification infrastructure should be provider-based so WhatsApp/SMS/email can be introduced later.
- Candidate open-source projects have been identified for research, but no provider is a production dependency yet.

## Planned documentation

- `docs/01-business-analysis.md` — business model, actors, problems, goals
- `docs/02-requirements.md` — functional and non-functional requirements
- `docs/03-domain-model.md` — entities and business concepts
- `docs/04-architecture.md` — system architecture and boundaries
- `docs/05-database-design.md` — schema design and integrity rules
- `docs/06-integrations.md` — ZR, notifications, future payments
- `docs/07-security.md` — auth, RBAC, audit, secrets, abuse controls
- `docs/08-testing-strategy.md` — unit/integration/E2E strategy
- `docs/09-deployment.md` — environments, CI/CD, backups, recovery
- `docs/10-roadmap.md` — phased delivery plan
- `docs/decisions/` — Architecture Decision Records (ADRs)
- `research/` — researched external services, repositories and API notes

## Suggested repository workflow

- `main` stays stable.
- Feature work happens in focused branches.
- Architectural decisions are documented before irreversible implementation choices.
- No credentials, production secrets, customer data or private business exports are committed.

## Immediate next step

Complete the discovery and domain model before selecting the final framework/database/cloud stack or writing application code.
