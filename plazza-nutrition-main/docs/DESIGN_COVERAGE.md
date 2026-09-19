# Plazza Nutrition — Design Coverage & Gap Audit

This document is intentionally more detailed than a route list. A grouped visual foundation is not the same as a complete design for every screen, state, field, role variation, and mobile interaction.

## Status meanings

- `complete visual` — the surface has its own reviewed visual treatment and interaction states.
- `foundation only` — the surface is represented by shared components or a simplified fixture, but still needs a dedicated design pass.
- `mock boundary` — the visual flow is demonstrable locally and explicitly does not claim persistence or authority.
- `planned` — the surface is documented but is not yet represented as a dedicated UI.
- `needs real API` — the visual contract exists, but authoritative data/actions are still backend work.
- `needs merchant input` — the UI cannot be finalized without catalog, legal, geography, rate, provider, or policy input.

## Current truth

The current frontend has a strong shared visual foundation, storefront shell, product-first catalog, dedicated product detail/cart/COD checkout previews, customer authentication/account/aftercare surfaces, a dedicated operations entry at `/ops`, a dedicated attention dashboard, a responsive orders workspace, dedicated operations views for customers, products, inventory, purchasing, receiving, delivery, returns/exchanges/refunds, POS/cash, finance, coupons, moderation, staff, notifications, audit and settings, reusable local overlays, visible state strips, and bilingual direction switching. The cart drawer and preview dialogs now share keyboard focus containment, Escape close, scroll lock, and focus restoration. Generic operations modules expose module-specific field contracts and a local action form rather than an unlabeled generic action.

It does **not** yet have authoritative persistence or a complete production workflow for every item below. These surfaces are intentionally local fixtures: their loading, empty, retryable error, unauthorized/forbidden, and success states communicate the future API boundary without claiming that a real account, order, payment, stock movement, refund, permission, or provider event was created.

## Customer storefront inventory

| Surface | Required screens / fields / states | Current status |
| --- | --- | --- |
| Home | hero, product-first entry, category discovery, best sellers, campaign/offer, trust proof, final CTA, footer, loading/error | foundation only; local fixture |
| Shop | product listing, category view, search results, filters, sort, pagination/load more, empty, unavailable, network error | foundation only; local fixture |
| Product detail | gallery, zoom, brand, title, variants, size/format, price/old price, discount, quantity, availability, delivery estimate, details, nutrition, ingredients, usage, reviews, related products, unavailable variant | mock boundary; merchant content fields remain explicitly pending |
| Cart | line image/product/variant/quantity, remove, subtotal, discount, coupon field, shipping, total, recalculation warning, empty, unavailable item | mock boundary |
| Checkout | guest/auth choice, name, phone, address, wilaya, commune, delivery mode, stop-desk selection where available, shipping, COD, order summary, validation, delivery unavailable, failed quote, retry | mock boundary |
| Confirmation | reference, confirmed/pending distinction, summary, delivery expectations, next steps, print/share where applicable, failure/retry | mock boundary; local reference copy and retry are represented |
| Authentication | login, registration, password recovery, verification, session expired, unauthorized, forbidden | mock boundary |
| Account | profile, phone, addresses, default address, settings, logout/session state | mock boundary |
| Orders | list, filters, empty, order detail, item snapshot, totals, payment, destination, lifecycle, cancel where allowed, tracking, failed delivery | mock boundary; list and detail fixtures |
| Returns | eligible item selection, reason, condition, evidence if required, request status, approval/rejection/received/refunded/closed | mock boundary |
| Exchanges | item selection, replacement variant, price difference, approval, new preparation, status | mock boundary |
| Reviews | eligible order item, rating, text, submission success/error, moderation pending, customer empty state | mock boundary |
| Promotions | offer listing, conditions, validity, coupon entry, invalid/expired/already-used states | foundation only; currently information page |
| Delivery/help/content | delivery methods, coverage boundary, rates placeholder, FAQ, contact, about, policies, terms, privacy, 404 | foundation only; content/legal input pending |

## Operations inventory

| Module | Required dedicated design | Current status |
| --- | --- | --- |
| Dashboard | attention queue, recent activity, order flow, stock signals, role-aware empty/loading/error | mock boundary; dedicated fixture |
| Orders | search, filters by status/customer/payment/delivery/amount/date, bulk/action menu, detail, lifecycle, history, cancellation | mock boundary; list/detail fixture |
| Customers | search, profile, contact, addresses, order history, notes/operational flags, empty/error | mock boundary |
| Products | catalog list, product detail, editor, variants, pricing, availability, media, attributes, validation | mock boundary |
| Categories/brands | list, create/edit, ordering, visibility, product assignment, empty | mock boundary |
| Inventory | available/reserved/committed/released, low/out/expired/expiring/damaged, filters, batch view | mock boundary |
| Movements/adjustments | movement history, source/reason, operator, stock adjustment form, confirmation, audit result | mock boundary |
| Purchasing | suppliers, purchase orders, expected/received quantities, cost, discrepancy, status | mock boundary |
| Receiving | receipt workflow, partial receipt, discrepancy resolution, batch/expiry assignment, confirmation/error | mock boundary |
| Batches/expiry | lot/batch detail, expiry warnings, FEFO-oriented view where applicable, expired/expiring states | mock boundary; batch detail awaits merchant contract |
| Delivery/shipments | shipment detail, method, destination, provider/manual fallback, tracking, exception, failed delivery, reattempt/return | mock boundary |
| Returns/exchanges/refunds | queues, detail, decision, disposition, refund/credit, inventory effect, destructive confirmation | mock boundary |
| POS | cash session open/close, search/scan, variant/quantity, cart, totals, payment, receipt, returns/exchanges, keyboard/touch | mock boundary |
| Cash/reconciliation | opening float, expected cash, actual cash, variance, close session, approval/error | mock boundary |
| Finance | revenue, discounts, shipping, COGS, courier cost, refunds, adjustments, expenses, cash, period/channel/product | mock boundary |
| Expenses/profitability | expense entry/categories, approval, documented margin calculation, period filters, no-data state | mock boundary |
| Reports/KPIs | supported measures only, date/channel/product filters, tables/charts, export/print boundary, empty/error | mock boundary |
| Coupons/promotions | rules, eligibility, validity, usage limits, create/edit/disable, invalid state | mock boundary |
| Reviews moderation | queue, detail, approve/reject, reason, status history | mock boundary |
| Staff/roles/permissions | staff list, invite/disable, role scope, granular permission matrix, forbidden state | mock boundary |
| Notifications | internal event inbox, read/unread, event detail, provider boundary, failure state | mock boundary |
| Audit | filters, actor/action/entity/time, immutable detail, empty/error | mock boundary |
| Settings | merchant identity, catalog behavior, delivery config, notification flags, policy links, security/session | mock boundary |

