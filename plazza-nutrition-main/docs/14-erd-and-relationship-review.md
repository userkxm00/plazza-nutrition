# Plazza Nutrition — ERD & Relationship Review v0.1

> Status: design review. This document validates entity cardinalities and identifies edge cases before physical SQL/ORM schema work.

## 1. ERD overview

```text
Brand ───────────────< Product >────────────── Category
                          │
                          ├────────< ProductVariant
                          │                 │
                          │                 ├────────< ProductBarcode
                          │                 ├────────< StockItem
                          │                 └────────< InventoryBatch
                          │
                          └────────< ProductImage

Supplier ─────────────< Purchase ─────────────< PurchaseItem
                                                │
                                                └────> ProductVariant

Customer ────────────< CustomerAddress
   │
   ├────────────────< Cart ───────────────< CartItem ─────> ProductVariant
   │
   └────────────────< Order ──────────────< OrderItem ─────> ProductVariant
                         │
                         ├────────< OrderStatusHistory
                         ├────────0..1 Shipment ───────────> DeliveryProvider
                         │                         │
                         │                         └──────< TrackingEvent
                         │
                         ├────────< Return ───────────────< ReturnItem
                         │             │
                         │             └────────0..1 Refund
                         │
                         ├────────< Payment
                         └────────< OrderPromotion

POSSession ───────────< POSMovement
      │
      └───────────────< Order (source = POS)

ExpenseCategory ─────< Expense

StaffUser ───────────< AuditLog
   │
   └──────< POSSession

Role ────────────────< StaffRole >──────────── StaffUser
Role ────────────────< RolePermission >─────── Permission

ProductVariant ──────< Review >────────────── Customer
Promotion ───────────< PromotionTarget / CouponRedemption
NotificationEvent ───< NotificationDelivery
```

The diagram is conceptual. The final schema can split or merge implementation tables when there is a strong reason, but every change must preserve the business invariants.

## 2. Relationship rules

### Catalog

- A `Brand` may have zero or many `Product` records.
- A `Product` may belong to multiple `Category` records; categories should therefore use a join relation rather than a single category foreign key unless discovery proves the business is strictly single-category.
- A `Product` may have zero or many variants.
- A product with no meaningful variants may use one canonical/default variant for inventory and sales, avoiding special-case stock logic.
- A `ProductVariant` belongs to exactly one product.
- A sellable variant may have one or many barcodes, but uniqueness rules must reflect whether a barcode is globally unique or provider-specific.
- Product images belong to a product and/or variant depending on merchandising needs; variant-specific images should not require duplicating shared product assets.

### Inventory

- Each sellable variant has one current `StockItem` per stock location.
- Each `StockItem` can have zero or many `InventoryBatch` records.
- A batch belongs to one sellable variant and one stock location.
- `InventoryMovement` references the affected variant/location and optionally a batch.
- Movements should carry source references (sale, purchase, return, adjustment, etc.) instead of relying on free-form notes.
- Current stock is derived from controlled movements or maintained as a transactional projection with reconciliation capability.

### Purchasing

- One supplier can have many purchases.
- One purchase has one or many purchase items.
- Each purchase item references one variant and can optionally create/update one or more received batches if split receiving is needed.
- Purchase lifecycle should separate ordered quantities from received quantities.

### Customers / orders

- A customer can have many addresses.
- A guest order may have no customer account reference.
- A registered customer's order should reference the customer where possible, while still storing immutable transaction-time contact/address snapshots.
- One order has one or many order items.
- Each order item references the variant sold at the time of transaction and stores historical snapshots for product name, price, discount and relevant merchandising data.
- An order has many status-history entries; current status is a controlled projection, not an arbitrary history overwrite.

### Delivery

- An order may have zero or one active shipment in the simple case, but the model must permit multiple shipment attempts/shipments for partial fulfillment, reattempt, or future split shipments.
- A shipment belongs to one delivery provider and one order.
- A shipment may have many tracking events.
- Tracking events are append-only integration observations; they must not overwrite the original raw provider payload when retaining raw data is permitted and safe.
- Shipping rate records belong to a provider/coverage context and must separate customer price from merchant cost.

### Returns / exchanges

- One order may have many return records over time, subject to policy.
- One return has one or many return items.
- A return item points to the original order item whenever possible.
- An accepted returned item can create inventory movement(s) only after inspection/disposition.
- Exchange operations should link the returned item(s) to replacement sale item(s), but replacement goods should remain ordinary sale/stock records rather than being hidden inside a return row.
- Refund records are financial effects linked to the return and/or original sale; they must not mutate historical payment facts.

### POS / cash

- A staff user can open many POS sessions over time.
- A POS session belongs to one register/location and one opening operator; additional permitted operators can be represented by controlled session-user assignments if needed.
- POS sales should reuse the shared order/sale domain so inventory and finance logic is not duplicated.
- Cash movements belong to a POS session and require reason/source metadata.
- A cash reconciliation belongs to one closing session and records expected vs counted totals and variance.

### Finance

- One order can have many payment attempts/records, but business rules determine which payment is authoritative.
- Expenses belong to one expense category and one recorded actor.
- Financial reports should derive from immutable transaction facts plus explicit costing assumptions; reports themselves are not the source of truth.

