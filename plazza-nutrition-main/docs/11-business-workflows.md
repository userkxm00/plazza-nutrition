# Plazza Nutrition — Core Business Workflows v0.1

> Status: analysis/design. These workflows are the business source of truth for later API, database and UI design.

## 1. Workflow principles

1. Business state changes must be explicit and auditable.
2. Inventory, orders, POS and financial records share the same domain rules.
3. External providers must not own core business state.
4. Critical operations require transactional consistency and idempotency.
5. Failed external integrations must have safe manual fallbacks.
6. Historical commercial records must preserve the values that applied at the time of the transaction.

## 2. Online order lifecycle

### Happy path

`cart → checkout → pending → confirmed → preparing → shipped → delivered → completed`

### Cancellation/failure paths

- `pending → cancelled`
- `confirmed → cancelled` only while cancellation policy allows it.
- `preparing → cancelled` only with authorized override and explicit reason.
- `shipped → failed_delivery`
- `failed_delivery → reattempting` or `returned`
- `delivered → return_requested → return_approved → returned/partially_returned`

The exact statuses are implementation details to be finalized after state-machine review; free-form status strings are not allowed.

### Checkout transaction requirements

At order creation, the system must atomically validate:

- product/variant availability
- requested quantity
- applicable price/discount
- shipping method and destination
- shipping customer price
- order totals

The operation must be idempotent so browser retries cannot create duplicate orders.

## 3. Order confirmation

Initial order creation does not automatically mean the order is confirmed.

The order may enter `pending` and be reviewed by staff.

A confirmation action should:

1. validate customer/contact details;
2. re-check stock where necessary;
3. validate promotion rules;
4. lock/commit the required inventory reservation or deduction strategy;
5. record the confirming user and timestamp;
6. emit an internal order-confirmed event.

The exact inventory reservation model will be decided during database design.

## 4. Inventory workflow

### Purchase/receiving

`purchase draft → received → inventory increased`

When receiving batch-tracked goods, the operator may record:

- batch/lot identifier
- expiry date
- quantity
- unit cost
- supplier

### Sale

Online confirmed orders and completed POS sales must create controlled inventory movements.

Examples of movement reasons:

- `sale_online`
- `sale_pos`
- `purchase_receipt`
- `customer_return`
- `supplier_return`
- `manual_adjustment`
- `damage`
- `expiry`
- `correction`

No code should directly mutate a stock total without an underlying movement/reason.

### Batch/expiry handling

Batch and expiry tracking is enabled per product/variant where required.

For tracked inventory, stock selection should support FEFO-style behavior where appropriate: consume the earliest-expiring eligible batch first.

Expired inventory must never silently become sellable stock.

## 5. POS workflow

### Sale

`open/register session → scan/search items → cart → calculate totals → cash payment → complete sale → inventory movement → receipt`

Barcode scanners may initially operate as keyboard-like input devices. Camera scanning can be a future enhancement.

### POS session

A cashier opens a session with an opening cash balance.

During the session the system records:

- cash sales
- refunds
- approved cash expenses/withdrawals if supported
- other cash movements

At closing:

`count cash → compare expected vs actual → record variance → close session`

A closed session is immutable except through controlled correction/audit workflows.

## 6. Delivery workflow

### Provider abstraction

Core orders must not depend on ZR-specific fields beyond an integration boundary.

Conceptually:

`order ready → create shipment → provider reference/tracking → dispatch → tracking events → delivered/failed`

### ZR integration

ZR Express is the initial provider.

If API support is available and configured:

- create shipment via API;
- capture provider shipment/tracking identifiers;
- process status updates/webhooks;
- reconcile failures.

If the API is unavailable:

- staff can create/record the shipment manually;
- provider tracking number can be entered manually;
- order operations continue without corrupting core order state.

### Shipping rates

The system distinguishes:

- customer shipping price
- merchant courier cost

Admin has a `Sync shipping rates` action when a provider endpoint supports reliable rate retrieval.

Manual rate editing remains available as a fallback.

Shipping configuration must support at least:

- destination territory
- home delivery price
- stop-desk price
- active/inactive coverage

## 7. Return workflow

Returns are first-class records, not destructive edits to the original sale/order.

### Online return

`return request → review → approved/rejected → received → inspection → stock disposition → financial adjustment → closed`

The system should record:

- original order/sale
- returned item and quantity
- reason
- condition
- requested/approved amount
- inventory disposition
- authorized operator
- timestamps and history

