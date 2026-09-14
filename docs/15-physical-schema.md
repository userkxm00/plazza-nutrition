# Plazza Nutrition — Physical Database Schema v0.1

> **Status:** design draft. This document converts the domain model and workflows into a PostgreSQL-oriented physical schema proposal. It is not yet a migration and should not be treated as final DDL until the stack and costing policy are approved.

## 1. Database principles

- PostgreSQL is the target relational model for the current design.
- Primary keys use UUIDs; human-readable numbers are separate identifiers.
- Money is stored as integer minor units (DZD has no fractional unit in the business model) or an equivalent exact numeric strategy approved before implementation. Never use floating-point for persisted money.
- Timestamps are stored in UTC (`timestamptz`). UI/local business timezone is `Africa/Algiers`.
- Statuses are controlled enums/check constraints/state machines, not arbitrary strings.
- Historical transaction data is immutable by default.
- Foreign keys and database constraints enforce integrity wherever practical.
- Soft deletion/archiving is preferred for business entities referenced by historical transactions.
- Secrets, credentials and raw provider tokens are never stored in ordinary business tables in plaintext.

## 2. Naming conventions

- Tables: `snake_case`, plural.
- Columns: `snake_case`.
- Primary key: `id`.
- Foreign key: `<entity>_id`.
- Audit timestamps: `created_at`, `updated_at` where mutable.
- Business numbers: e.g. `order_number`, `invoice_number`, `receipt_number`, `tracking_number`.

## 3. Identity and access

### `staff_users`

Core staff identity.

```text
id uuid PK
email citext UNIQUE NOT NULL
phone text NULL
name text NOT NULL
status staff_status NOT NULL
last_login_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Authentication-provider-specific credentials/session tables should live in the chosen auth subsystem rather than being invented here.

### `roles`

```text
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
description text NULL
is_system boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `permissions`

```text
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
description text NULL
```

### `role_permissions`

```text
role_id uuid FK roles.id
permission_id uuid FK permissions.id
PRIMARY KEY (role_id, permission_id)
```

### `staff_user_roles`

```text
staff_user_id uuid FK staff_users.id
role_id uuid FK roles.id
PRIMARY KEY (staff_user_id, role_id)
```

## 4. Customers

### `customers`

```text
id uuid PK
email citext NULL
phone text NOT NULL
first_name text NOT NULL
last_name text NULL
status customer_status NOT NULL
preferred_locale text NULL
notes text NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Index: normalized phone; optional unique constraint only after agreeing on phone normalization/identity rules.

### `customer_addresses`

```text
id uuid PK
customer_id uuid FK customers.id
label text NULL
recipient_name text NOT NULL
phone text NOT NULL
territory_id uuid FK territories.id
commune_name text NULL
address_line1 text NOT NULL
address_line2 text NULL
postal_code text NULL
delivery_notes text NULL
is_default boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Guest checkout does not require a persisted customer account; order-level customer/contact snapshots are still required.

## 5. Geography and delivery coverage

The model separates national/administrative geography from courier coverage.

### `territories`

```text
id uuid PK
code text UNIQUE NOT NULL
name_fr text NOT NULL
name_ar text NOT NULL
parent_id uuid FK territories.id NULL
level smallint NOT NULL
is_active boolean NOT NULL DEFAULT true
```

This is intentionally flexible for current and future administrative changes.

### `delivery_providers`

```text
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
status provider_status NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `provider_coverage`

```text
id uuid PK
provider_id uuid FK delivery_providers.id
territory_id uuid FK territories.id NULL
commune_name text NULL
service_type delivery_method NOT NULL
is_active boolean NOT NULL DEFAULT true
external_zone_id text NULL
UNIQUE(provider_id, territory_id, commune_name, service_type)
```

### `shipping_rates`

Represents the price shown/charged to the customer and the merchant's known courier cost separately.

```text
id uuid PK
provider_id uuid FK delivery_providers.id NULL
territory_id uuid FK territories.id
commune_name text NULL
service_type delivery_method NOT NULL
customer_price_minor bigint NOT NULL
merchant_cost_minor bigint NULL
currency char(3) NOT NULL DEFAULT 'DZD'
source shipping_rate_source NOT NULL
valid_from timestamptz NOT NULL
valid_to timestamptz NULL
is_active boolean NOT NULL DEFAULT true
synced_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Do not overwrite historical rates used by existing orders. Add a new rate/version or close the prior validity period.

