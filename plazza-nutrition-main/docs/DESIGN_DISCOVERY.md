# Plazza Nutrition — Design Discovery

## 1. Product understanding

Plazza Nutrition is a unified commerce product for a premium sports-nutrition merchant in Algeria. It combines a bilingual storefront for customers with an operational workspace for order operators, cashiers, warehouse staff, finance, managers, and the owner. The first operational release is centered on catalog discovery, COD ordering, customer accounts, orders, POS, shared inventory, delivery operations, reviews, promotions, and essential reporting.

The product must feel like one credible brand across two very different densities:

- storefront: product-led, editorial, persuasive, and conversion-focused;
- operations: fast, structured, information-rich, and auditable.

The current build is a frontend design phase. Visual-development data is explicit mock data only. No mock action claims to have created a real order, reserved stock, captured payment, or dispatched a shipment.

## 2. Customer personas

- **Performance customer:** shops protein, creatine, pre-workout, vitamins, mass gainers, and accessories; values authenticity, availability, delivery clarity, and fast COD checkout.
- **Returning customer:** wants account history, repeat ordering, delivery visibility, returns, exchanges, and reviews.
- **Guest buyer from social traffic:** lands from Instagram or WhatsApp and needs to understand the catalog, price, delivery method, and COD flow without registering.

## 3. Staff personas

- **Order operator:** confirms customer orders, manages preparation and manual dispatch, and handles customer-facing order issues.
- **Cashier:** manages POS sales, cash sessions, receipts, and permitted returns/refunds.
- **Warehouse operator:** receives stock, records movements, manages batches/expiry, and handles barcode/catalog inventory work.
- **Finance:** manages expenses, cash reconciliation, reports, and policy-approved financial records.

## 4. Admin personas

- **Owner:** full business, security, financial, role, and settings authority.
- **Manager:** operational oversight across orders, products, inventory, delivery, customers, reviews, promotions, and reports without owner-only security authority.

## 5. Customer journey

Social/direct traffic → storefront → category/search → product detail → cart → COD checkout → confirmation → dispatch → delivery → completion → review or return/exchange.

## 6. Purchase journey

Discover a product, inspect brand/variant/size/price/availability, choose quantity, add to cart, review delivery and total, then submit COD order with customer contact and destination.

## 7. Checkout journey

Customer information → phone → wilaya → commune when required → home or stop-desk delivery → server-calculated shipping and total → COD confirmation → order confirmation state. The frontend must not treat browser totals as authoritative.

## 8. Order lifecycle

`pending → confirmed → preparing → shipped → delivered → completed`

Alternate paths include cancellation from permitted states and `shipped → failed_delivery → reattempting|returned`. Delivered orders can open a separate return record. Returns/exchanges do not rewrite the original order lifecycle.

## 9. Delivery journey

Select a documented delivery method and destination, show the customer charge separately from merchant courier cost where available, show provider/manual fallback states, and present shipment/tracking/exception status without inventing courier capabilities.

## 10. Return journey

Customer requests a return for an eligible completed order. Staff review reason, condition, disposition, authorization, and timestamps. The visual model distinguishes pending, approved, rejected, received, refunded, and closed states.

## 11. Exchange journey

Customer requests a replacement. The UI distinguishes same-price, higher-price difference collection, and lower-price refund/credit outcomes without encoding undocumented policy.

## 12. POS journey

Open/identify a cash session → search or scan a product → select variant/quantity → review cart and total → choose payment → issue receipt → close/reconcile session. V1 is online-first. Offline drafts are visibly non-authoritative and never imply committed stock or sales.

## 13. Inventory journey

Review available, reserved, committed, released, low-stock, out-of-stock, expired, expiring, damaged, and adjusted stock. Open movement history, adjust with reason and operator, and trace batch/expiry where applicable.

## 14. Purchasing journey

Review suppliers → create purchase order → track expected quantities and costs → receive quantities → record discrepancies → assign batch/expiry → update inventory through traceable movements.

## 15. Finance journey

Review revenue, discounts, customer shipping, product cost/COGS, courier cost, refunds/returns, order adjustments, expenses, cash reconciliation, product profitability, channel, and period. Charts must explain a real measure rather than decorate the screen.

## 16. Staff management journey

View staff → inspect role and permission scope → edit permitted access → record permission changes in audit history. The six initial roles are `OWNER`, `MANAGER`, `ORDER_OPERATOR`, `CASHIER`, `WAREHOUSE_OPERATOR`, and `FINANCE`.

