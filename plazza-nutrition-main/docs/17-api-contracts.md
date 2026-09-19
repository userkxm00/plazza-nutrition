# Plazza Nutrition — API Contract v0.1

> Status: architecture/design. This contract defines the external API surface before implementation. Paths and payloads are intentionally framework-neutral.

## 1. API principles

- REST over HTTPS for application APIs.
- JSON request/response bodies except file-upload endpoints.
- API versioning under `/api/v1`.
- Server owns business rules; clients never supply authoritative totals, stock, profit, status transitions, or permissions.
- Sensitive mutations require authentication + authorization + audit where applicable.
- Financial and stock mutations execute inside appropriate database transactions.
- Idempotency is required for retryable mutations that can create money/order/stock effects.
- External provider webhooks are verified and processed idempotently.
- Errors use one predictable envelope.

## 2. Standard response shapes

### Success

```json
{
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "error": {
    "code": "ORDER_OUT_OF_STOCK",
    "message": "One or more requested items are unavailable.",
    "details": {}
  },
  "requestId": "..."
}
```

Do not expose stack traces, SQL errors, secrets, provider credentials, or internal implementation details.

## 3. Idempotency

Mutation endpoints that create an order, payment, refund, shipment, return, exchange, or other externally visible financial/stock effect accept an `Idempotency-Key` header where appropriate.

The backend stores the request fingerprint and final response/result for a bounded retention period. Repeating the same key with the same request returns the original result; reusing a key with a materially different request is rejected.

## 4. Authentication and authorization

Separate customer and staff authorization contexts.

Examples:

- `customer` session/token for account operations.
- `staff` session/token for admin/POS/operations.
- server-side permission checks for every sensitive endpoint.

Never trust a client-provided role, price, cost, user id, or permission.

## 5. Catalog API

### Public

`GET /api/v1/products`

Filters may include category, brand, search query, availability, price range, and pagination cursor.

`GET /api/v1/products/:slug`

Returns customer-safe product and variant information.

`GET /api/v1/categories`

`GET /api/v1/brands`

### Staff

`POST /api/v1/admin/products`

`PATCH /api/v1/admin/products/:id`

`POST /api/v1/admin/products/:id/archive`

`POST /api/v1/admin/products/:id/images`

`POST /api/v1/admin/variants`

`PATCH /api/v1/admin/variants/:id`

`POST /api/v1/admin/barcodes`

Cost price and internal inventory data are never exposed by public catalog endpoints.

## 6. Customer API

`POST /api/v1/customers`

`GET /api/v1/me`

`PATCH /api/v1/me`

`GET /api/v1/me/orders`

`GET /api/v1/me/orders/:id`

`GET /api/v1/me/addresses`

`POST /api/v1/me/addresses`

`PATCH /api/v1/me/addresses/:id`

Guest checkout remains supported without requiring a customer account.

## 7. Cart and pricing API

`POST /api/v1/carts`

`GET /api/v1/carts/:id`

`POST /api/v1/carts/:id/items`

`PATCH /api/v1/carts/:id/items/:itemId`

`DELETE /api/v1/carts/:id/items/:itemId`

`POST /api/v1/carts/:id/apply-coupon`

`POST /api/v1/carts/:id/remove-coupon`

`POST /api/v1/checkout/quote`

The quote endpoint recalculates:

- product prices
- variant availability
- discounts
- shipping method
- destination
- customer shipping price
- total

Client-provided subtotal/total values are ignored.

## 8. Order API

`POST /api/v1/orders`

Creates a pending COD order after server-side validation.

Required server checks include:

- valid products/variants
- stock availability according to reservation policy
- current price
- promotions
- shipping destination/method
- final total calculation
- idempotency

`GET /api/v1/orders/:id`

Customer-safe order view where authorization permits.

### Staff actions

`GET /api/v1/admin/orders`

`GET /api/v1/admin/orders/:id`

`POST /api/v1/admin/orders/:id/confirm`

`POST /api/v1/admin/orders/:id/cancel`

`POST /api/v1/admin/orders/:id/prepare`

`POST /api/v1/admin/orders/:id/mark-ready`

Status transitions are enforced by the domain state machine. The API cannot arbitrarily assign any status string.

## 9. Delivery API

`POST /api/v1/admin/shipments`

Creates shipment through the configured provider or a manual fallback workflow.

`GET /api/v1/admin/shipments/:id`

`POST /api/v1/admin/shipments/:id/retry`

`POST /api/v1/admin/shipments/:id/manual-tracking`

`GET /api/v1/admin/delivery/providers`

`GET /api/v1/admin/delivery/coverage`

`GET /api/v1/admin/delivery/rates`

`POST /api/v1/admin/delivery/providers/zr/sync-rates`

`POST /api/v1/webhooks/delivery/zr`

The webhook endpoint must verify authenticity according to the provider's documented mechanism and deduplicate repeated events.

Customer shipping price and merchant courier cost remain separate fields throughout the domain.

## 10. Inventory API

`GET /api/v1/admin/inventory`

`GET /api/v1/admin/inventory/:variantId`

`GET /api/v1/admin/inventory/movements`

`POST /api/v1/admin/inventory/adjustments`

`GET /api/v1/admin/inventory/batches`

`POST /api/v1/admin/inventory/batches`

Adjustments require reason + authorized staff identity. Direct arbitrary stock overwrites are forbidden at the business layer.

## 11. Purchasing API

