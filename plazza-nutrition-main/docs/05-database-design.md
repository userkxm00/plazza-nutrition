# Plazza Nutrition — Database Design v0.1

> Status: architecture/design draft. This document defines the relational data model conceptually. Exact SQL types, ORM syntax, migrations, and vendor-specific details are intentionally deferred until the technology decision is recorded.

## 1. Database goals

The database is the durable source of truth for the business system. It must support:

- online commerce;
- physical POS sales;
- shared inventory;
- batch/expiry-aware stock;
- purchasing and supplier records;
- delivery and courier integrations;
- returns/exchanges/refunds;
- cash-register operations;
- operating expenses and profitability reporting;
- customer and staff identity;
- promotions and reviews;
- auditability and historical snapshots.

The model must favor correctness and recoverability over cleverness.

## 2. Design rules

### 2.1 Relational integrity

Financial, order, inventory, and authorization data are strongly relational. Foreign keys and database constraints should enforce invariants whenever practical rather than relying only on application code.

### 2.2 Historical records are immutable

Completed commercial records must preserve the values that applied at transaction time. Catalog edits must not rewrite old orders, sales, shipping charges, or recorded costs.

### 2.3 Monetary values

Persist monetary amounts using an exact representation supported by the selected database (for example a fixed-precision decimal or integer minor units). Never persist money as binary floating point.

The currency is currently DZD; currency should still be modeled explicitly enough to avoid accidental future ambiguity.

### 2.4 No unexplained stock changes

`stock_on_hand` is not a free-form counter that staff can silently overwrite. Every material stock change must have an inventory movement with a source/reason and actor when applicable.

### 2.5 Soft deletion vs hard deletion

Business-critical records such as orders, payments, inventory movements, returns, cash sessions and audit logs must not be hard-deleted through ordinary UI actions.

Catalog records may use archive/active states instead of physical deletion when historical references exist.

### 2.6 Provider isolation

ZR Express IDs, webhook payloads and provider-specific fields belong to integration tables/metadata, not as the primary identity of orders or shipments.

---

## 3. Entity groups

```text
Identity
  staff_users
  roles
  permissions
  role_permissions
  staff_user_roles
  audit_logs

Catalog
  brands
  categories
  products
  product_variants
  product_images
  product_attributes / product_attribute_values
  barcodes

Commerce
  customers
  customer_addresses
  carts
  cart_items
  orders
  order_items
  order_discounts
  order_shipping
  order_status_history
  payments

Inventory
  stock_locations
  inventory_items / stock_balances
  inventory_batches
  inventory_movements

Purchasing
  suppliers
  purchases
  purchase_items
  purchase_receipts
  purchase_receipt_items

Delivery
  delivery_providers
  delivery_zones
  shipping_rates
  shipments
  tracking_events

Returns
  returns
  return_items
  exchanges
  exchange_items
  refunds / refund_allocations

POS / Cash
  pos_registers
  pos_sessions
  cash_movements
  cash_reconciliations

Finance
  expense_categories
  expenses

Promotions
  promotions
  coupons
  promotion_rules / targets

Reviews
  reviews

Notifications
  notification_events
  notification_deliveries
  provider_configs (secrets outside Git)
```

Some names are conceptual and may be combined during implementation if the chosen stack provides a cleaner equivalent.

---

## 4. Identity and access

### `staff_users`

Represents employees/operators who can use the administration/POS system.

Important fields:

- id
- display_name
- phone/email as appropriate
- auth/provider identity reference
- status (active/suspended/disabled)
- created_at / updated_at

### `roles`

Examples are Owner, Manager, Cashier, Warehouse, Order Operator, Finance. These are configuration, not hard-coded assumptions.

### `permissions`

Granular capabilities such as:

- orders.read
- orders.update
- products.write
- inventory.adjust
- inventory.receive
- pos.sell
- pos.refund
- reports.profit
- expenses.write
- users.manage
- settings.manage

### `staff_user_roles` / `role_permissions`

Many-to-many relationships.

### `audit_logs`

Must capture at least:

- actor/staff id where applicable;
- action;
- target entity/type and id;
- timestamp;
- safe before/after summary;
- request/correlation id where useful.

Secrets and raw credentials must never be logged.

---

## 5. Catalog model

### `brands`

