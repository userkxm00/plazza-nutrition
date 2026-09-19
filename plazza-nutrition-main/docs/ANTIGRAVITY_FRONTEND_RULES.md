# Plazza Nutrition — Frontend Rules for Future Engineering

Before modifying frontend UI:

1. Read `DESIGN_DISCOVERY.md`.
2. Read `DESIGN_SYSTEM.md`.
3. Read `DESIGN_COVERAGE.md`.
4. Read `DESIGN_QA.md`.
5. Read `DESIGN_DECISIONS.md`.
6. Read this file.
7. Inspect existing components before creating new ones.
8. Reuse design tokens.
9. Preserve typography and Arabic glyph quality.
10. Preserve spacing and density rules.
11. Preserve component hierarchy.
12. Preserve responsive behavior.
13. Preserve RTL/LTR behavior.
14. Preserve motion language and reduced-motion support.
15. Preserve accessibility and non-color status communication.
16. Preserve Plazza Nutrition visual identity.
17. Never revert to generic shadcn styling.
18. Never introduce random colors or untracked one-off tokens.
19. Never create unnecessary one-off components.
20. Never modify business logic for visual convenience.
21. Never invent API behavior, product data, rates, claims, reviews, or provider capabilities.
22. Never treat visual-development fixtures as production records.
23. Never claim an order, payment, stock movement, refund, or shipment succeeded unless the authoritative API confirms it.
24. Never bypass documented role permissions or audit requirements.
25. Never redesign a completed surface without recording the reason in `DESIGN_DECISIONS.md`.

## Integration rules

- Keep service boundaries clean so fixture data can be replaced by documented API clients.
- Treat server-returned totals, stock, status, permissions, and profitability as authoritative.
- Preserve idempotency and error states for retryable money, stock, order, shipment, return, and exchange commands.
- Keep provider-specific delivery or notification details behind adapters and feature flags.
- Keep the storefront, checkout, POS, inventory, finance, staff, and settings surfaces within the same token system.