## 6. Catalog

### `brands`

```text
id uuid PK
name text NOT NULL
slug text UNIQUE NOT NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `categories`

```text
id uuid PK
parent_id uuid FK categories.id NULL
name_fr text NOT NULL
name_ar text NOT NULL
slug text UNIQUE NOT NULL
sort_order integer NOT NULL DEFAULT 0
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `products`

Customer-facing product concept.

```text
id uuid PK
brand_id uuid FK brands.id NULL
name_fr text NOT NULL
name_ar text NOT NULL
slug text UNIQUE NOT NULL
description_fr text NULL
description_ar text NULL
is_active boolean NOT NULL DEFAULT true
requires_batch_tracking boolean NOT NULL DEFAULT false
requires_expiry_tracking boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
archived_at timestamptz NULL
```

### `product_categories`

```text
product_id uuid FK products.id
category_id uuid FK categories.id
PRIMARY KEY (product_id, category_id)
```

### `product_variants`

A variant is the sellable inventory unit.

```text
id uuid PK
product_id uuid FK products.id
name_fr text NULL
name_ar text NULL
sku text UNIQUE NOT NULL
selling_price_minor bigint NOT NULL
currency char(3) NOT NULL DEFAULT 'DZD'
track_inventory boolean NOT NULL DEFAULT true
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Current product cost should not be treated as authoritative historical COGS; actual cost is attached to inventory batches/cost layers or the selected costing mechanism.

### `barcodes`

```text
id uuid PK
variant_id uuid FK product_variants.id
code text UNIQUE NOT NULL
barcode_type text NULL
is_primary boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL
```

### `product_images`

```text
id uuid PK
product_id uuid FK products.id
variant_id uuid FK product_variants.id NULL
storage_key text NOT NULL
alt_text_fr text NULL
alt_text_ar text NULL
sort_order integer NOT NULL DEFAULT 0
is_primary boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL
```

### `product_attributes`

For structured supplement data that varies by category/product.

```text
id uuid PK
product_id uuid FK products.id
attribute_code text NOT NULL
value_json jsonb NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

The UI should expose known structured fields where possible; JSON should not become an excuse to put core searchable business fields into unindexed blobs.

## 7. Inventory

### `stock_locations`

```text
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
location_type stock_location_type NOT NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Current deployment starts with one location.

### `inventory_batches`

```text
id uuid PK
variant_id uuid FK product_variants.id
stock_location_id uuid FK stock_locations.id
batch_code text NULL
expiry_date date NULL
unit_cost_minor bigint NULL
currency char(3) NOT NULL DEFAULT 'DZD'
status inventory_batch_status NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

A batch can be omitted for untracked products. For tracked products, business rules should require batch and/or expiry as configured.

### `stock_balances`

Materialized current balance for fast reads; not the sole source of truth.

```text
id uuid PK
variant_id uuid FK product_variants.id
stock_location_id uuid FK stock_locations.id
batch_id uuid FK inventory_batches.id NULL
quantity_on_hand numeric(18,3) NOT NULL DEFAULT 0
quantity_reserved numeric(18,3) NOT NULL DEFAULT 0
updated_at timestamptz NOT NULL
UNIQUE(variant_id, stock_location_id, batch_id)
```

The application must never edit these balances arbitrarily; changes occur through inventory domain services/transactions.

### `inventory_movements`

Append-only stock events.