`GET /api/v1/admin/suppliers`

`POST /api/v1/admin/suppliers`

`GET /api/v1/admin/purchases`

`POST /api/v1/admin/purchases`

`POST /api/v1/admin/purchases/:id/receive`

Receiving may create/update batch records and inventory movements atomically.

## 12. POS API

`POST /api/v1/admin/pos/sessions/open`

`GET /api/v1/admin/pos/sessions/:id`

`POST /api/v1/admin/pos/sales`

`GET /api/v1/admin/pos/sales/:id`

`POST /api/v1/admin/pos/sales/:id/return`

`POST /api/v1/admin/pos/sales/:id/exchange`

`POST /api/v1/admin/pos/sessions/:id/close`

`GET /api/v1/admin/pos/sessions/:id/reconciliation`

POS sales use the same inventory and financial domain rules as online orders.

## 13. Returns and exchanges API

`POST /api/v1/admin/returns`

`GET /api/v1/admin/returns`

`GET /api/v1/admin/returns/:id`

`POST /api/v1/admin/returns/:id/approve`

`POST /api/v1/admin/returns/:id/reject`

`POST /api/v1/admin/returns/:id/receive`

`POST /api/v1/admin/returns/:id/complete`

`POST /api/v1/admin/exchanges`

`POST /api/v1/admin/exchanges/:id/complete`

Return and exchange endpoints operate on the original transaction and create explicit financial/inventory effects. They do not mutate historical sale rows destructively.

## 14. Finance API

`GET /api/v1/admin/expenses`

`POST /api/v1/admin/expenses`

`PATCH /api/v1/admin/expenses/:id`

`GET /api/v1/admin/cash-registers`

`POST /api/v1/admin/cash-registers/:id/movements`

`POST /api/v1/admin/cash-registers/:id/reconcile`

`GET /api/v1/admin/reports/sales`

`GET /api/v1/admin/reports/profit`

`GET /api/v1/admin/reports/products`

`GET /api/v1/admin/reports/inventory`

Reports are derived from transactional facts plus explicit costing/financial rules. They must expose the reporting period and relevant calculation assumptions.

## 15. Promotions and reviews API

`POST /api/v1/admin/coupons`

`PATCH /api/v1/admin/coupons/:id`

`POST /api/v1/admin/promotions`

`PATCH /api/v1/admin/promotions/:id`

`POST /api/v1/products/:id/reviews`

`GET /api/v1/products/:id/reviews`

`POST /api/v1/admin/reviews/:id/approve`

`POST /api/v1/admin/reviews/:id/reject`

Review visibility can be globally disabled by settings while preserving historical review records.

## 16. Staff / RBAC API

`GET /api/v1/admin/staff`

`POST /api/v1/admin/staff`

`PATCH /api/v1/admin/staff/:id`

`GET /api/v1/admin/roles`

`POST /api/v1/admin/roles`

`PATCH /api/v1/admin/roles/:id`

`GET /api/v1/admin/permissions`

Sensitive permission changes require audit logging and should be protected against self-escalation.

## 17. Settings API

`GET /api/v1/admin/settings`

`PATCH /api/v1/admin/settings`

Settings are grouped by domain (store, checkout, delivery, reviews, notifications, localization, POS, finance). Secret credentials are never returned to ordinary UI clients after initial write.

## 18. Notifications API

Application code emits internal domain events rather than directly calling WhatsApp/SMS/email providers.

Provider-facing processing is asynchronous.

Candidate internal events:

```text
order.created
order.confirmed
order.shipped
order.delivered
order.cancelled
return.approved
return.completed
```

Public notification endpoints are not required for the storefront in the initial release.

## 19. Webhook rules

All provider webhooks must:

1. authenticate the request;
2. parse/validate the event;
3. identify the provider event id when available;
4. deduplicate;
5. update local integration state and domain state through controlled transitions;
6. record processing outcome;
7. return a provider-appropriate acknowledgement.

Business logic must not depend on receiving the same event exactly once.

## 20. Pagination, filtering and sorting

Collection endpoints use cursor pagination where practical.

Response metadata should expose enough information for continuation without relying on unstable offset pagination for high-volume operational tables.

Sort/filter parameters are allow-listed per endpoint; arbitrary SQL/order expressions are never passed through.

## 21. Concurrency and transactions

Examples of operations requiring strong transaction boundaries:

- creating a confirmed sale and decrementing stock;
- receiving a purchase and increasing stock;
- completing a return and applying restock/refund effects;
- closing a POS session and recording reconciliation;
- applying an exchange and calculating the difference;
- assigning a shipment after order readiness when local state must stay consistent.

Long-running provider calls must not hold database transactions open unnecessarily. Use durable state + retryable jobs when external I/O is involved.

## 22. API versioning and compatibility

The initial public application API is `/api/v1`.

Backward-incompatible changes require a new version or a deliberate migration strategy. Internal module APIs may evolve without public versioning when not exposed outside the application.

## 23. OpenAPI

The backend should publish an OpenAPI specification generated from the source contract/decorators/schema definitions. The generated document is a build artifact and should be validated in CI.

## 24. Contract testing

At minimum, contract tests should cover:

- order creation totals;
- authorization failures;
- invalid state transitions;
- idempotent mutation replay;
- duplicate webhook replay;
- inventory conflict handling;
- return/exchange totals;
- report calculation boundaries;
- pagination/filter validation.
