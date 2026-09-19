# Plazza Nutrition — Final Design & Frontend Freeze Audit

**Audit date:** 2026-09-19  
**Scope:** Design + frontend visual implementation only. Backend/core engineering remains deferred to Antigravity.

## 1. Freeze decision

The frontend is **not yet frozen**. The visual system and the majority of production-shaped surfaces are in place, but a final design pass is still required before handing the project to Antigravity.

This is not a backend blocker. The remaining work is visual/interaction work: dedicated treatment, responsive review, state coverage, RTL/LTR review, accessibility review, and handoff cleanup.

## 2. Source of truth used for this audit

Reviewed against the repository's active implementation and design documents:

- `artifacts/plazza-nutrition/src/App.tsx`
- `artifacts/plazza-nutrition/src/components/professional-surfaces.tsx`
- `artifacts/plazza-nutrition/src/components/coverage-surfaces.tsx`
- `artifacts/plazza-nutrition/src/index.css`
- `plazza-nutrition-main/docs/DESIGN_SYSTEM.md`
- `plazza-nutrition-main/docs/DESIGN_COVERAGE.md`
- `plazza-nutrition-main/docs/DESIGN_QA.md`
- `plazza-nutrition-main/docs/DESIGN_DECISIONS.md`
- `plazza-nutrition-main/docs/ANTIGRAVITY_FRONTEND_RULES.md`

## 3. What is already visually established

### Brand and system — PASS

- PN brand mark variants exist and are used consistently.
- Deep ink / warm paper / restrained orange / lime semantic system is centralized.
- Typography includes French/Latin and Arabic-capable families.
- Operations use higher density than the storefront.
- Statuses are designed with icon + label, not color alone.
- Motion is intentionally restrained and reduced-motion is documented.
- Product media is explicitly classified as reference/fixture media.
- No production API behavior is claimed by the fixture layer.

### Global navigation and language — PASS

- French LTR and Arabic RTL are wired at document level.
- Customer storefront has desktop navigation and mobile navigation.
- Operations has sidebar/rail navigation and mobile navigation treatment.
- Main customer routes and operations routes are explicitly registered.
- Route-level loading and error boundary support are present.

### Storefront commerce core — PASS WITH FINAL QA

The following surfaces are real visual implementations, not just route placeholders:

- Home
- Shop / category view / search view
- Product detail
- Cart page
- Cart drawer
- Checkout
- Confirmation
- Customer login
- Registration
- Recovery
- Verification
- Account/profile/addresses
- Orders list/detail
- Returns / exchanges / reviews aftercare surfaces

The key remaining task here is **final visual QA**, not a redesign.

### Operations core — PASS WITH FINAL QA

The active operations router currently maps major modules to dedicated components, including:

- Dashboard
- Orders
- Customers
- Products
- Categories
- Inventory
- Movements
- Purchasing
- Receiving
- POS
- Cash
- Staff / roles
- Delivery / returns / exchanges / refunds
- Finance
- Expenses
- Profitability
- Reports
- Coupons
- Reviews
- Notifications
- Audit
- Settings

Several modules intentionally share a domain-level surface (for example fulfillment and people/roles). This is acceptable, but each mode must still have distinct visual content, fields, state language, and next-action treatment.

## 4. Remaining design work — ordered by priority

### P0 — Must finish before freeze

#### A. Final responsive visual audit

Review every major customer and operations surface at:

- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440

Verify:

- no accidental horizontal overflow
- primary action remains visible
- tables have intentional mobile transformations
- drawers/sheets do not hide critical content
- sticky elements do not overlap content
- numeric fields remain readable
- touch targets remain comfortable
- dialogs fit short mobile viewports

#### B. Final RTL/LTR audit

Review the same critical surfaces in:

- French LTR
- Arabic RTL

Pay special attention to:

- table alignment
- icon direction
- chevrons / arrows
- form label hierarchy
- numeric values and prices
- dates
- mixed Arabic + Latin strings
- SKU / barcode / order references
- drawers and dialogs
- mobile navigation
- POS layout

Use `bdi` / isolated numeric treatment where needed.

#### C. Final state audit

Every major surface should visibly cover applicable:

- loading
- empty
- error
- retry
- success
- validation
- disabled
- unauthorized
- forbidden
- not found

Commerce-specific states:

- low stock
- out of stock
- expiring
- expired
- unavailable variant
- failed checkout
- failed delivery
- pending return
- pending exchange
- refund review

The existing state rails are useful, but the final pass must confirm that states read as part of the actual screen rather than as a detached checklist.

### P1 — Screens that still need a dedicated polish pass

#### Customer-facing information surfaces

Current implementation uses a reusable information-page template for:

- Delivery
- Help
- Contact
- About
- Policies
- Terms
- Privacy

They are visually coherent, but they should receive a final content/UX pass before freeze:

- stronger information hierarchy
- clear section structure
- contact/help actions
- delivery coverage/rate placeholders
- policy navigation
- mobile reading rhythm
- merchant/legal input markers

Do not invent missing legal, pricing, or provider content.

#### Promotions

The promotions surface should be reviewed as a real storefront discovery surface:

- offer hierarchy
- validity
- conditions
- coupon relationship
- expired/invalid states
- empty state
- CTA back to catalogue

Do not invent discount rules or campaign facts.

#### Fulfillment cluster

The active router uses a dedicated fulfillment surface for:

