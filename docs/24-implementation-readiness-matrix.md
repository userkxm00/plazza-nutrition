# Implementation Readiness Matrix

## Purpose

This document is the final planning matrix before implementation begins. It distinguishes what is already architecturally decided from what still requires an explicit business decision or real-world validation.

The goal is to prevent the eventual coding agent from inventing business rules while still allowing it to implement approved technical foundations.

---

## 1. Status Legend

- **READY** — sufficiently decided for implementation.
- **VALIDATE** — architecture is ready, but a real business/provider fact must be confirmed before production behavior is finalized.
- **DECIDE** — explicit product/business policy is still required.
- **LATER** — intentionally deferred until after the core system works.

---

## 2. Architecture & Engineering

| Area | Status | Decision |
|---|---|---|
| Overall architecture | READY | Modular monolith |
| Web frontend | READY | Next.js + React + TypeScript |
| Backend API | READY | NestJS + TypeScript |
| Database | READY | PostgreSQL |
| ORM | READY | Drizzle |
| API style | READY | REST + OpenAPI |
| Authentication | READY | Better Auth |
| Authorization | READY | Internal RBAC with server-side enforcement |
| File storage | READY | S3-compatible object storage |
| Deployment model | READY | Managed infrastructure + Docker-compatible API deployment |
| CI/CD | READY | GitHub Actions |
| Source control | READY | GitHub repository |
| Monorepo | READY | apps / packages / database / infra / docs / research |
| Microservices | LATER | Explicitly rejected for initial version |
| Kubernetes | LATER | Explicitly rejected for initial version |

---

## 3. Commerce

| Area | Status | Decision |
|---|---|---|
| Guest checkout | READY | Supported |
| Customer accounts | READY | Supported |
| Arabic/French | READY | First-class localization with RTL/LTR |
| Product catalog | READY | Product → variants → SKUs/barcodes |
| Historical order snapshots | READY | Required |
| Server-side totals | READY | Required |
| Promotions/coupons | READY | Admin-controlled |
| Reviews | READY | Moderation and enable/disable controls |
| COD | READY | Initial payment method |
| Future payment methods | LATER | Provider abstraction only for now |
| Customer shipping charge | READY | Stored independently from merchant delivery cost |

---

## 4. Inventory

| Area | Status | Decision |
|---|---|---|
| Shared online + physical stock | READY | Single source of truth |
| Stock movements | READY | Traceable movement records |
| Inventory batches | READY | Supported |
| Expiry tracking | READY | Per product/variant where applicable |
| Expired stock | READY | Must never silently remain sellable |
| FEFO behavior | READY | Planned for expiry-tracked inventory |
| Barcode scanning | READY | Supported by data model and POS flow |
| Low-stock alerts | READY | Supported |
| Reservation timing | DECIDE | Checkout vs confirmation vs another policy |
| Inventory costing | DECIDE | FIFO / weighted average / other authoritative method |

---

## 5. Purchasing & Suppliers

| Area | Status | Decision |
|---|---|---|
| Suppliers | READY | Basic supplier records |
| Purchases | READY | Purchase + purchase items |
| Receiving | READY | Receipt creates stock movements/batches |
| Purchase history | READY | Immutable historical records |
| Full ERP procurement | LATER | Out of scope for initial product |

---

## 6. Delivery / ZR Express

| Area | Status | Decision |
|---|---|---|
| Delivery provider abstraction | READY | Required |
| ZR Express adapter | VALIDATE | Implement against actual official API contract |
| Shipment creation | VALIDATE | Confirm exact API request/response |
| Tracking | VALIDATE | Confirm webhook/API capabilities |
| Delivery status synchronization | VALIDATE | Must be idempotent |
| Shipping rate synchronization | VALIDATE | Build admin sync action only if provider exposes reliable rate data |
| Local shipping rate table | READY | Manual fallback required |
| Stop Desk vs home delivery | READY | Model as delivery mode, provider capability to be validated |
| Provider outage fallback | READY | Manual operational workflow |
| Hardcoded courier rates | NOT ALLOWED | Never use as hidden business logic |

---

## 7. POS / Cash Register

| Area | Status | Decision |
|---|---|---|
| POS | READY | First-class sales workflow |
| Barcode/search cart | READY | Supported |
| Cash payment | READY | Initial payment method |
| Cash sessions | READY | Open → transact → close/reconcile |
| Cash movements | READY | Explicit records |
| Closing reconciliation | READY | Expected vs counted cash |
| Closed-session protection | READY | No silent edits |
| Future non-cash methods | LATER | Add via payment abstraction |