Brand identity and display metadata.

### `categories`

Hierarchical category support is preferred so categories can later have parent/child relationships.

### `products`

Customer-facing product concept.

Candidate fields:

- id
- brand_id
- primary_category_id or category relation table
- name_fr / name_ar or translation model
- slug
- description/content fields
- active/published state
- tracking flags (batch/expiry where appropriate)
- created_at / updated_at

### `product_variants`

A product can be sold directly without variants or through multiple variants.

Candidate fields:

- id
- product_id
- SKU
- display name/label
- selling price
- current default cost if useful for display/planning (historical sale cost must come from actual costing records)
- weight/dimensions where needed
- active state

Examples: size, flavor, pack quantity.

### `product_images`

References media objects stored outside the relational database where practical.

### Product attributes

Supplement-specific information should not force every product into dozens of nullable columns. Use a structured approach that can represent fields such as:

- serving size
- ingredients
- nutrition facts
- flavor
- size
- usage instructions
- warnings

The final representation (normalized typed attributes vs JSON for some content) is a technical decision to record later.

### `barcodes`

A variant may have one or more barcode identifiers depending on real inventory requirements. Uniqueness rules must reflect whether the physical barcode is globally unique for the shop.

---

## 6. Customers and carts

### `customers`

Stores customer identity needed for commerce.

Must support both guest-originated orders and registered accounts.

A guest checkout does not require immediate account creation.

### `customer_addresses`

Saved addresses for registered customers; historical orders should snapshot the shipping destination instead of relying on a mutable address row.

### `carts` / `cart_items`

Carts are temporary commerce state. Cart data must never be treated as the authoritative order record.

A checkout creates an order snapshot.

---

## 7. Orders

### `orders`

The central commercial transaction.

Candidate fields:

- id
- human-readable order number
- source/channel (`ONLINE`, `POS`, `MANUAL_ADMIN`)
- customer_id nullable for guests
- status
- currency
- subtotal
- discount_total
- customer_shipping_total
- grand_total
- placed_at / confirmed_at / completed_at
- staff actor fields where relevant
- idempotency key / checkout request reference

### `order_items`

Must snapshot transaction-time facts:

- product/variant id where available
- product name snapshot
- SKU snapshot
- unit selling price
- quantity
- line discount
- line total
- actual allocated cost/COGS reference once costing is finalized

Do not calculate historical order totals from current product prices.

### `order_status_history`

Append-only transitions with:

- from status
- to status
- actor/system source
- reason
- timestamp

### `order_discounts`

Persist the exact promotion/coupon effect applied at checkout.

### `order_shipping`

Snapshot the customer's delivery selection and pricing at order time:

- destination snapshot
- delivery method
- customer shipping charge
- courier/provider cost when known
- provider/rate reference if applicable

---

## 8. Payments

### `payments`

Payment attempts/facts belong to the order or POS sale.

Current live method:

```text
CASH_ON_DELIVERY
CASH_POS
```

Future-capable methods may include:

```text
CCP
BARIDIMOB
OTHER_DIGITAL
```

The payment model must separate:

- method
- amount
- status
- external reference
- recorded_at
- confirmed_at

Payment provider integrations must not redefine the order identity.

---

## 9. Inventory

### `stock_locations`

Current deployment has one shop/stock location. Keep the relation explicit so future multi-location stock does not require schema replacement.

### `inventory_items` / `stock_balances`

Represents current sellable quantity per variant/location, with reserved quantity if the chosen reservation strategy requires it.

A derived balance should be reconciliable against movements.

### `inventory_batches`

Optional per SKU/variant when lot/expiry tracking is required.

Candidate fields:

- id
- variant_id
- stock_location_id
- supplier/batch metadata
- lot/batch code
- expiry date nullable
- received quantity
- remaining quantity
- unit cost

The final design must avoid having two competing sources of truth for remaining batch stock.

### `inventory_movements`

Immutable movement ledger.

Candidate fields:

- id
- variant_id
- location_id
- batch_id nullable
- quantity_delta
- movement_type/reason
- source entity/type/id
- actor/system source
- occurred_at
- correlation/idempotency reference
- optional unit cost snapshot

Typical reasons:

