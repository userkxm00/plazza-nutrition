# Plazza Nutrition Design Transformation Report

## 1. What was discovered

Plazza Nutrition is a unified commerce product, not a marketing site: storefront, COD checkout, customer accounts, orders, delivery, returns, exchanges, reviews, promotions, POS, inventory, purchasing, receiving, finance, profitability, staff, notifications, audit, and settings all belong to the same product world.

The product documentation establishes mobile-first behavior, French LTR and Arabic RTL, shared online/POS stock, online-first POS, server-owned totals and transitions, provider-isolated delivery and notification integrations, and explicit human approval gates around money, stock, returns, permissions, and legal/accounting behavior.

## 2. Skills used

- Replit `react-vite` guidance for the web artifact and frontend conventions.
- Replit `design` guidance for the visual frontend delegation.
- Replit `pnpm-workspace` guidance for package structure and verification.
- The supplied Plazza Nutrition product, architecture, workflow, state-machine, API, security, roadmap, and governance documentation.

External design references named in the directive were not installed into the project; the frontend instead follows the supplied source-of-truth documents and the available Replit design workflow.

## 3. Design philosophy

Build a complete visual world, not a single optimized homepage. Product discovery comes early. Storefront and operations share a brand system, but task density changes by context. Every visual fixture is explicit and replaceable; no fixture claims production authority.

## 4. Brand identity

The direction is disciplined editorial commerce: premium, athletic, confident, energetic, credible, and controlled. Deep ink surfaces ground the experience. Warm paper surfaces keep the storefront approachable. Orange is used as a performance/action signal, while lime, blue, amber, and red provide semantic operational states.

## 5. Typography

The frontend uses a strong condensed display treatment for product and section headlines, a readable UI sans for French interface copy, and a dedicated Arabic-capable family for RTL presentation. Prices and operational figures use a compact numeric treatment for scanning.

## 6. Color system

Semantic tokens cover ink, paper, orange action, positive availability, information, warning, destructive/error, line, and muted text. The implementation centralizes them in `artifacts/plazza-nutrition/src/index.css`; no scaffold placeholder red tokens remain.

## 7. Component system

The app establishes shared product cards, price hierarchy, visual fixture labels, status language, product detail composition, cart controls, checkout sections, order summaries, operations shell, navigation, metrics, tables, filters, dialogs, empty states, and mobile navigation.

## 8. Storefront

The customer-facing experience includes home, shop, categories, search, promotions, product detail, cart, checkout, confirmation, account, orders, order detail, returns, exchanges, reviews, delivery, help, contact, about, policies, terms, privacy, and not-found handling.

## 9. Ecommerce

Local interactions demonstrate catalog filtering, product selection, quantity changes, cart feedback, COD checkout validation, delivery fields, and confirmation. The checkout explicitly remains a visual fixture boundary and does not claim to create a real order.

## 10. Customer account

Account, order history, order detail, returns, exchanges, and review surfaces are represented in the same brand language, with room for future authenticated data and server-owned status.

## 11. POS

The POS surface is dense and task-oriented. It includes product search/scanning language, a visible online-first signal, a non-authoritative draft cart, totals, and receipt preparation without implying that a sale was committed.

## 12. Admin

The operations workspace uses its own navigation shell and information density while sharing the storefront’s brand tokens. The dashboard foregrounds work requiring attention, order flow, stock signals, local fixture status, and operational caveats.

## 13. Inventory

Inventory surfaces distinguish available, reserved, low-stock, out-of-stock, expiring, expired, damaged, adjusted, and movement-history concepts. Stock adjustment and receiving actions are presented as local visual actions until authoritative APIs exist.

## 14. Purchasing

Purchasing and receiving surfaces cover suppliers, purchase orders, expected/received quantities, discrepancy, batch, and expiry concepts without inventing vendor data or operational policy.

## 15. Delivery

Customer and operations delivery surfaces include home/stop-desk language, destination concepts, shipment status, provider/manual fallback boundaries, tracking placeholders, and failed-delivery states without claiming undocumented courier behavior.

## 16. Finance

Finance, expenses, profitability, and reports use a precise table/metric language covering revenue, discounts, customer shipping, COGS, courier cost, refunds/returns, expenses, cash, channel, and period concepts.

## 17. Staff

Staff, roles, permissions, notifications, audit, and settings surfaces are represented with the six documented initial roles and visible local-fixture boundaries. Authorization remains a future server responsibility.

## 18. Responsive work

Desktop, compact desktop, and mobile layouts were reviewed. Mobile uses intentional navigation, compact filtering, fixed bottom navigation, touch-friendly controls, and product-first detail flow rather than simply collapsing the desktop grid.

## 19. RTL/LTR work

The app exposes a French/Arabic direction switch and applies direction-aware layout rules, navigation, forms, tables, galleries, checkout, notifications, and operations shell behavior. Arabic remains a first-class presentation path.

## 20. Accessibility

The frontend uses semantic buttons and links, visible focus treatment, labels, accessible icon actions, status text paired with color, dialog semantics, reduced-motion handling, and stable descriptive `data-testid` attributes for interactive and meaningful elements.

## 21. Motion

Motion is limited to purposeful rise, shimmer, cart feedback, navigation, drawers, dialogs, and state changes. Reduced-motion preferences are respected.

## 22. Performance

The first build uses the existing React/Vite scaffold, CSS-driven visuals, a small typed fixture module, and no unnecessary external imagery or animation engine. It avoids pretending to render backend data that does not exist yet.

## 23. State coverage

Loading, empty, error, success, unavailable, not-found, forbidden/unauthorized boundaries, low stock, failed delivery, pending return/exchange, and offline POS draft concepts are documented and represented where applicable. The coverage matrix remains the tracking source for future state completion.

## 24. QA results

- Root workspace typecheck: passed.
- Plazza Nutrition artifact typecheck: passed.
- Managed web workflow: running.
- Home desktop preview: rendered cleanly.
- Shop mobile preview: rendered cleanly.
- Product detail mobile preview: rendered cleanly.
- Operations dashboard desktop preview: rendered cleanly.
- Browser console: no application errors observed in the reviewed surfaces.

## 25. Known limitations

The frontend is not production-ready. It has no real authentication, authoritative API, database persistence, merchant catalog, real product assets, real pricing, legal content, delivery rates, courier credentials, payment integrations, or server-enforced permissions. These are intentional boundaries for the design-first phase.

## 26. Mock boundaries

Fixtures live in `artifacts/plazza-nutrition/src/lib/mock-service.ts`. The app labels fixture data and does not claim that checkout, POS, stock, returns, refunds, dispatch, or notification actions were persisted or executed.

## 27. Antigravity handoff

Future engineering work must read `DESIGN_DISCOVERY.md`, `DESIGN_SYSTEM.md`, `DESIGN_COVERAGE.md`, `DESIGN_QA.md`, `DESIGN_DECISIONS.md`, and `ANTIGRAVITY_FRONTEND_RULES.md` before changing the frontend. Replace fixture service calls with documented API clients while preserving visual tokens, route coverage, density rules, RTL/LTR, accessibility, and state language.

## 28. Remaining work

The next phase is authoritative backend integration: catalog and product contracts, authentication/account boundaries, server-owned quote and checkout, order state transitions, inventory movements, POS/cash, delivery adapter, returns/exchanges, finance, staff authorization, audit, notifications, and production merchant configuration.