## Overlays and operational surfaces

| Surface | Required variants | Current status |
| --- | --- | --- |
| Dialogs | destructive confirmation, edit/create, stock adjustment, return, exchange, POS payment/receipt, permission change | mock boundary; shared focus behavior and local confirmation |
| Drawers | cart, order actions, notifications, filters, product/customer selectors | mock boundary; cart drawer now traps focus and restores it on close |
| Mobile sheets | filters, actions, selectors, checkout sections, POS payment, receiving | mock boundary |
| Command/search | global search, product scan/search, customer/order lookup, keyboard shortcuts | foundation only; local POS search only |
| Toasts/alerts | success, validation, retryable error, network error, unauthorized/forbidden | foundation only |

## State coverage audit

| State family | Expected coverage | Current truth |
| --- | --- | --- |
| Loading/skeleton | every major route and data block | reusable local strip; route-specific loading remains API work |
| Empty | catalog, search, cart, orders, customers, inventory, notifications, audit, reports | reusable strip plus route fixtures |
| Error/network/retry | route, list, form submit, quote, delivery, provider | reusable retryable strip plus checkout validation fixture |
| Success | add-to-cart, save, submit, order/return/exchange request, receipt, settings | reusable success strip plus local action feedback |
| Validation/disabled | forms, unavailable variants, permission-limited actions | visible on forms, unavailable products, overlays and role fixture |
| Unauthorized/forbidden/not found | customer auth, role access, missing records | unauthorized account, forbidden staff fixture, and local not-found views |
| Commerce states | low/out/expired/expiring, failed checkout/delivery, pending return/exchange | explicit fixture labels and pending/error states; authoritative rules remain API work |

## Field completeness checklist

Before declaring a surface complete, verify the UI has a clear label, value/control, validation, disabled state, error message, success feedback, and mobile treatment for every applicable field:

- Customer: full name, phone, email when enabled, address, wilaya, commune, delivery method, stop-desk, notes.
- Product: name, brand, category, variant, size/format, SKU/barcode, price, compare-at price, discount, availability, stock threshold, media, alt text, ingredients, nutrition, usage, visibility.
- Cart/checkout: quantity, remove, coupon, subtotal, shipping, total, customer details, destination, COD confirmation, retry/recalculation.
- Order operations: reference, customer, items, immutable item price, payment, delivery, status, reason, notes, history, actor, timestamps.
- Inventory: available, reserved, committed, released, damaged, adjustment reason, batch/lot, expiry, source, operator.
- Purchasing/receiving: supplier, PO, expected quantity, received quantity, discrepancy, unit cost, batch, expiry, receiving notes.
- POS/cash: session, operator, opening float, items, quantities, payment type, expected cash, actual cash, variance, receipt.
- Finance: period, channel, revenue, discounts, shipping, COGS, courier cost, refunds, expenses, cash, profitability basis.
- Access/control: staff identity, role, permission, active state, actor, reason, audit timestamp.

## Plan alignment

The documented roadmap remains coherent: discovery and contracts first, then storefront/order core, delivery, POS, inventory/purchasing, finance, staff/security, optional integrations, and hardening. The next frontend work should follow that dependency order:

1. Finish customer trust-critical screens: authentication, account/profile/addresses, product content/variants, cart coupon/removal, checkout address/geography/error states.
2. Replace local fixture actions with authoritative API contracts while preserving the visible local boundary.
3. Review mobile + RTL/LTR and keyboard paths for each module, then add automated critical-flow coverage.
4. Freeze merchant-input contracts before adding real catalog, legal copy, delivery rates, courier capabilities, or payment methods.
5. Only then connect server-owned API behavior and production integrations.

## Coverage policy

- A grouped row never counts as proof that every child screen is complete.
- A screen is not complete until its desktop/mobile, RTL/LTR, loading/empty/error/success, validation/disabled, accessibility, and relevant overlay variants are reviewed.
- Visual fixtures must stay explicitly labelled until merchant data or authoritative APIs replace them.
- This audit is the honest baseline for the next frontend pass; it supersedes optimistic “all surfaces represented” wording elsewhere.