- Delivery
- Returns
- Exchanges
- Refunds

Do one final domain-by-domain pass so these modes do not feel like four skins on one generic page.

Minimum visual distinctions:

- Delivery: shipment, method, destination, provider/manual fallback, tracking, exception, retry
- Returns: order/item, reason, condition, evidence, decision, status
- Exchanges: original item, replacement variant, price difference, approval, new preparation
- Refunds: amount, method, reason, approval/decision, audit trace

#### Staff / roles

The active implementation groups staff and roles under a shared people surface. Keep the shared shell, but visually distinguish:

- staff list/profile
- invite/disable
- role assignment
- permission matrix
- forbidden state
- role-change confirmation
- audit trail

#### POS / cash

The POS is visually established and should receive a final task-focused pass:

- search / barcode affordance
- product selection
- cart editing
- customer association
- discount
- payment selection
- receipt preview
- return/exchange entry
- cash session state
- keyboard shortcuts
- touch targets
- no-result / unavailable item
- session closed state

Do not simulate an actual committed sale.

### P2 — Component and UX cleanup

- Ensure overlays use one consistent focus, Escape, scroll-lock, and focus-restoration pattern.
- Remove dead/duplicate prototype presentation paths where they are no longer reachable.
- Ensure every form field has label, required/optional status, validation, disabled, error and success treatment.
- Keep one coherent icon family.
- Keep status semantics consistent across storefront and operations.
- Keep product media replacement slot-compatible with approved merchant media.
- Review desktop/table/mobile density so the operations UI remains scan-friendly without becoming cramped.

## 5. Handoff cleanup

### Fixture boundaries — PASS

Keep these explicit:

- local fixture data
- reference/fixture media
- preview-only actions
- non-authoritative totals
- server-owned state warnings

### Demo credentials — HANDOFF BLOCKER

The current frontend contains demo operations credentials in `App.tsx`.

These are acceptable as a local visual-development fixture only. Before production engineering:

- do not copy the credentials into backend auth, seeds, tests, environment defaults, or deployment
- remove the hardcoded credential path when real auth is implemented
- replace it with the real auth contract
- ensure Antigravity treats the current login as a visual fixture, not an auth design contract

### Historical prompt/assets hygiene — HANDOFF REQUIREMENT

The repository contains historical `attached_assets/` material from prior Replit iterations.

Before handoff, make the active source of truth explicit:

1. project/master architecture documents
2. current design system
3. current coverage audit
4. current QA rules
5. current Antigravity frontend rules
6. current source code

Historical prompts/transcripts must not override the current rules.

## 6. Things deliberately NOT required before handoff

Do **not** expand this Replit phase into backend/core implementation.

The following remain Antigravity work:

- real authentication/session management
- RBAC enforcement
- PostgreSQL/Drizzle persistence
- API implementation
- order state machine execution
- authoritative totals
- inventory reservations/commit/release
- purchasing/receiving persistence
- batch/expiry logic
- delivery provider adapters
- ZR Express integration
- refunds
- finance calculations
- cash-session persistence/reconciliation
- notifications
- audit persistence
- webhooks/idempotency
- security hardening
- production tests
- deployment/runtime configuration

## 7. Freeze acceptance checklist

The project can be marked **DESIGN + FRONTEND FROZEN** when all boxes below are true:

- [ ] Customer critical flow visually reviewed: Home → Shop → Product → Cart → Checkout → Confirmation
- [ ] Customer account/auth/aftercare visually reviewed
- [ ] Operations dashboard/orders/customers/products visually reviewed
- [ ] Inventory/movements/purchasing/receiving visually reviewed
- [ ] Delivery/returns/exchanges/refunds visually reviewed
- [ ] POS/cash visually reviewed
- [ ] Finance/expenses/profitability/reports visually reviewed
- [ ] Staff/roles/coupons/reviews/notifications/audit/settings visually reviewed
- [ ] Delivery/help/contact/about/policies/terms/privacy visually reviewed
- [ ] 375/390/430 mobile review complete
- [ ] 768/1024/1280/1440 review complete
- [ ] French LTR review complete
- [ ] Arabic RTL review complete
- [ ] Loading/empty/error/retry/success/validation/disabled states reviewed
- [ ] Unauthorized/forbidden/not-found reviewed
- [ ] Critical overlays reviewed
- [ ] Keyboard-only path reviewed
- [ ] Reduced-motion behavior reviewed
- [ ] No invented merchant content or provider capability remains
- [ ] Fixture boundaries remain explicit
- [ ] Demo credentials are documented as non-production and are not transferred
- [ ] Historical assets/prompts are clearly subordinate to the current source of truth
- [ ] `ANTIGRAVITY_FRONTEND_RULES.md` matches the final frozen UI

## 8. Final handoff rule

After this checklist is complete:

> **Do not redesign the frontend in Antigravity.**
>
> Antigravity inherits the frozen visual system, route structure, component language, responsive behavior, RTL/LTR behavior, state language, and accessibility decisions.
>
> Antigravity's job is to replace fixture boundaries with authoritative services while preserving the visible product.

## 9. Current conclusion

**Design system:** ready  
**Brand language:** ready  
**Storefront architecture:** ready  
**Operations architecture:** ready  
**Visual state language:** ready  
**Production backend:** intentionally deferred  
**Final visual freeze:** pending the P0/P1 QA pass above

This document is the final frontend/design audit baseline for the handoff to Antigravity.
