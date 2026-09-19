# Plazza Nutrition — Architecture Draft v0.1

> **Status:** Proposed architecture for discovery. Final framework/cloud choices are intentionally deferred until the domain model and operational constraints are validated.

## 1. Architectural direction

Use a **modular monolith** for the first production release rather than microservices.

Why:

- The business is a single retailer with one current physical stock location.
- Online store, POS, inventory, delivery, returns and finance require strong transactional consistency.
- A small team needs low operational complexity.
- Module boundaries provide a path to extract a service later if a real scaling or ownership need appears.
- Microservices now would create deployment, observability, networking and data-consistency overhead without a demonstrated business benefit.

## 2. Logical system

```text
                        Customer Storefront
                              |
                              v
+-------------------------------------------------------+
|                    Application API                   |
|                                                       |
|  Catalog  Orders  Inventory  POS  Delivery  Finance  |
|  CRM      Returns Promotions  Reviews  Identity       |
+--------------------------+----------------------------+
                           |
                           v
                    Relational Database
                           |
         +-----------------+-----------------+
         |                 |                 |
     File/Object       Job/Task         Audit/Logs
      Storage           Runner          /Monitoring
         |
         +-------------------------------+
                                         |
                                  External adapters
                              /        |        \
                          ZR Express  WhatsApp   SMS
                                       (future)  (future)
```

The exact hosting/runtime can change without changing these domain boundaries.

## 3. Application modules

### Catalog
Owns products, variants, categories, brands, media metadata, pricing inputs and catalog publication state.

### Checkout & Orders
Owns cart validation, order creation, order totals, order state machine and order history.

### Inventory
Owns stock balances, movements, batches, expiry, adjustments, reservations where needed, and stock rules shared by online and POS sales.

### POS
Owns register sessions, physical sales flow, barcode-driven lookup and cash reconciliation while using the same order/inventory/finance rules as online sales.

### Purchasing
Owns suppliers, purchase documents, receiving and acquisition cost information.

### Delivery
Owns shipments, rates, coverage, provider adapters, tracking normalization and manual fallback.

### Returns
Owns return requests, approval/status, restock decisions, exchanges and financial adjustments.

### Finance
Owns payments, expenses, cash movements and reporting inputs. Profitability is derived from transactional facts and explicit costing assumptions.

### Identity & Access
Owns customer authentication boundaries, staff accounts, roles, permissions and authorization checks.

### Engagement
Owns reviews, moderation, coupons and promotions.

### Notifications
Owns notification intents/events and provider adapters. Business modules should request notifications without knowing provider-specific APIs.

## 4. Integration boundaries

External providers must sit behind interfaces/adapters.

Example conceptual interfaces:

```text
DeliveryProvider
  createShipment()
  getRates()
  trackShipment()
  cancelShipment()

NotificationProvider
  send()

PaymentProvider (future)
  createPayment()
  verifyPayment()
```

This prevents provider-specific types from spreading through the core domain.

## 5. ZR Express strategy

ZR Express is the initial delivery target.

The application should support two execution paths:

```text
Normal:
Order -> Delivery module -> ZR adapter -> provider -> webhook -> local tracking state

Fallback:
Order -> Delivery module -> manual shipment entry/update
```

If a provider exposes reliable rate data, the admin gets an explicit **Sync shipping rates** operation. Synced rates are local data and can be reviewed/edited; the store must not need a live provider request for every checkout calculation.

Provider webhooks must be authenticated according to the provider's documented mechanism and processed idempotently.

## 6. Transaction boundaries

The highest-risk operations should be handled atomically where the database supports it.

### Online sale

```text
Validate order
  -> reserve/deduct stock according to policy
  -> create order + items
  -> create payment intent/record
  -> create inventory movement(s)
  -> commit
```

### POS sale

```text
Scan/add items
  -> validate stock
  -> create sale/order
  -> create cash/payment record
  -> create inventory movement(s)
  -> commit
```

### Accepted return

```text
Validate original sale
  -> approve return items
  -> calculate financial effect
  -> restock eligible quantities
  -> create refund/credit record
  -> create inventory movement(s)
  -> commit
```

Exact reservation behavior for COD orders is an open product decision and will be specified before implementation.

## 7. Async work

Do not hold customer requests open for slow external operations where it is unnecessary.

Candidate background tasks:

- Delivery webhook processing.
- Notification sending/retry.
- Shipping-rate synchronization.
- Expiry/low-stock checks.
- Report generation for expensive reports.
- External API retries.

The database remains the source of truth; jobs should be retry-safe and idempotent.

## 8. Data ownership

The application database is the source of truth for:

- Orders and order state.
- Product catalog data used by the store.
- Inventory movements and balances.
- Returns/exchanges.
- Expenses and local cash records.
- Staff permissions/audit history.

External systems remain authoritative only for their provider-specific facts, such as courier tracking events, and those facts are normalized into local records.

## 9. Reliability requirements

Production architecture must include:

- Automated database backups.
- Restore procedure tested at least periodically.
- Versioned database migrations.
- Structured application logs.
- Error monitoring.
- Health checks for critical integrations.
- Idempotency for order creation and webhooks.
- Timeouts/retries around provider APIs.
- Circuit/failure handling so a courier outage does not take down the storefront.

## 10. Security boundaries

- Customer and staff authorization are separate concerns.
- Sensitive actions require server-side permission checks.
- Admin sessions must use secure authentication/session practices.
- Provider credentials are stored outside source control.
- Payment secrets and courier credentials are never exposed to the browser.
- Uploaded media is validated and access-controlled where appropriate.
- Financial/stock mutations produce audit records.

## 11. Deployment shape

The first production system can be deployed as:

```text
Public Storefront
        |
Application Runtime / API
        |
Relational DB
        |
Object Storage
        |
Background Worker / Scheduler
```

Admin can be a route/application in the same product or a separate frontend consuming the same API, depending on the final framework choice.

We should prefer a deployment topology that is simple enough for a solo developer to operate and document.

## 12. Explicitly rejected for v1

### Microservices-first
Rejected because service boundaries, distributed transactions and operational overhead are not justified by the current business scale.

### Provider-dependent checkout
Checkout should not require a live third-party courier or messaging API to succeed when local data is enough.

### Business logic in frontend only
All stock, pricing, permissions, order and financial rules must be enforced server-side.

### Direct database edits from arbitrary admin UI
Sensitive mutations go through domain/application logic and are auditable.

## 13. Technology selection gate

Do not finalize the stack until these are resolved:

1. Expected traffic and order volume range.
2. Merchant's exact delivery API access/capabilities.
3. Product/variant/catalog complexity.
4. Preferred deployment budget and ownership model.
5. Required Arabic/French rendering and SEO needs.
6. Reporting workload.
7. Backup/restore expectations.
8. Availability and operational support expectations.

The technology choice should optimize for correctness, maintainability, cost and developer operability—not novelty.
