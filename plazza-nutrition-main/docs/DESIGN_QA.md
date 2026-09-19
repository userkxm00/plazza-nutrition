# Plazza Nutrition — Design QA

## Review matrix

Every major surface is reviewed at:

- 375/390/430 mobile
- 768 tablet
- 1024 compact desktop
- 1280/1440 desktop
- French LTR
- Arabic RTL
- keyboard-only navigation
- reduced-motion preference

## Visual checks

- Product, price, availability, and primary action are visible early in the storefront journey.
- No page relies on a generic gradient, excessive glass, or repeated rounded-card pattern.
- Storefront, checkout, POS, inventory, finance, and admin use appropriate density.
- No horizontal overflow outside intentional data tables.
- Typography remains legible in French and Arabic.
- PN mark is recognizable at lockup, standalone, favicon, and monochrome sizes; the orange stroke appears once and never continuously rotates.
- Status is never communicated by color alone.
- Empty, loading, error, success, unavailable, forbidden, and not-found states are recognizable.

## Interaction checks

- Main navigation and route changes work.
- Cart add/remove/quantity behavior gives visible feedback.
- Checkout fields have labels, validation, and a non-authoritative mock boundary.
- Admin filters, tabs, drawers, and dialogs have usable focus order.
- POS shows online-first connectivity and never claims an offline commit.
- Finance and reports use only visible local fixture values and label analytical boundaries.
- Destructive operations require confirmation.
- Cart drawers and preview dialogs restore focus, contain Tab navigation, close on Escape, and lock background scrolling.
- Checkout cannot preview a submission without a wilaya, and the unavailable stop-desk option exposes a blocking validation state.
- Operations action forms use controlled inputs and module-specific field labels; no action should silently discard typed values.

## Browser verification

Run the app through the managed preview and inspect the rendered UI, console, images, typography, responsive behavior, RTL direction, forms, buttons, dialogs, and mobile navigation. Screenshot major surfaces when browser capture is available.

## Acceptance boundary

This design phase is complete when the product feels coherent across the documented surfaces and the handoff documents are accurate. Production readiness still requires real APIs, authentication, authorization enforcement, merchant catalog/configuration, automated critical-flow tests, integration validation, security review, and staging acceptance.

### Media limitation

No real product media is currently available in the workspace. Fixture compositions must stay visibly labelled until merchant photography or approved product assets are supplied.

### Current implementation pass

- Product media is optional and must be merchant-supplied with accessible alt text; absent media uses the labelled visual-fixture fallback in the production-sized frame.
- Arabic review checks authored hierarchy and natural commerce phrasing in the hero, product detail, empty states, Finance, Reports, and POS. Price and quantity figures remain isolated/readable.
- At 375/390/430 widths, the storefront hero puts the product reference and primary shop action ahead of secondary delivery copy; the persistent bottom navigation remains usable.
- Finance and Reports show only values derived from current fixtures. POS visibly distinguishes selected cart lines, local draft actions, and the non-authoritative/server-owned boundary. Status meaning is never conveyed by color alone.
- Confirmation exposes a local retry path and copy-reference feedback without claiming order creation.
- The `/ops` entry opens the operations dashboard directly; the dashboard separates attention, preparation, delivery, low-stock signals, and recent activity, while orders use responsive mobile rows instead of forcing a wide table.
- The operations dashboard and orders workspace were reviewed at 1440px and 390px after the route fix; the browser console showed only expected Vite/React startup messages.