Possible inventory disposition examples:

- `restock_sellable`
- `restock_quarantine`
- `damaged`
- `expired`
- `supplier_return`

### POS return

The cashier finds the original sale/receipt, selects eligible items, records the reason and performs the authorized refund/exchange.

Returns must update inventory and cash/financial records consistently.

## 8. Exchange workflow

An exchange must be modeled as a business operation rather than mutating an old sale.

Conceptually:

`original item returned → return accepted → replacement item sold/allocated → difference calculated → payment/refund difference → inventory movements → documents updated`

Examples:

- same-price exchange: no difference;
- higher-price replacement: collect difference;
- lower-price replacement: refund/credit difference according to policy.

## 9. Profit and financial workflow

The system distinguishes transactional facts from derived reporting.

### Order-level financial inputs

- gross selling value
- discounts
- customer shipping charge
- product cost / COGS
- merchant courier cost
- refunds/returns
- other order-level adjustments

### Business-level expenses

Examples:

- rent
- electricity
- internet
- salaries
- advertising
- packaging
- other operating expenses

### Reporting concept

The system should be able to derive views such as:

`Revenue - discounts - COGS - merchant delivery costs - refunds/returns - operating expenses = reported profit measure`

Exact accounting definitions and costing methodology must be documented before implementation. The application is an operational management system, not a certified accounting replacement.

## 10. Product profitability

Profitability should be reportable by:

- product
- variant/SKU
- order
- channel (online/POS)
- period

The historical cost used for a completed sale must not change just because the product's current cost changes.

If multiple batches/costs exist, the eventual costing method (for example batch/FEFO-based cost, weighted average, or another explicit policy) must be chosen and documented before financial reporting is implemented.

## 11. Discounts and promotions

Promotion application occurs during pricing calculation and is recorded in the order snapshot.

Promotions may be limited by:

- product/variant
- category
- minimum order value
- date/time window
- usage count
- customer eligibility
- shipping rules

Once an order is finalized, later edits to the promotion configuration must not retroactively change the historical order.

## 12. Customer account and guest checkout

Both are supported.

### Guest

`browse → checkout → order → confirmation/tracking via reference/contact`

### Account

`register/login → browse → checkout → persistent order history`

Customer identity should be linked safely without merging records based only on weak signals.

## 13. Reviews

Recommended lifecycle:

`submitted → pending moderation → approved/rejected`

Admin can globally enable/disable reviews.

When configured, reviews should support verified-purchase attribution.

## 14. Notifications

Notification delivery is asynchronous and provider-based.

Business operations should emit events such as:

- order_created
- order_confirmed
- order_shipped
- order_delivered
- order_cancelled
- return_approved

Notification providers consume these events.

A notification failure must not roll back the underlying order transaction.

Future providers may include WhatsApp, SMS and email.

## 15. Audit workflow

Sensitive operations require an audit record, including at minimum:

- price changes
- stock adjustments
- order status overrides
- returns/refunds
- expense creation/editing
- cash reconciliation
- permission changes
- integration credential/configuration changes

Audit entries should capture actor, action, target, time and relevant before/after information without storing secrets.

## 16. Cross-workflow invariants

These are hard business rules that later code must enforce:

1. A completed sale cannot disappear by deleting a product.
2. Historical order prices are immutable snapshots.
3. Historical delivery charges/costs remain tied to the transaction.
4. Inventory movements are traceable to a reason/source.
5. External provider outages cannot corrupt core business records.
6. Duplicate webhook delivery must be safe to process repeatedly.
7. Duplicate checkout requests must not create duplicate orders.
8. Unauthorized staff cannot perform sensitive financial/stock actions.
9. Closed cash sessions cannot be silently rewritten.
10. Returns must reference the original transaction whenever possible.
11. Expired tracked inventory cannot be sold as normal stock.
12. Financial reports must distinguish recorded facts from calculated/estimated values.

## 17. Open decisions before database design

1. Inventory reservation timing: at checkout, at confirmation, or at fulfillment.
2. Costing method for COGS across batches.
3. Return window and eligibility rules.
4. Refund policy for COD orders.
5. Exchange policy and price-difference handling.
6. Whether failed-delivery fees are charged to the customer/business.
7. Exact POS cash movement permissions.
8. Required invoice/receipt numbering rules.
9. Whether customer shipping prices are always manually controlled or provider-synced values can be promoted automatically.
10. Exact ZR API/webhook capabilities available to the merchant account.