```text
id uuid PK
variant_id uuid FK product_variants.id
stock_location_id uuid FK stock_locations.id
batch_id uuid FK inventory_batches.id NULL
movement_type inventory_movement_type NOT NULL
quantity numeric(18,3) NOT NULL
unit_cost_minor bigint NULL
source_type text NOT NULL
source_id uuid NULL
reason_code text NULL
performed_by_staff_user_id uuid FK staff_users.id NULL
created_at timestamptz NOT NULL
```

Indexes: `(variant_id, stock_location_id, created_at)`, `(source_type, source_id)`, `(batch_id, created_at)`.

### `inventory_reservations`

Used for online/POS reservation strategy.

```text
id uuid PK
variant_id uuid FK product_variants.id
stock_location_id uuid FK stock_locations.id
batch_id uuid FK inventory_batches.id NULL
order_id uuid FK orders.id
quantity numeric(18,3) NOT NULL
status reservation_status NOT NULL
expires_at timestamptz NULL
created_at timestamptz NOT NULL
released_at timestamptz NULL
```

Reservation uniqueness and locking rules must prevent two transactions from successfully reserving the same final available unit.

## 8. Purchasing

### `suppliers`

```text
id uuid PK
name text NOT NULL
phone text NULL
email citext NULL
address text NULL
notes text NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `purchases`

```text
id uuid PK
purchase_number text UNIQUE NOT NULL
supplier_id uuid FK suppliers.id NULL
status purchase_status NOT NULL
purchase_date date NOT NULL
currency char(3) NOT NULL DEFAULT 'DZD'
subtotal_minor bigint NOT NULL
other_costs_minor bigint NOT NULL DEFAULT 0
total_minor bigint NOT NULL
notes text NULL
created_by_staff_user_id uuid FK staff_users.id
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `purchase_items`

```text
id uuid PK
purchase_id uuid FK purchases.id
variant_id uuid FK product_variants.id
quantity numeric(18,3) NOT NULL
unit_cost_minor bigint NOT NULL
batch_id uuid FK inventory_batches.id NULL
created_at timestamptz NOT NULL
```

Receiving should be explicit rather than assuming a purchase draft immediately changes stock.

## 9. Cart and checkout

### `carts`

```text
id uuid PK
customer_id uuid FK customers.id NULL
session_key text UNIQUE NULL
currency char(3) NOT NULL DEFAULT 'DZD'
status cart_status NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
expires_at timestamptz NULL
```

### `cart_items`

```text
id uuid PK
cart_id uuid FK carts.id
variant_id uuid FK product_variants.id
quantity numeric(18,3) NOT NULL
unit_price_minor bigint NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
UNIQUE(cart_id, variant_id)
```

## 10. Orders

### `orders`

```text
id uuid PK
order_number text UNIQUE NOT NULL
source order_source NOT NULL
status order_status NOT NULL
customer_id uuid FK customers.id NULL
customer_name_snapshot text NOT NULL
customer_phone_snapshot text NOT NULL
customer_email_snapshot citext NULL
shipping_address_snapshot jsonb NOT NULL
currency char(3) NOT NULL DEFAULT 'DZD'
subtotal_minor bigint NOT NULL
discount_minor bigint NOT NULL DEFAULT 0
customer_shipping_minor bigint NOT NULL DEFAULT 0
merchant_shipping_cost_minor bigint NULL
other_adjustment_minor bigint NOT NULL DEFAULT 0
grand_total_minor bigint NOT NULL
notes text NULL
idempotency_key text UNIQUE NULL
confirmed_at timestamptz NULL
completed_at timestamptz NULL
cancelled_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

The historical address and money snapshots are deliberately stored on the order.

### `order_items`

```text
id uuid PK
order_id uuid FK orders.id
variant_id uuid FK product_variants.id NULL
product_name_snapshot text NOT NULL
variant_name_snapshot text NULL
sku_snapshot text NULL
quantity numeric(18,3) NOT NULL
unit_price_minor bigint NOT NULL
discount_minor bigint NOT NULL DEFAULT 0
line_total_minor bigint NOT NULL
cost_basis_minor bigint NULL
created_at timestamptz NOT NULL
```

`cost_basis_minor` is populated only when the selected costing method can determine the historical cost. It must never be recomputed from the current product price/cost for closed transactions.

### `order_discounts`

```text
id uuid PK
order_id uuid FK orders.id
coupon_id uuid FK coupons.id NULL
promotion_id uuid FK promotions.id NULL
code_snapshot text NULL
amount_minor bigint NOT NULL
metadata jsonb NULL
created_at timestamptz NOT NULL
```

### `order_status_history`

```text
id uuid PK
order_id uuid FK orders.id
from_status order_status NULL
to_status order_status NOT NULL
reason_code text NULL
notes text NULL
changed_by_staff_user_id uuid FK staff_users.id NULL
created_at timestamptz NOT NULL
```

## 11. Payments and refunds

### `payments`

```text
id uuid PK
order_id uuid FK orders.id NULL
sale_id uuid FK orders.id NULL
payment_method payment_method NOT NULL
status payment_status NOT NULL
amount_minor bigint NOT NULL
currency char(3) NOT NULL DEFAULT 'DZD'
provider_code text NULL
provider_reference text NULL
paid_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