### Identity / permissions

- A staff user can have one or many roles.
- A role can have many permissions.
- Permission checks are server-side even if UI visibility also uses permissions.
- Audit logs reference the acting staff identity when known and retain enough target/context data to reconstruct sensitive actions.

## 3. Key constraints

### Uniqueness

Potential unique constraints to validate during physical schema design:

- SKU unique within the merchant/catalog scope.
- Barcode uniqueness according to confirmed scanning policy.
- Order number unique.
- Invoice number unique within its numbering scope.
- Provider shipment/tracking ID unique per provider where the provider guarantees uniqueness.
- Coupon code unique while active within its campaign scope, with case-normalization rules.

### Referential integrity

- Historical orders must survive product archive/deactivation.
- Hard deletion of products referenced by transactions should generally be prohibited; use archive/soft-delete semantics.
- Financial records and audit logs should not be orphaned by account deletion.
- Integration events should tolerate missing optional display records without losing the event itself.

## 4. Important edge cases

### Product/catalog

1. Product exists with no variant: create a canonical sellable variant.
2. Variant is discontinued while old orders still reference it: archive, do not delete.
3. Same barcode accidentally assigned to two variants: reject or require explicit override workflow.
4. Product is changed from non-expiry-tracked to expiry-tracked after stock exists: migration must define treatment of existing stock.
5. Product price changes while carts exist: checkout must revalidate price and promotion rules.

### Inventory

1. Two staff sell the last unit concurrently: only one transaction may successfully consume the available quantity.
2. Return is approved but item fails inspection: do not restock as sellable.
3. Expired batch exists alongside valid batch: expired quantity must be excluded from normal availability.
4. Manual adjustment makes stock negative: require explicit permission/policy; never silently allow it.
5. Inventory movement is retried: idempotency prevents duplicate movement.

### Orders

1. Customer double-clicks Place Order: idempotency key prevents duplicate order.
2. Browser retries after timeout although server already created order: same idempotency result is returned.
3. Price/promotion changes between cart view and checkout: server recalculates.
4. Shipping zone unavailable: checkout is blocked or requires manual handling; no invented price.
5. Order cancelled after confirmation: inventory and financial effects follow the state-machine policy.

### Delivery

1. ZR API times out after accepting shipment: retry must use an idempotency/provider reference strategy to avoid duplicate shipment creation.
2. Same webhook is delivered multiple times: process once semantically, record duplicates safely.
3. Provider reports unknown status: preserve raw event and mark unmapped rather than corrupting local state.
4. Provider becomes unavailable: manual dispatch/tracking remains available.
5. Shipping rate sync returns incomplete data: never overwrite the full rate table with partial/empty results without explicit confirmation.

### Returns / refunds

1. Same item is returned twice: second return must be rejected/limited by remaining returnable quantity.
2. Partial return: original sale remains; returned quantity becomes a separate financial/inventory event.
3. Refund exceeds captured/collectable amount: reject.
4. COD order has been delivered but refund is later approved: refund method must be explicitly recorded.
5. Exchange with price difference: system creates a clear payable/refundable delta, not a hidden price mutation.

### POS / cash

1. POS session closes with cash variance: record variance and require authorized review.
2. Sale is refunded after session closes: create an auditable adjustment rather than rewriting the closed session.
3. Two registers operate simultaneously in future: register identity must separate sessions and cash balances.
4. Payment method changes mid-sale: transaction must record final tender and permitted split/mixed payment rules.

### Finance

1. Product cost changes after sale: historical sale cost remains stable according to chosen costing method.
2. Delivery cost differs from customer shipping charge: both remain independently recorded.
3. Expense is edited after a report was viewed: reports are recalculated from authoritative records; prior report snapshots are not treated as truth unless explicitly frozen.
4. Return affects profitability after the original sale period: reporting must distinguish current-period adjustment from original-sale history.

## 5. Recommended physical-schema direction

Before implementation, the database should favor:

- PostgreSQL-compatible relational constraints.
- Foreign keys for core relationships.
- Unique and check constraints for business invariants that can be enforced in SQL.
- Decimal/exact numeric money fields or integer minor units; never floating-point money.
- UTC timestamps in storage with explicit timezone presentation at the application edge.
- Append-only histories for statuses, inventory movements, tracking events and audit records.
- Soft archive semantics for transactionally referenced catalog records.
- Explicit indexes for lookup paths: SKU/barcode, order number, customer phone, order status/date, stock variant/location, shipment tracking/provider IDs.

## 6. ERD review outcome

The current conceptual model is coherent enough to proceed to a physical PostgreSQL schema, but the following decisions should be explicitly recorded before migrations are written:

1. Inventory costing method (FIFO vs weighted average or another chosen policy).
2. Barcode uniqueness policy.
3. Guest-order/customer identity merge policy.
4. Exact return/refund policy.
5. Whether multiple concurrent POS registers are needed at launch.
6. Whether product images are product-level, variant-level, or both.
7. Exact ZR provider data model after account/API verification.
8. Final payment abstraction shape for cash, then future CCP/BaridiMob.