---

## 8. Returns & Exchanges

| Area | Status | Decision |
|---|---|---|
| Returns | READY | First-class workflow |
| Exchanges | READY | First-class workflow |
| Inventory disposition | READY | Restock / quarantine / loss-style outcomes must be recorded |
| Refund records | READY | Required |
| Original sale/order reference | READY | Required |
| Return window | DECIDE | Merchant policy required |
| COD refund method | DECIDE | Merchant policy required |
| Exchange price difference | DECIDE | Merchant policy required |
| Failed-delivery return costs | DECIDE | Merchant policy required |

---

## 9. Finance & Profitability

| Area | Status | Decision |
|---|---|---|
| Revenue | READY | Derived from transaction facts |
| Discounts | READY | Explicitly represented |
| Product cost / COGS | READY | Separate from revenue |
| Customer-paid shipping | READY | Separate metric |
| Merchant courier cost | READY | Separate metric |
| Refunds/returns | READY | Financial impact represented |
| Operating expenses | READY | Explicit expense records |
| Cash movements | READY | Explicit records |
| Profitability reports | READY | Based on authoritative transaction data |
| Authoritative COGS method | DECIDE | Must be selected before final profit reports |
| Certified accounting | LATER | System is management/operations oriented, not a statutory accounting package |

---

## 10. Identity, Roles & Security

| Area | Status | Decision |
|---|---|---|
| Customer authentication | READY | Supported |
| Staff authentication | READY | Supported |
| RBAC | READY | Required |
| Permission checks | READY | Server-side only |
| Audit logs | READY | Required for sensitive operations |
| Rate limiting | READY | Required on sensitive/public endpoints |
| Webhook verification | VALIDATE | Must match ZR's actual signing/authentication model |
| Secrets management | READY | Outside source control |
| Financial override controls | READY | Restricted permissions + audit trail |
| Customer data in Git | NOT ALLOWED | Never commit real data |

---

## 11. Notifications

| Area | Status | Decision |
|---|---|---|
| Notification abstraction | READY | Provider-based |
| Asynchronous sending | READY | Required |
| Order status notifications | READY | Supported as events |
| WhatsApp provider | LATER/VALIDATE | Choose compliant provider later |
| SMS provider | LATER/VALIDATE | Choose provider later |
| Email provider | LATER/VALIDATE | Choose provider later |
| Notification failure behavior | READY | Must not rollback core order transaction |

---

## 12. Reporting & Operations

| Area | Status | Decision |
|---|---|---|
| Sales dashboard | READY | Planned |
| Inventory dashboard | READY | Planned |
| Profitability dashboard | READY | Planned |
| Delivery dashboard | READY | Planned |
| Returns dashboard | READY | Planned |
| POS/cash dashboard | READY | Planned |
| Audit/report exports | READY | Planned |
| Advanced BI | LATER | Not required initially |

---

## 13. Production Readiness Requirements

The coding agent may implement technical foundations, but production launch must not happen until these are validated:

1. Real ZR Express credentials and API/webhook capabilities.
2. Final shipping-rate source and fallback rules.
3. Final product catalog fields and supplement-specific attributes.
4. Reservation timing policy.
5. Inventory costing method.
6. Return/refund/exchange policies.
7. Failed-delivery financial treatment.
8. Invoice/receipt numbering requirements.
9. Staff roles and exact permissions after observing actual shop operations.
10. Legal/accounting requirements that apply to the merchant.
11. Production ownership, billing, domains, email, storage and database accounts under the client's control.
12. Backup restore test and operational runbook.
13. Security review and production smoke test.

---

## 14. Rule for the Coding Agent

When an item is marked **READY**, implementation may proceed according to the approved architecture.

When an item is marked **VALIDATE**, the agent must build an adapter/interface or safe placeholder where appropriate, but must not fabricate provider behavior.

When an item is marked **DECIDE**, the agent must stop before encoding the business rule and request or record the explicit decision.

When an item is marked **LATER**, the agent must not add speculative complexity merely because the future capability has been mentioned.

This matrix is intentionally strict. The project should prefer an explicit decision and a simple correct implementation over an impressive but invented feature.