The schema must allow future `CCP` and `BARIDIMOB` without changing core order logic. COD remains primary initially.

### `refunds`

```text
id uuid PK
order_id uuid FK orders.id NULL
payment_id uuid FK payments.id NULL
amount_minor bigint NOT NULL
reason_code text NOT NULL
method payment_method NOT NULL
status refund_status NOT NULL
processed_by_staff_user_id uuid FK staff_users.id NULL
created_at timestamptz NOT NULL
completed_at timestamptz NULL
```

## 12. Delivery

### `shipments`

```text
id uuid PK
order_id uuid FK orders.id
provider_id uuid FK delivery_providers.id
service_type delivery_method NOT NULL
status shipment_status NOT NULL
external_shipment_id text NULL
tracking_number text NULL
provider_rate_id text NULL
customer_shipping_minor bigint NOT NULL
merchant_cost_minor bigint NULL
label_storage_key text NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
shipped_at timestamptz NULL
delivered_at timestamptz NULL
```

Suggested uniqueness: `(provider_id, external_shipment_id)` where external ID is not null.

### `tracking_events`

```text
id uuid PK
shipment_id uuid FK shipments.id
external_event_id text NULL
status_code text NOT NULL
normalized_status shipment_status NOT NULL
payload jsonb NULL
occurred_at timestamptz NOT NULL
received_at timestamptz NOT NULL
source tracking_event_source NOT NULL
UNIQUE(shipment_id, external_event_id)
```

Webhook processing must be idempotent.

## 13. Returns and exchanges

### `returns`

```text
id uuid PK
return_number text UNIQUE NOT NULL
order_id uuid FK orders.id NULL
sale_id uuid FK orders.id NULL
status return_status NOT NULL
reason_code text NOT NULL
customer_notes text NULL
approved_amount_minor bigint NOT NULL DEFAULT 0
received_at timestamptz NULL
closed_at timestamptz NULL
created_by_staff_user_id uuid FK staff_users.id NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `return_items`

```text
id uuid PK
return_id uuid FK returns.id
order_item_id uuid FK order_items.id NULL
variant_id uuid FK product_variants.id
quantity numeric(18,3) NOT NULL
condition return_condition NOT NULL
disposition return_disposition NOT NULL
refund_amount_minor bigint NOT NULL DEFAULT 0
created_at timestamptz NOT NULL
```

### `return_status_history`

```text
id uuid PK
return_id uuid FK returns.id
from_status return_status NULL
to_status return_status NOT NULL
changed_by_staff_user_id uuid FK staff_users.id NULL
reason text NULL
created_at timestamptz NOT NULL
```

### `exchanges`

```text
id uuid PK
exchange_number text UNIQUE NOT NULL
return_id uuid FK returns.id
original_order_id uuid FK orders.id NULL
replacement_order_id uuid FK orders.id NULL
price_difference_minor bigint NOT NULL DEFAULT 0
difference_direction exchange_difference_direction NULL
status exchange_status NOT NULL
created_by_staff_user_id uuid FK staff_users.id NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