```text
PURCHASE_RECEIPT
ONLINE_SALE
POS_SALE
CUSTOMER_RETURN
EXCHANGE_OUT
EXCHANGE_IN
MANUAL_ADJUSTMENT
DAMAGE
EXPIRY
SUPPLIER_RETURN
CORRECTION
```

The application should not execute unexplained `stock = stock - 1` operations.

---

## 10. Purchasing

### `suppliers`

Supplier/contact details and active state.

### `purchases`

Purchase document/header representing stock acquisition intent/record.

### `purchase_items`

Variant, quantity, unit cost, batch/expiry details where applicable.

### Receiving

Receiving should be represented so inventory only increases when goods are actually received, not when a purchase draft is created.

A receipt can produce inventory movements and batch records atomically.

---

## 11. Delivery

### `delivery_providers`

Example:

```text
ZR_EXPRESS
```

Provider configuration references credentials through the secret-management layer, not Git.

### `delivery_zones`

Provider-specific service coverage. Do not equate this directly with national administrative territory data.

### `shipping_rates`

Fields conceptually include:

- provider
- destination zone/territory
- delivery method (`HOME`, `STOP_DESK`)
- merchant cost
- customer price
- effective period/version
- active state
- source (`MANUAL`, `SYNCED`)

The design supports a future `Sync shipping rates` action.

### `shipments`

Connects an order to a delivery attempt/provider.

Important fields:

- order id
- provider id
- provider shipment id
- tracking number
- delivery method
- destination snapshot
- status
- created/dispatched/delivered timestamps
- failure/return information
- manual/API source

### `tracking_events`

Normalized, append-only tracking events. Raw provider payloads may be retained separately with controlled retention if needed for debugging.

Webhook processing must be idempotent.

---

## 12. Returns, refunds and exchanges

### `returns`

Header record linked to original order or POS transaction where possible.

Fields include status, reason, requested/approved amounts, customer/operator data and lifecycle timestamps.

### `return_items`

Original order/sale line, quantity requested, quantity approved, disposition.

Disposition may include:

```text
RESTOCK_SELLABLE
RESTOCK_QUARANTINE
DAMAGED
EXPIRED
SUPPLIER_RETURN
```

### `refunds`

Financial effect of an approved return/refund. Must not rewrite the original payment row destructively.

### `exchanges`

Represents the replacement operation and the difference between returned and replacement items.

An exchange can result in:

- customer payment due;
- customer refund due;
- no difference.

Inventory movements are created for both outgoing returned goods and replacement goods as appropriate.

---

## 13. POS and cash register

### `pos_registers`

Physical/virtual register identity.

### `pos_sessions`

Opening/closing session for a cashier/register.

Candidate fields:

- register id
- opened_by
- opening cash
- opened_at
- closed_by
- closed_at
- status
- expected cash
- counted cash
- variance

### `cash_movements`

Append-only cash ledger for the session.

Examples:

```text
SALE
REFUND
EXPENSE
WITHDRAWAL
CASH_IN
CASH_OUT
ADJUSTMENT
```

Every non-sale movement should have a reason and actor.

### `cash_reconciliations`

Stores closing count and variance against expected balance.

---

## 14. Expenses and profitability

### `expense_categories`

Examples:

```text
RENT
ELECTRICITY
INTERNET
SALARIES
ADVERTISING
PACKAGING
OTHER
```

### `expenses`

Recorded business expenses with amount, category, date, description and actor.

### Profitability

Profit should be derived from durable transaction facts rather than manually entered totals.

A report can conceptually calculate:

```text
Revenue
- discounts
- COGS
- merchant delivery costs
- refunds/returns
- operating expenses
= selected profit measure
```

The schema must preserve enough historical information to recompute reports consistently.

---

## 15. Promotions and reviews

### `promotions`

A promotion is a business rule/configuration with validity windows and status.

### `coupons`

Customer-entered promotional codes with usage constraints.

Promotion configuration must be snapshotted into the resulting order effect.

### `reviews`

Review linked to product/variant and customer/order evidence when verified purchase is enabled.

Review moderation state should be explicit.

---

## 16. Notifications

### `notification_events`

Business event emitted after successful core transactions.

Examples:

```text
ORDER_CREATED
ORDER_CONFIRMED
ORDER_SHIPPED
ORDER_DELIVERED
ORDER_CANCELLED
RETURN_APPROVED
```

