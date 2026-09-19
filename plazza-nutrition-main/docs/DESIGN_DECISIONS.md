# Plazza Nutrition — Design Decisions

## D-001 — Build the frontend as a replaceable visual system

The first build uses explicit local fixtures and service interfaces. UI components do not call invented production endpoints or hide fake persistence.

**Why:** The project directive assigns frontend visual foundation to this phase and core engineering to a later continuation.

## D-002 — Product-first storefront

The storefront exposes catalog concepts, products, prices, variants, availability, and purchase actions before extended brand storytelling.

**Why:** Plazza Nutrition is ecommerce; a beautiful marketing surface must not hide the store.

## D-003 — Shared brand, adaptive density

Storefront and operations share tokens, typography, state language, and iconography, but not identical layout density.

**Why:** Customers are browsing and deciding; staff are scanning, reconciling, and acting.

## D-004 — COD and geography are explicit

Checkout presents phone, wilaya, commune where required, home/stop-desk delivery, and COD without inventing rates or provider capabilities.

**Why:** These are documented business concepts; exact merchant rates and courier behavior remain validated inputs.

## D-005 — Arabic is first-class

Direction, layout flow, typography, forms, tables, galleries, charts, and notifications support RTL rather than merely swapping translated strings.

**Why:** Arabic and French are launch requirements and a major trust signal for the target market.

## D-006 — Operational truth stays server-owned

The frontend may preview states, but totals, stock, discounts, permissions, transitions, profit, and provider facts are not authoritative in the browser.

**Why:** The API contract and governance documents explicitly prohibit trusting client-owned business facts.

## D-007 — PN signature is a restrained system

The PN mark uses a geometric frame, a fixed P/N monogram, and one orange energy stroke. Animation is a short reveal for large storefront entry moments only; mobile, checkout, operations, favicon, and reduced-motion contexts use the static form. Arabic and French lockups are authored variants, not automatic letter swaps.

**Why:** A memorable mark should survive dense operational contexts and small sizes without becoming a loading indicator or a decorative effect.

## D-008 — Fixture media remains honest

Product visuals are representative, explicitly labelled fixtures. Their aspect ratios and hierarchy are production-ready so approved photography can replace the visual layer later without changing commerce layout. No packaging, claims, reviews, brands, rates, or product facts are invented.

**Why:** The storefront needs a credible visual world now, while merchant media and authoritative catalog data remain pending.

## D-009 — Analytical screens show their boundary

Finance and reports can derive readable counts and comparisons from the existing local orders, products, stock, and operations fixtures. They must not infer margin, conversion, settlement, forecast, or server-owned status.

**Why:** Information-rich does not mean authoritative; visible boundaries protect operator trust.

## D-010 — Merchant media replaces content, not layout

Products may receive optional approved media and accessible alt text through the existing product visual contract. The frame, labels, aspect ratios, and detail hierarchy do not change when media arrives. Until then, the fallback is an unmistakable visual fixture.

## D-011 — Arabic copy is editorial input

Arabic storefront and operations copy is reviewed as authored RTL content rather than mechanically translated UI. Natural phrasing, Arabic-capable hierarchy, and isolated LTR numeric treatment are required alongside the existing French copy.

## D-012 — Operational scan speed is explicit

Finance and Reports prioritize derived fixture values, readable status/action signals, and a visible server-owned boundary. POS prioritizes touch-sized product rows, immediate selected-cart feedback, and local draft controls without implying persistence or a committed sale.
