# Plazza Nutrition — Business Analysis v0.1

## 1. Business overview

Plazza Nutrition is an established Algerian sports-nutrition retailer selling supplements and gym-related products through a physical shop and social channels. Current online sales are primarily handled through Instagram and WhatsApp, with manual order confirmation and ZR Express for delivery.

The opportunity is to create a direct digital sales channel while also centralizing the shop's operational workflows.

## 2. Problems to solve

### Customer-side problems
- Product discovery depends heavily on Instagram posts and conversations.
- Customers cannot independently browse a complete catalog and place an order through a structured checkout.
- Shipping price depends on destination and delivery method but is not calculated through a dedicated storefront workflow.
- Order status is not exposed through a dedicated customer experience.

### Business-side problems
- Orders are manually created/confirmed.
- Online and physical sales can become difficult to reconcile if they do not share one inventory model.
- Stock movement needs traceability.
- Batch/expiry-sensitive products need appropriate controls.
- Profit needs to account for product cost, delivery cost, discounts, returns and operating expenses.
- Multiple staff members may need different permissions.
- Courier and notification integrations need to be replaceable/fault-tolerant.

## 3. Business goals

1. Create a high-quality direct-to-customer storefront.
2. Reduce manual order-entry work.
3. Centralize online and physical sales.
4. Maintain accurate stock and traceability.
5. Improve delivery operations.
6. Give the owner useful profitability and operational reporting.
7. Build a foundation that can later add digital payments, notifications and additional couriers.

## 4. Primary actors

- **Customer:** browses products, buys as guest or account holder, tracks orders, reviews products.
- **Owner:** full business visibility and control.
- **Manager:** operational management subject to permissions.
- **Cashier:** physical sales/POS operations.
- **Warehouse/Stock operator:** stock and receiving operations if needed.
- **Order operator:** confirmation/dispatch workflow if needed.
- **Accounting/finance role:** expenses, cash reconciliation and reports if needed.
- **External courier:** ZR Express initially.
- **Future notification providers:** WhatsApp/SMS/email.

Roles are examples. Final roles should be derived from actual staff workflows; permissions should be granular.

## 5. Core customer journey

Instagram / direct traffic
→ storefront
→ catalog/search
→ product details
→ cart
→ checkout
→ COD order
→ confirmation
→ dispatch
→ delivery
→ completed order / review

## 6. Core operational journey

Purchase/receiving
→ inventory increase
→ sales from POS or online store
→ inventory deduction
→ delivery / fulfillment
→ return or exchange when applicable
→ financial impact
→ reporting

## 7. Commerce requirements

- Large catalog suitable for supplements and gym products.
- Categories and brands.
- Product variants such as size/flavor where needed.
- Product images.
- Selling price and cost information.
- SKU/barcode support.
- Stock availability.
- Optional batch and expiry tracking per product/variant.
- Product content fields suitable for supplement information.
- Search and filtering.
- Discounts/promotions/coupons controlled by admin.
- Reviews controlled/moderated by admin.

## 8. Order requirements

Order states should represent the real workflow and should be modeled as a state machine rather than arbitrary strings. Candidate lifecycle:

`pending → confirmed → preparing → shipped → delivered`

with controlled branches for `cancelled`, `failed_delivery`, `returned`, `partially_returned`, etc.

Every material state change should be auditable.

## 9. Delivery requirements

- ZR Express is the first integration target.
- Support home delivery and stop-desk delivery.
- Store customer shipping price separately from merchant courier cost.
- Delivery prices must be editable by admin.
- If supported by the courier API, provide a manual **Sync shipping rates** action.
- Manual rate management remains available as fallback.
- Shipment creation and tracking should support API workflows.
- Manual dispatch/tracking entry must remain possible when the provider is unavailable.
- Courier coverage should be modeled independently from Algeria's administrative geography.

## 10. Inventory requirements

- One current physical stock location.
- Inventory must be shared by online and POS channels.
- All inventory changes should be represented as movements/events with source and reason.
- Batch/lot and expiry fields are optional by product/variant but supported in the model.
- Low-stock and expiry alerts.
- Barcode support.
- Receiving/purchase records.
- Return-to-stock rules.
- Stock adjustments require permission and audit trail.

## 11. POS requirements

- Barcode-driven product lookup.
- Cart and quantity management.
- Cash payments initially.
- Shared inventory with online store.
- Printable receipt.
- Returns/exchanges.
- Cash register opening/closing and reconciliation.
- Architecture ready for future CCP/BaridiMob/other payment methods.

## 12. Returns & exchanges

Returns and exchanges are first-class workflows. Requirements include:

- Link return to original order/sale when possible.
- Record items/quantities and reason.
- Approval/status workflow.
- Correct inventory treatment.
- Financial impact.
- Exchange support where appropriate.
- Audit history.

## 13. Financial/reporting requirements

The platform should distinguish:

- Gross sales/revenue
- Discounts
- Product cost / COGS
- Customer-paid shipping
- Merchant delivery cost
- Returns/refunds
- Operating expenses
- Cash movements

Reports should include:

- Sales by period
- Profitability by product/variant
- Profitability by order/channel where feasible
- Product margins
- Delivery costs
- Expenses
- Returns
- Cash register reconciliation
- Inventory value/turnover indicators as supported by the chosen costing method

The platform is an operational business system, not a replacement for a licensed accounting package.

## 14. Customer accounts

- Guest checkout.
- Optional registration/login.
- Order history.
- Saved address(es) where useful.
- Language preference.

## 15. Localization

- French and Arabic.
- Automatic initial language detection may use device/browser preference.
- User must be able to switch language manually.
- RTL/LTR support is required.
- No hardcoded UI copy inside components.

## 16. Admin requirements

Admin areas should include at minimum:

- Dashboard
- Orders
- Products / variants
- Categories / brands
- Inventory
- Purchases / suppliers
- POS
- Customers
- Reviews
- Promotions/coupons
- Delivery settings/integrations
- Expenses
- Cash register
- Financial/profit reports
- Users/roles/permissions
- Audit log
- System settings

## 17. Non-functional requirements

- Mobile-first customer storefront.
- Responsive across desktop/tablet/mobile.
- Secure authentication and authorization.
- Input validation on server and client where appropriate.
- Rate limiting/abuse protection where needed.
- Reliable transactions for stock/order/financially sensitive operations.
- Idempotency for order and webhook processing.
- Database migrations under version control.
- Automated backups and documented recovery.
- Error monitoring and structured logging.
- Production secrets kept outside the repository.
- No critical dependency on a single third-party provider where a safe fallback is practical.

## 18. Scope discipline

The project should be delivered in phases. The core production release should prioritize storefront, ordering, POS, inventory, delivery, returns and essential financial reporting. Advanced marketing automation, additional couriers, digital payments and notification providers can be added after the core is stable.
