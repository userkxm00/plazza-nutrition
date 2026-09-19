# Plazza Nutrition — Domain Model v0.1

> **Status:** Draft for discovery. This document defines business concepts and invariants before implementation. Table names, framework classes, and vendor-specific schemas are intentionally not fixed yet.

## 1. Domain map

The system is organized around six cooperating domains:

```text
Commerce
  ├── Catalog
  ├── Cart / Checkout
  ├── Orders
  └── Customers

Operations
  ├── POS
  ├── Inventory
  ├── Purchasing
  └── Fulfillment / Delivery

Finance
  ├── Sales & payments
  ├── Returns/refunds
  ├── Expenses
  ├── Cash register
  └── Profitability

Identity & Access
  ├── Customers
  ├── Staff users
  ├── Roles / permissions
  └── Audit log

Engagement
  ├── Reviews
  ├── Coupons / promotions
  └── Notifications

Integrations
  ├── ZR Express
  ├── Future couriers
  ├── Future payment methods
  └── Future WhatsApp / SMS / email providers
```

## 2. Core entities

### 2.1 Catalog

- **Product** — customer-facing concept such as a whey protein, creatine, shaker, vitamin, or accessory.
- **ProductVariant** — purchasable variation when size, flavor, quantity, or other attributes differ.
- **Brand**
- **Category**
- **ProductImage**
- **ProductAttribute** / structured supplement information where required.
- **SKU / Barcode** — identifies a sellable item for POS/inventory workflows.

A product may have no variants or multiple variants. The domain must not force every product into the same attribute shape.

### 2.2 Inventory

- **StockItem** — current quantity for a sellable item at the current stock location.
- **InventoryMovement** — immutable business event explaining why stock changed.
- **InventoryBatch** — optional lot/batch information for products that require it.
- **StockLocation** — currently one physical shop/stock location; model remains extensible.

Typical movement reasons:

```text
PURCHASE_RECEIPT
ONLINE_SALE
POS_SALE
CUSTOMER_RETURN
EXCHANGE
MANUAL_ADJUSTMENT
DAMAGE
EXPIRY
STOCK_TRANSFER (future)
```

Inventory balance must be derivable and auditable from controlled movements; direct unexplained quantity edits should be avoided.

### 2.3 Purchasing

- **Supplier**
- **Purchase**
- **PurchaseItem**
- **PurchaseReceipt / Receiving event** where needed

Purchases exist to support real inventory and cost data without turning the product into a full ERP.

### 2.4 Customer commerce

- **Customer**
- **CustomerAddress**
- **Cart**
- **CartItem**
- **Order**
- **OrderItem**
- **OrderStatusHistory**

Orders may originate from:

```text
ONLINE
POS
MANUAL_ADMIN
```

Order items must retain transactional snapshots such as sold unit price and relevant product description so historical orders do not change when catalog data changes later.

### 2.5 Fulfillment and delivery

- **DeliveryProvider** — provider abstraction, starting with ZR Express.
- **DeliveryZone / Coverage** — courier-specific serviceable areas.
- **ShippingRate** — customer-facing shipping price and merchant courier cost must be separate values.
- **Shipment** — fulfillment record connected to an order.
- **TrackingEvent** — normalized tracking state received from the provider or entered manually.

Delivery method currently includes:

```text
HOME
STOP_DESK
```

Provider coverage must not be confused with Algeria's administrative geography.

### 2.6 Returns and exchanges

- **ReturnRequest / Return**
- **ReturnItem**
- **Exchange** where the replacement sale item differs.
- **Refund / financial adjustment** where money is returned.
- **ReturnReason**
- **ReturnStatusHistory**

A return is a business workflow, not a destructive edit to an order.

### 2.7 POS and cash register

- **POSSession** — opening/closing of a cash register session.
- **POSSale** — represented through the shared order/sale model where possible.
- **CashMovement** — cash in/out with reason and source.
- **CashReconciliation** — expected vs counted cash at closing.

The first live payment method is cash. Payment architecture must allow additional methods such as CCP and BaridiMob later.

### 2.8 Finance

- **Payment**
- **Expense**
- **ExpenseCategory**
- **Revenue / sales facts** derived from transactional records.
- **Cost of Goods Sold (COGS)** based on an explicitly chosen inventory costing method.
- **Profitability facts** derived from sales, cost, discounts, delivery costs, returns, and expenses.

The system should expose operational profitability metrics but is not intended to replace a certified accounting system.

### 2.9 Promotions and reviews

- **Coupon**
- **Promotion**
- **PromotionRule / PromotionTarget** where needed.
- **Review**
- **ReviewModeration** state.

### 2.10 Identity and access

- **StaffUser**
- **Role**
- **Permission**
- **RolePermission** / assignment
- **AuditLog**

Customer accounts are separate from staff authorization even if authentication infrastructure is shared.

## 3. Important invariants

### Orders

1. An order cannot move to a financially/operationally final state without required customer and line-item data.
2. Material status changes are append-only history events.
3. Order totals are calculated from persisted line-item/discount/shipping facts, not from client-supplied totals.
4. Repeated order-submission requests must be idempotent.

### Inventory

1. A sale cannot silently create stock.
2. Stock-sensitive operations must be atomic with the transaction that created them.
3. Returns only restore inventory when the returned quantity is actually accepted for restock.
4. Expiry/batch tracking is enabled per product/variant as required; it is not mandatory for every SKU.
5. Manual stock adjustments require permission and an audit reason.

### Money

1. Monetary values are stored using exact decimal/integer representations, never binary floating-point arithmetic for persisted financial amounts.
2. Customer shipping price and merchant delivery cost are separate facts.
3. Refunds/returns create financial effects; they do not rewrite historical sales.
4. Expense records are separate from sales revenue.
5. Profit reports must state their costing assumptions.

### Delivery

1. External tracking IDs are not our primary order identity.
2. Webhook processing must be idempotent.
3. Provider outages must not delete or corrupt local order data.
4. Manual fallback must remain available for critical dispatch operations.

### Access and audit

1. Permission checks happen server-side.
2. Sensitive mutations are attributable to a staff identity.
3. Secrets and production credentials are never stored in Git.

## 4. Product cost / profitability decision to resolve

Per-product profitability requires a defined costing method when multiple purchase batches have different costs. Candidate approaches include:

- **FIFO** — cost follows oldest available batch first.
- **Weighted average** — cost is averaged across stock.

This is a business/accounting decision and must be finalized before production profitability reports are considered authoritative.

## 5. Open domain questions

- Exact product categories/brands and attribute structure.
- Whether some products require serial/barcode uniqueness vs shared barcodes.
- Which items may be restocked after a return.
- Exact refund policy and exchange rules.
- Exact cash register workflow used in the physical shop.
- Whether the store will need more than one staff shift/register simultaneously.
- Preferred inventory costing method.
- Whether customer-paid shipping is always collected on delivery or can be waived/promotional.
- Exact ZR Express rate/coverage data available to this merchant account.