## 14. POS and cash register

### `registers`

```text
id uuid PK
code text UNIQUE NOT NULL
name text NOT NULL
stock_location_id uuid FK stock_locations.id
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `pos_sessions`

```text
id uuid PK
register_id uuid FK registers.id
opened_by_staff_user_id uuid FK staff_users.id
opened_at timestamptz NOT NULL
opening_cash_minor bigint NOT NULL
status pos_session_status NOT NULL
closed_at timestamptz NULL
closed_by_staff_user_id uuid FK staff_users.id NULL
expected_cash_minor bigint NULL
counted_cash_minor bigint NULL
variance_minor bigint NULL
```

### `cash_movements`

```text
id uuid PK
pos_session_id uuid FK pos_sessions.id
movement_type cash_movement_type NOT NULL
amount_minor bigint NOT NULL
reason_code text NULL
source_type text NULL
source_id uuid NULL
performed_by_staff_user_id uuid FK staff_users.id NOT NULL
created_at timestamptz NOT NULL
```

### `cash_reconciliations`

```text
id uuid PK
pos_session_id uuid FK pos_sessions.id UNIQUE
expected_cash_minor bigint NOT NULL
counted_cash_minor bigint NOT NULL
variance_minor bigint NOT NULL
notes text NULL
reconciled_by_staff_user_id uuid FK staff_users.id NOT NULL
created_at timestamptz NOT NULL
```

## 15. Expenses

### `expense_categories`

```text
id uuid PK
code text UNIQUE NOT NULL
name_fr text NOT NULL
name_ar text NOT NULL
is_active boolean NOT NULL DEFAULT true
```

### `expenses`

```text
id uuid PK
expense_number text UNIQUE NOT NULL
category_id uuid FK expense_categories.id
amount_minor bigint NOT NULL
currency char(3) NOT NULL DEFAULT 'DZD'
expense_date date NOT NULL
payment_method payment_method NOT NULL
notes text NULL
created_by_staff_user_id uuid FK staff_users.id NOT NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

## 16. Promotions and reviews

### `coupons`

```text
id uuid PK
code text UNIQUE NOT NULL
type coupon_type NOT NULL
value_minor bigint NULL
percentage_bps integer NULL
minimum_order_minor bigint NULL
max_uses integer NULL
per_customer_limit integer NULL
starts_at timestamptz NULL
ends_at timestamptz NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `promotions`

```text
id uuid PK
name text NOT NULL
promotion_type promotion_type NOT NULL
configuration jsonb NOT NULL
starts_at timestamptz NULL
ends_at timestamptz NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Core target/product/category references should be normalized where they participate in filtering; JSON is reserved for flexible promotion configuration.

### `reviews`

```text
id uuid PK
product_id uuid FK products.id
customer_id uuid FK customers.id NULL
order_id uuid FK orders.id NULL
rating smallint NOT NULL
body text NULL
status review_status NOT NULL
verified_purchase boolean NOT NULL DEFAULT false
moderated_by_staff_user_id uuid FK staff_users.id NULL
moderated_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

## 17. Notifications

### `notification_templates`

```text
id uuid PK
code text UNIQUE NOT NULL
channel notification_channel NOT NULL
locale text NOT NULL
subject text NULL
body_template text NOT NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `notifications`