### `notification_deliveries`

Tracks provider attempts, status, retry count and failure reason.

The order transaction must not depend on successful notification delivery.

---

## 17. Keys and identifiers

Use internal stable IDs (UUID/ULID or another documented strategy) for entities.

Human-facing identifiers should be separate:

```text
Internal order ID     → machine identity
Order number          → e.g. PLZ-2026-000123
Invoice number        → business document identity
Tracking number       → courier identity
SKU                   → catalog/warehouse identity
Barcode               → physical product identity
```

Never use an external courier tracking number as the primary key of an order.

---

## 18. Uniqueness / indexes

The final physical schema should plan indexes around real query paths.

Likely uniqueness constraints:

- product slug
- SKU
- order number
- invoice number
- user login identifier as applicable
- barcode where globally unique
- provider + provider shipment ID where defined
- idempotency key in appropriate scope

Likely high-value indexes:

- orders by status + created_at
- orders by customer + created_at
- order items by variant
- inventory movements by variant + occurred_at
- inventory batch by variant + expiry
- shipments by tracking/provider/status
- tracking events by shipment + occurred_at
- audit logs by actor + timestamp and target + timestamp
- expenses by category + date
- cash movements by session + occurred_at

Indexes must be validated against actual query plans once implementation begins.

---

## 19. Transaction boundaries

At minimum, these operations should be atomic at the database transaction level where applicable:

### Online order confirmation

```text
validate order
→ reserve/commit stock according to policy
→ update order state
→ record stock movement(s)
→ record necessary financial facts
```

### POS completion

```text
validate cart
→ create sale/order
→ create payment
→ create inventory movements
→ record cash movement
→ close/retain session state
```

### Receiving purchase

```text
receive purchase
→ create receipt facts
→ create/update batch
→ inventory movements
→ update stock balance
```

### Return approval/receipt

```text
validate original sale
→ approve/receive return
→ create return records
→ inventory disposition
→ refund/financial adjustment
→ audit event
```

External API calls should generally occur outside the core transaction and be handled through durable integration state/jobs so a courier outage does not leave the database in a half-written state.

---

## 20. Concurrency and idempotency

The design must protect against:

- two customers buying the last item;
- double-click checkout;
- duplicate webhook delivery;
- repeated POS submission;
- retrying a purchase receipt;
- concurrent inventory adjustments.

Expected mechanisms include appropriate row locking/atomic updates, unique idempotency keys, transaction isolation, and provider event deduplication.

Exact implementation depends on the final database/runtime choice.

---

## 21. Reporting model

Operational reporting should preferably query durable transactional facts or precomputed/reporting projections where scale later justifies them.

Do not create a second manually maintained "profit table" that can drift away from orders, inventory and expenses.

Potential later reporting projections/materialized views may include:

- daily sales summary
- product profitability
- inventory valuation
- courier cost summary
- return summary
- cash session summary

These are derived artifacts, not the source of truth.

---

## 22. Data retention and recovery

The production database plan must include:

- automated backups;
- restore testing;
- migration history;
- recovery procedure;
- retention policy;
- protection against accidental deletion;
- controlled handling of personal customer data.

A backup that has never been restored in a test is not considered verified.

---

## 23. Decisions deliberately postponed

The following must be resolved before physical schema/migrations are finalized:

1. Inventory reservation timing: checkout vs confirmation vs fulfillment.
2. COGS methodology: FIFO, weighted average, or another documented approach.
3. Exact return/refund eligibility period.
4. COD refund procedure.
5. Exact invoice/receipt numbering rules.
6. Whether one POS register or multiple simultaneous registers will be needed in practice.
7. Exact ZR Express API/webhook fields available to this merchant account.
8. Final authentication provider and session model.
9. Final PostgreSQL hosting/provider and backup design.
10. Whether translation content is stored as columns, translation rows, or another i18n model.

---

## 24. Definition of done for database design

Before implementation begins, the project should have:

- reviewed ERD/domain diagram;
- all core entities identified;
- required/optional relationships documented;
- invariants mapped to constraints or transaction logic;
- state-machine states linked to persisted records;
- costing method selected;
- migration strategy selected;
- backup/recovery design selected;
- integration tables separated from core domain data;
- indexes justified by expected queries.
