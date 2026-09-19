# Plazza Nutrition — Decision Resolution v0.1

> Status: provisional architecture/business decisions. These choices are the baseline for database design. Any change after schema implementation must be recorded as an ADR/migration decision.

## 1. Inventory reservation timing

### Decision
Reserve stock when an online COD order is **confirmed**, not when the cart/checkout form is first submitted.

### Rationale
- COD checkout does not represent a committed sale until staff validates the order.
- Reserving at checkout would let abandoned/unconfirmed orders lock stock unnecessarily.
- Reserving only at fulfillment creates a race where two confirmed orders can compete for the same stock.

### Model
Use a distinct concept between available stock and reserved stock.

Conceptually:

`on_hand = physical sellable quantity`
`reserved = quantity committed to confirmed-but-not-finalized orders`
`available = on_hand - reserved`

POS sales and other immediate stock-consuming operations should transact against available inventory atomically.

### Release rules
Reservation is released when the order is cancelled, expires under a future reservation policy, or is otherwise moved to a state where stock is no longer committed.

Delivery failure does not automatically mean the stock was sold; the order remains subject to the return/re-attempt workflow.

## 2. Costing method / COGS

### Decision
Use **batch-aware historical unit cost** where batch tracking exists, with FEFO-oriented allocation for expiry-tracked products. For products without batch tracking, keep an explicit historical unit cost on the sale line.

### Rationale
Plazza sells products with different purchase costs and possible expiry dates. The financial system must preserve the cost that applied to the sold inventory rather than reading today's product cost.

### Important distinction
`Product.cost_price` is an operational current/default value. It is **not** the authoritative historical COGS value for completed sales.

The authoritative transaction record must capture the actual allocated cost.

### Future flexibility
The inventory ledger should allow a later switch to weighted-average costing if business/accounting requirements justify it. Costing policy must remain explicit rather than hidden inside reports.

## 3. Return window and eligibility

### Decision
Start with a **configurable return policy** rather than hardcoding a number of days.

Default policy for the first business validation draft: returns are accepted only when explicitly allowed by the store policy, product type, condition and order status.

### Rationale
Supplements can have consumable/safety characteristics, so the system must not assume every product can be returned after opening or partial use.

### Required policy fields
- return enabled/disabled
- maximum days after delivery/sale
- allowed reasons
- condition requirements
- opened/used product rule
- excluded categories/products
- refund eligibility
- exchange eligibility

The owner/admin controls the business policy; the application enforces the configured rules.

## 4. COD refund policy

### Decision
COD refunds are **not automatic**. A return/refund must pass an approval workflow and record how the money is settled.

### Supported future settlement methods
- cash refund at shop
- cash settlement/authorized refund workflow for returned deliveries
- future digital refund mechanisms when supported

The database must not assume a card-style automatic refund exists for COD.

## 5. Exchange policy

### Decision
Exchange is a first-class operation linked to the original sale/return.

### Rules
- Same value: no payment difference.
- Higher replacement value: collect difference.
- Lower replacement value: refund/store-credit difference according to policy.
- Original item must pass return eligibility checks.
- Inventory movements for returned and replacement items are recorded separately.
- Historical original sale is never rewritten.

## 6. Failed-delivery charges

### Decision
Model courier cost and customer delivery charge independently and make failed-delivery financial treatment configurable.

### Why
The courier may charge the merchant for an attempted delivery/return, while the merchant's customer-facing policy may differ.

Required configuration/reporting concept:

- merchant courier charge
- customer charge (if any)
- absorbed business cost
- recovered amount
- return/reattempt cost

## 7. POS cash permissions

### Decision
Cash operations are permission-protected.

Baseline permissions:
- `pos.open_session`
- `pos.sell`
- `pos.discount`
- `pos.refund`
- `pos.cash_in`
- `pos.cash_out`
- `pos.close_session`
- `pos.reconcile`
- `pos.override`

Sensitive overrides require elevated permission and an audit record.

## 8. Receipt/invoice numbering

### Decision
Use server-generated sequential business document numbers with configurable prefixes and period-safe uniqueness.

Examples:
- `INV-2026-000001`
- `POS-2026-000001`
- `RET-2026-000001`

The internal database UUID/ID remains separate from the human-facing document number.

Numbers must never be regenerated because an order was edited, retried, or re-rendered.

## 9. Shipping-rate synchronization

### Decision
Provider-synced rates are **imported into a local configuration layer**. They are not used live for every checkout request.

Admin flow:

`Sync shipping rates → preview changes → review → publish/apply`

### Rationale
- Checkout should remain available if the courier API is unavailable.
- Admin needs visibility before prices change.
- Customer-facing price may intentionally differ from merchant courier cost.
- Historical orders must remain unchanged.

The system should support both `provider cost` and `customer price` per delivery option/territory.

## 10. ZR integration capability

### Decision
ZR Express is an integration boundary, not part of the core domain model.

The implementation will support:
- API shipment creation when credentials/capabilities permit;
- webhook/status ingestion when supported;
- provider reference/tracking storage;
- reconciliation and error logging;
- manual shipment creation and tracking as fallback.

Exact endpoint capabilities must be verified against the merchant's actual ZR account and current API documentation before production integration is finalized.

## 11. Guest/customer identity

### Decision
Guest checkout is first-class. Guest orders are retained independently and may later be safely linked to a customer account after verified ownership, but the system must not merge accounts using phone/name alone without a reliable verification rule.

## 12. Financial terminology

### Decision
The UI will distinguish:
- revenue/sales
- discounts
- COGS
- customer shipping revenue
- merchant delivery cost
- refunds/returns
- operating expenses
- cash movements
- calculated profit measures

The product will not label every calculated figure as legal/accounting "net profit" unless the definition is documented.

## 13. Consequences for schema design

The database will need first-class concepts for at least:

- products / variants / SKUs
- inventory balances
- inventory movements
- inventory batches/lots
- reservations
- purchases / suppliers / receiving
- orders / order items
- payments / payment records
- POS sessions / cash movements
- delivery shipments / provider events
- returns / return items
- exchanges
- expenses
- promotions / coupons
- customers / addresses
- users / roles / permissions
- reviews
- notifications / delivery attempts
- audit events
- business documents / numbering

No schema should be created from UI pages alone; it must preserve these domain facts and invariants.
