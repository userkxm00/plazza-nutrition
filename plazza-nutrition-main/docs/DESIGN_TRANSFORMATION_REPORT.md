# Plazza Nutrition — Design Transformation Report

## Purpose

This report records the frontend transformation pass that brought the storefront and operations workspace from a grouped fixture foundation toward a reviewable, bilingual product experience. It is a design handoff document, not a claim of production readiness.

## Product interpretation

Plazza Nutrition is a sports-nutrition storefront and commerce operations workspace for Algeria. The customer experience should make product, price, availability, delivery expectations, and the next action visible early. The operations experience should be denser and faster without becoming a separate brand.

The visual identity is built around:

- Deep navy for confidence and operational focus.
- Warm off-white for the reading surface.
- Controlled orange for action and energy.
- Utility lime for positive operational signals.
- Editorial typography and visible fixture labels instead of generic rounded-card UI.

French LTR and Arabic RTL are treated as first-class presentation modes. Product media remains clearly marked as reference media until merchant-approved assets are available.

## Transformation scope

### Storefront and customer flow

- Product detail now exposes gallery selection, zoom, variant availability, quantity control, old-price placement, delivery estimate boundary, product metadata placeholders, nutrition/ingredients/usage states, review empty state, and related products.
- Cart retains line removal and quantity changes, coupon validation feedback, recalculable totals, empty-cart behavior, and an explicit server-owned pricing boundary.
- Checkout provides guest/account choice, field-level validation, home or stop-desk delivery selection, delivery quote failure and retry, COD explanation, stale/unavailable boundary messaging, and a pending confirmation state.
- Confirmation separates a local pending reference from a confirmed order and provides return-to-shop, retry, copy-reference, and print actions.
- Account and aftercare routes expose unauthorized, success, pending, moderation, and local-preview states.

### Operations workspace

- Inventory and movement views expose available, reserved, committed, damaged, low-stock, out-of-stock, expiring, batch, reason, source, and operator concepts.
- Purchasing and receiving distinguish supplier, purchase order, expected quantity, received quantity, discrepancy, unit cost, lot, expiry, and receiving notes. Partial receiving is kept open rather than silently closing the order.
- POS keeps search, scan affordance, customer lookup, quantity control, draft cart, receipt preview, payment type, and online-first boundary visible.
- Cash reconciliation exposes opening float, expected cash, actual cash, variance, operator, approval boundary, and a local close preview.
- Finance and reports use visible fixture values only, provide period/channel/product filters, show unavailable COGS and profitability values honestly, and provide a local export-prepared state.
- Staff and roles show scope, active/forbidden states, permission matrix concepts, invite/create dialogs, and audit boundary.
- Remaining operational modules retain a consistent local workflow frame with search/filter, table, loading, retryable error, success, module-specific field contracts, controlled local action forms, and server-boundary states.

## Interaction foundation

The shared preview overlays now provide:

- Escape-to-close.
- Initial focus on the first usable control.
- Focus restoration to the previously active element.
- Background scroll locking while open.
- Tab and Shift+Tab focus containment.
- Dialog labelling for assistive technology.
- The cart drawer uses the same keyboard behavior as preview dialogs instead of being a separate accessibility path.
- Explicit local-only and non-authoritative confirmation language.

The foundation deliberately avoids pretending that a local interaction is persistence. Server-owned behavior remains visible as a boundary until the API contract and merchant configuration are connected.

## Accessibility and responsive review

- Interactive controls use visible focus rings and labels.
- Status uses icon, text, and color rather than color alone.
- Tables intentionally scroll horizontally on narrow screens.
- Storefront mobile navigation remains persistent and checkout/product routes use the static brand mark.
- Operations navigation collapses to a mobile section drawer.
- Arabic changes document direction and uses the same interaction model rather than a separate page tree.
- Reduced-motion behavior remains governed by the shared stylesheet and existing motion tokens.

## Honest limitations

The current implementation is still a local fixture boundary. It does not provide:

- Real persistence, authentication, authorization enforcement, or sessions.
- Merchant-owned catalog truth, legal copy, delivery rates, provider capabilities, or payment capture.
- Authoritative stock, price, coupon, refund, profitability, or shipment transitions.
- Real export files, tracking, notifications, or offline POS commits.

These limitations are intentionally shown in the UI rather than hidden behind optimistic success messages.

## Verification completed for this pass

- Full workspace TypeScript check passes.
- Root storefront screenshot reviewed at desktop width.
- Product detail screenshot reviewed at mobile width.
- Inventory operations screenshot reviewed at desktop width.
- Browser console shows Vite and React startup messages without application errors on the reviewed routes.
- TypeScript check passes after the interaction and field-completeness pass.

## Next production-facing sequence

1. Freeze merchant catalog, geography, delivery, legal, and policy inputs.
2. Define the authoritative API contracts for catalog, cart, checkout, orders, inventory, POS, and permissions.
3. Connect authentication and authorization using the selected managed identity provider.
4. Replace local fixture actions with server mutations and cache invalidation.
5. Repeat the review matrix across 375, 390, 430, 768, 1024, 1280, and 1440 widths in both languages.