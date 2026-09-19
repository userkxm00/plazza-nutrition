# Plazza Nutrition — Requirements Baseline v0.1

## Functional requirements

### FR-001 Storefront
The system shall provide a responsive, mobile-first storefront for browsing products, categories, brands and offers.

### FR-002 Product detail
The system shall display product content, variants, pricing, availability and relevant supplement information.

### FR-003 Cart
The system shall support adding/removing products, quantity changes, discounts and shipping totals.

### FR-004 Checkout
The system shall support guest checkout and authenticated checkout with COD as the initial payment method.

### FR-005 Customer accounts
Customers may create an account and view relevant order history/profile information.

### FR-006 Orders
The system shall create a durable order record with immutable pricing snapshots for order items and applicable shipping information.

### FR-007 Order lifecycle
Order status transitions shall be controlled and auditable.

### FR-008 Inventory
The system shall maintain authoritative stock shared by online and POS sales.

### FR-009 Inventory movements
Stock changes shall be attributable to a source/reason, such as sale, purchase, return, exchange, adjustment or cancellation.

### FR-010 Batch/expiry
Products that require lot/batch/expiry tracking shall support it without forcing those fields on products that do not need them.

### FR-011 Purchasing
The system shall optionally record suppliers and purchase receipts, including cost and batch information where applicable.

### FR-012 POS
The system shall provide a physical-store point-of-sale workflow with barcode lookup and cash payment initially.

### FR-013 Cash register
The system shall support opening/closing sessions, expected cash and actual cash reconciliation.

### FR-014 Returns
The system shall support returns linked to the originating sale/order where possible.

### FR-015 Exchanges
The system shall support exchanges with correct inventory and financial effects.

### FR-016 Delivery
The system shall support home delivery and stop-desk delivery models.

### FR-017 Delivery integration
The system shall integrate with ZR Express when available and maintain a manual dispatch fallback.

### FR-018 Delivery pricing
Customer shipping charges and merchant delivery costs shall be stored separately.

### FR-019 Shipping-rate synchronization
Admin shall have an explicit sync action to retrieve courier rates/coverage where the provider API supports it. Manual overrides remain possible.

### FR-020 Customers
The system shall provide a customer record with order history and operational information useful for CRM.

### FR-021 Reviews
Admins shall be able to enable/disable reviews and moderate submissions.

### FR-022 Promotions
Admins shall control coupons and promotional rules.

### FR-023 Staff access
The system shall support multiple staff accounts with role/permission based authorization.

### FR-024 Audit log
Sensitive administrative, stock and financial actions shall create an audit trail.

### FR-025 Expenses
Authorized staff shall be able to record categorized business expenses.

### FR-026 Profitability
The system shall calculate documented profitability metrics by product/variant/order and time period where sufficient data exists.

### FR-027 Future payment methods
The payment domain shall support future CCP, BaridiMob and other methods without rewriting the core sales/order model.

### FR-028 Notifications
Notifications shall be delivered through provider interfaces so WhatsApp/SMS/email can be added later.

### FR-029 Localization
The storefront and relevant admin surfaces shall support French and Arabic, including RTL/LTR.

### FR-030 Printable documents
The system shall support printable customer invoices/receipts and POS receipts where appropriate.

## Non-functional requirements

### NFR-001 Security
Authentication, authorization, input validation, secret handling and abuse protection shall be designed before production deployment.

### NFR-002 Data integrity
Order, inventory and financial operations shall use transactional/atomic patterns appropriate to the final database and framework.

### NFR-003 Idempotency
Order creation endpoints and external webhook handlers shall be safe against duplicate delivery/retry where required.

### NFR-004 Availability
Critical storefront/order functionality shall not depend on optional notification integrations.

### NFR-005 Recoverability
Production data shall have an automated backup strategy and a verified restore procedure.

### NFR-006 Observability
Production shall expose structured logs, error monitoring and sufficient operational diagnostics.

### NFR-007 Maintainability
External providers shall be isolated behind interfaces/adapters. Business rules shall not be embedded in UI components.

### NFR-008 Testability
Core pricing, stock, order, return, permission and profitability rules shall be covered by automated tests.

### NFR-009 Performance
The storefront should be optimized for mobile traffic from social channels, with efficient images, caching and minimized client-side JavaScript where appropriate.

### NFR-010 Portability
The final architecture should avoid unnecessary lock-in to proprietary domain storage or provider-specific business rules.

## Open questions

- Final costing method for inventory/COGS (e.g. FIFO, weighted average, batch-specific cost).
- Exact POS payment expansion requirements.
- Final ZR API capabilities and authentication details available to the merchant account.
- Exact delivery territory hierarchy and stop-desk data source.
- Tax/invoice requirements applicable to the merchant.
