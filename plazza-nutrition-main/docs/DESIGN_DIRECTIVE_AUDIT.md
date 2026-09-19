# Plazza Nutrition — Design-First Directive Audit

## Verdict

The current frontend covers all major product families named by the design-first directive:

- storefront and catalog discovery
- product detail
- cart and COD checkout
- customer account, orders, returns, exchanges, and reviews
- delivery/help/content surfaces
- operations shell
- orders, customers, products, categories
- inventory, movements, purchasing, receiving, batches/expiry
- delivery, returns, exchanges, refunds
- POS and cash reconciliation
- finance, expenses, profitability, reports
- staff, roles, permissions, notifications, audit, and settings

That is **surface coverage**, not production completion. The frontend remains a local fixture boundary and several surfaces still need deeper field-level design, route-specific states, role variants, and browser QA before the directive's final quality gate can be marked complete.

## What is already aligned

### Product and brand

- The storefront uses the approved Plazza direction: deep ink, warm paper, controlled orange, utility lime, editorial typography, product-first composition, and restrained motion.
- Storefront and operations share tokens but use different density.
- Product media is visibly marked as reference or merchant media, with accessible alt text.
- No real nutritional claims, reviews, courier capabilities, prices, or policy decisions are fabricated.

### Architecture boundary

- The frontend uses explicit local fixtures.
- The API server remains health-only rather than pretending to create orders or stock.
- UI copy, visual fixtures, and server-owned boundaries are documented.
- The future backend can replace the fixture layer without treating browser totals, stock, permissions, or status transitions as authoritative.

### Customer journey

- Home, shop, categories, search, product route, cart, checkout, confirmation, auth, account, orders, aftercare, content, and not-found routes exist.
- Cart drawer and preview dialogs have focus management, Escape close, scroll lock, focus restoration, and local-only confirmation language.
- Checkout exposes customer identity, phone, address, wilaya, commune, delivery mode, COD, quote failure/retry, and unavailable stop-desk behavior.

### Operations journey

- The navigation exposes the documented operations families.
- Inventory, receiving, POS/cash, finance, staff/roles, and generic operations surfaces have local forms, tables, statuses, and boundary messaging.
- Generic operation modules now expose module-specific field contracts instead of only a generic action button.

## Important gaps before claiming “complete design”

### 1. Product content and product card depth

The current `Product` fixture has name, Arabic name, category, format, price, stock, media, description, and tags. The directive also requires a visual contract for:

- brand
- SKU/barcode
- variant and size/format as separate concepts
- compare-at/old price
- discount
- rating/review count
- delivery estimate
- nutrition panel
- ingredients
- usage
- related products
- unavailable variant behavior

The UI must show these as explicit pending/merchant-owned fields without inventing values. Product detail currently has the strongest image/title/price/availability/quantity path, but not a complete tabbed or sectioned contract for every item above.

### 2. Shop discovery behavior

The shop has query, category, availability, reset, empty, and product cards. It still needs explicit design for:

- sort
- pagination or load-more behavior
- mobile filter sheet
- search error/network state
- category-specific empty state
- unavailable result explanation
- result count semantics after filtering

### 3. Promotions and offers

Promotions currently resolve to an information surface. The directive calls for a real visual contract for:

- offer listing
- conditions
- validity
- coupon entry
- invalid code
- expired code
- already-used code
- unavailable promotion

This can remain a fixture, but it should not remain only an informational paragraph.

### 4. Customer orders

The customer order list and detail are present, but the deeper design contract still needs:

- filters
- lifecycle timeline
- immutable item snapshot
- payment detail
- delivery detail
- cancellation eligibility
- failed-delivery state
- tracking/exception presentation
- order-level action menu
- loading/empty/error/not-found variants

### 5. Operations sub-surfaces

The current operations shell covers the domains, but the following should become visibly distinct sub-surfaces rather than only module-level fixtures:

- order detail
- product editor
- purchase-order detail
- shipment detail
- batch detail
- cash-session detail
- notification detail/panel
- audit event detail
- settings sections

Each needs its own fields, action permissions, state transitions, and destructive confirmation where applicable.

### 6. Overlays, drawers, and sheets

The shared dialog foundation is present. The remaining design inventory must explicitly include:

- mobile filter sheet
- product selector
- customer selector
- order action menu
- notification panel
- command/search interface
- stock adjustment dialog
- return/exchange decision dialog
- POS payment/receipt dialog
- permission-change dialog
- destructive confirmation for every destructive action

An overlay is not complete merely because the route behind it exists.

### 7. State matrix

The reusable state language exists, but the directive requires route-level verification for:

- loading
- empty
- validation error
- disabled
- unavailable
- retryable/network error
- success
- unauthorized
- forbidden
- not found
- low stock
- out of stock
- expired
- expiring
- unavailable variant
- failed checkout
- failed delivery
- pending return
- pending exchange