```text
id uuid PK
event_type text NOT NULL
channel notification_channel NOT NULL
recipient text NOT NULL
template_id uuid FK notification_templates.id NULL
status notification_status NOT NULL
provider_code text NULL
provider_message_id text NULL
attempt_count integer NOT NULL DEFAULT 0
last_error text NULL
scheduled_at timestamptz NULL
sent_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

## 18. Audit

### `audit_logs`

```text
id uuid PK
actor_staff_user_id uuid FK staff_users.id NULL
action_code text NOT NULL
entity_type text NOT NULL
entity_id uuid NULL
before_json jsonb NULL
after_json jsonb NULL
request_id uuid NULL
ip_address inet NULL
user_agent text NULL
created_at timestamptz NOT NULL
```

Do not put secrets, raw auth tokens or full payment credentials into before/after snapshots.

## 19. Idempotency and integration reliability

### `idempotency_keys`

```text
id uuid PK
scope text NOT NULL
key text NOT NULL
request_hash text NOT NULL
response_status integer NULL
response_body jsonb NULL
expires_at timestamptz NULL
created_at timestamptz NOT NULL
UNIQUE(scope, key)
```

This can be used for checkout, shipment creation and other externally retried commands.

### `integration_events`

```text
id uuid PK
provider_code text NOT NULL
event_type text NOT NULL
external_event_id text NULL
payload jsonb NULL
processing_status integration_event_status NOT NULL
error_message text NULL
received_at timestamptz NOT NULL
processed_at timestamptz NULL
UNIQUE(provider_code, external_event_id)
```

## 20. Key constraints and indexes

Minimum important indexes:

- `customers(phone)`
- `product_variants(sku)` unique
- `barcodes(code)` unique
- `products(slug)` unique
- `categories(slug)` unique
- `orders(order_number)` unique
- `orders(status, created_at desc)`
- `orders(customer_id, created_at desc)`
- `order_items(order_id)`
- `inventory_movements(variant_id, stock_location_id, created_at desc)`
- `stock_balances(variant_id, stock_location_id, batch_id)` unique
- `shipments(tracking_number)` where non-null
- `tracking_events(shipment_id, occurred_at desc)`
- `audit_logs(entity_type, entity_id, created_at desc)`
- `expenses(expense_date)`
- `cash_movements(pos_session_id, created_at)`

Partial indexes should be used where appropriate for active/non-null values.

## 21. Data integrity rules

Database constraints should enforce at least:

- non-negative quantities where the business meaning requires it;
- non-negative prices/costs;
- rating between 1 and 5;
- percentages within allowed ranges;
- required currency code;
- valid date ordering (`valid_to > valid_from`, session close after open, etc.);
- unique order/invoice/receipt/business numbers;
- unique active SKU/barcode rules;
- foreign-key integrity on all core references.

## 22. Delete policy

Hard deletion should be rare.

Recommended:

- products/brands/categories: archive;
- customers: anonymize only under an explicitly designed privacy policy, without breaking financial history;
- orders/sales/payments/inventory movements/audit logs: never hard-delete as normal application behavior;
- provider events: retain according to operational retention policy;
- carts/sessions: expiry cleanup is allowed.

## 23. Costing method gate

The physical schema supports batch-level cost information, but the final COGS algorithm is still a business decision.

Before marking profitability as authoritative, document one of:

1. FIFO / batch consumption;
2. weighted average;
3. another explicitly approved costing method.

The algorithm must produce reproducible historical results and remain stable for closed transactions.

## 24. Migration strategy

- All schema changes are versioned migrations.
- No production schema changes by manual dashboard editing.
- Seed/reference data migrations are separated from runtime application code.
- Destructive changes require a staged migration and data-backup plan.
- Every migration must be reversible where technically practical or have a documented forward-recovery strategy.

## 25. What is intentionally NOT frozen yet

- Exact PostgreSQL extension list.
- Exact UUID generation strategy.
- Enum implementation (native PostgreSQL enum vs lookup tables/check constraints).
- Final costing method.
- Exact auth schema/provider.
- Exact ORM.
- Exact file/image storage provider.
- Exact job/queue implementation.
- Exact ZR API field mapping.
- Exact administrative territory seed dataset.

These choices are recorded as implementation decisions after the physical model review, not assumed silently.