## 17. Notification journey

Show provider-free internal events for order created, confirmed, shipped, delivered, cancelled, and return approved. Optional WhatsApp/SMS/email providers stay behind provider boundaries and feature flags.

## 18. Information architecture

### Storefront

Home, Shop, categories, search, product detail, promotions, cart, checkout, confirmation, account, orders, order detail, returns, exchanges, reviews, delivery information, help, contact, about, policies, terms, privacy, and not found.

### Operations

Dashboard, orders, order detail, customers, products, product editor, categories, inventory, movements, stock adjustments, purchasing, purchase orders, receiving, batches/expiry, delivery, shipments, returns, exchanges, refunds, POS, cash sessions, reconciliation, finance, expenses, profitability, reports, KPIs, coupons, review moderation, staff, roles, permissions, notifications, audit, and settings.

## 19. Navigation hierarchy

Customer navigation prioritizes Shop, Categories, Search, Promotions, Account, and Cart. Operations navigation groups Work (dashboard/orders/customers), Catalog (products/categories), Stock (inventory/purchasing/receiving), Fulfillment (delivery/returns/exchanges), Money (POS/finance/reports), and Control (staff/notifications/audit/settings).

## 20. Role-specific experiences

The shell can expose all documented modules for visual review, while role labels and disabled/forbidden states make authorization boundaries visible. Owner and Manager see oversight; operational roles see task-focused modules; cashier/POS prioritizes speed; warehouse prioritizes traceability; finance prioritizes numbers and reconciliation.

## 21. Mobile-specific experiences

Mobile is not a collapsed desktop. Customer flows keep product image, price, availability, quantity, and add-to-cart close together. Checkout uses short sections and intentional sheets. POS uses touch-friendly controls and persistent totals. Operations use bottom navigation or compact section switching, horizontal table scroll only where necessary, and full-screen sheets for filters/actions.

## 22. RTL/LTR considerations

French is LTR and Arabic is RTL. Direction changes layout flow, text alignment, breadcrumbs, navigation, tables, forms, dialogs, drawers, product gallery controls, checkout sections, POS controls, and chart labels. Physical directional icons are not blindly mirrored when their meaning is not directional.

## 23. Accessibility considerations

Use semantic landmarks, keyboard-reachable actions, visible focus, labels tied to inputs, non-color status labels, sufficient contrast, accessible names for icon buttons, reduced-motion support, and clear error/success announcements.

## 24. Visual opportunities

- Product photography and category composition should establish trust before marketing copy.
- Controlled orange can signal action and performance without turning every surface orange.
- A shared PN mark, athletic geometry, disciplined type, and editorial spacing can bridge storefront and operations.
- Operational timelines and status chips can make state machines legible without pretending the frontend owns them.
- Arabic typography is a primary design input, not a translation afterthought.

## 25. UX risks

- Hiding products behind a marketing hero.
- Treating COD as a generic payment form.
- Showing client-calculated totals as authoritative.
- Making delivery geography look like courier coverage.
- Making POS decorative rather than fast.
- Making inventory statuses color-only.
- Letting a failed provider state look like a successful shipment.

## 26. Design risks

- Overusing dark/orange to the point of becoming a supplement-store cliché.
- Generic rounded-card SaaS layouts.
- Fake reviews, fake metrics, fake catalog claims, or fabricated packaging.
- Arabic and French feeling like different products.
- One density applied to storefront, checkout, POS, and finance.

## 27. Missing information

Merchant-specific product catalog, product imagery, exact prices, legal/tax identity, published terms, return exceptions, delivery rates, ZR capabilities/credentials, geography dataset version, and final operational configuration are not present in the frontend phase.

## 28. Assumptions

- Visual catalog entries are clearly marked as representative fixtures until real catalog data is connected.
- COD is the initial checkout payment method.
- Home and stop-desk are the documented delivery modes.
- The frontend uses replaceable mock service interfaces rather than fake API calls.
- No frontend screen claims production readiness.

## 29. Questions that are genuinely blocking

None block the visual foundation. Production integration will require the missing merchant/catalog, legal, geography, delivery-provider, and payment/accounting inputs above.

## 30. Proposed visual direction

Plazza Nutrition should feel premium, athletic, credible, disciplined, energetic, and sophisticated. The visual language should use strong typography, product-first composition, controlled orange accents, deep ink surfaces, warm paper/light surfaces, and intentional asymmetry. It should avoid gamer, crypto, childish, generic SaaS, and cheap supplement-store signals.