The next pass must map each state to a concrete screen and test path. A shared component alone is not enough evidence.

### 8. Role-specific experiences

The role matrix is represented visually, but the following task-focused variants still need explicit review:

- owner
- manager
- order operator
- cashier
- warehouse operator
- finance

The interface should demonstrate not only a permission table, but also how the navigation, available actions, disabled states, and forbidden states change per role.

### 9. RTL/LTR verification

The language switch changes document direction and the major surfaces use logical layout utilities. Full directive compliance still requires rendered review of:

- navigation and breadcrumbs
- product gallery controls
- checkout fields and summaries
- tables
- dialogs and drawers
- POS
- finance/report charts
- notifications
- mobile sheets

Arabic copy also needs a final authored-language review; some fixture placeholders remain French-shaped or generic.

### 10. Responsive and accessibility verification

The design rules cover 375, 390, 430, 768, 1024, 1280, 1440, and wide desktop. Screenshots so far cover only a subset. Remaining verification should include:

- intentional mobile layouts, not only stacked desktop
- keyboard traversal through all dialogs and tables
- screen-reader names and error announcements
- reduced-motion behavior
- focus order in mobile navigation and sheets
- intentional table overflow
- contrast and status meaning without color alone

### 11. Performance and asset provenance

The current product media is reference material, not confirmed merchant packaging. Before production handoff:

- confirm media licenses/provenance
- replace reference media with merchant-approved assets
- compress and lazy-load large media
- confirm no unnecessary bundle growth
- verify image alt text against final assets

## Field completeness matrix

| Domain | Fields that must have a visual contract | Current truth |
| --- | --- | --- |
| Customer | name, phone, email, address, wilaya, commune, delivery mode, stop-desk, note | Mostly present in auth/account/checkout; stop-desk remains unavailable fixture |
| Product | name, brand, category, variant, size, SKU/barcode, price, old price, discount, stock, threshold, media, alt, ingredients, nutrition, usage, visibility | Core present; brand/SKU/price-history/content panels remain incomplete |
| Cart | item image, variant, quantity, remove, price, subtotal, coupon, shipping, total, recalculation | Core present; coupon/removal depth and server recalculation remain fixture |
| Order | reference, customer, immutable items, totals, payment, delivery, status, reason, notes, history, actor, timestamps | List/detail present; lifecycle/history/action depth remains incomplete |
| Inventory | available, reserved, committed, released, damaged, reason, batch, expiry, source, operator | Strong fixture coverage; authoritative transitions remain absent |
| Purchasing | supplier, PO, expected, received, discrepancy, cost, batch, expiry, notes | Receiving form covers the core fields; PO/supplier detail needs deeper screen |
| POS/cash | session, operator, items, quantities, payment, expected, actual, variance, receipt | Core fixture exists; keyboard/touch and cash-session detail need review |
| Finance | period, channel, revenue, discounts, shipping, COGS, courier cost, refunds, expenses, cash, profitability | Filters and explicit unknowns present; real calculations intentionally absent |
| Access/control | identity, role, permission, active state, actor, reason, timestamp | Matrix and staff fixture present; role-specific navigation/actions need deeper variants |
| Delivery | shipment, state, tracking, provider/manual fallback, destination, exception, failed delivery, returns | Local delivery surface exists; provider contract and shipment detail remain pending |

## Recommended development order

### Priority 1 — Customer trust

1. Complete product detail content contract.
2. Add shop sort, pagination/load-more, and mobile filter sheet.
3. Expand promotions/coupon states.
4. Complete customer order lifecycle/detail/action states.

### Priority 2 — Operational depth

1. Split order, product, purchase-order, shipment, batch, cash-session, notification, audit, and settings details.
2. Add selector/action/decision overlays and mobile sheets.
3. Add role-specific navigation and action variants.

### Priority 3 — Quality gate

1. Execute the state matrix by route.
2. Verify all listed viewport sizes in French and Arabic.
3. Run keyboard, screen-reader, reduced-motion, overflow, and contrast checks.
4. Add automated critical-flow tests.

### Priority 4 — Engineering handoff

1. Freeze merchant catalog and media.
2. Freeze geography and delivery rules.
3. Freeze legal/return/coupon policy.
4. Connect documented API contracts.
5. Replace fixtures with authoritative reads/mutations and idempotent retry behavior.

## Recommendation

Do not restart or discard the current frontend blindly. The current artifact is a useful visual foundation and already satisfies the directive's brand, route-family, fixture-boundary, and design-system intent. Continue with the gaps above as a deliberate second design pass, then hand the documented contracts to the backend phase. A restart would risk losing the current coverage and would not solve the missing field/state depth by itself.
