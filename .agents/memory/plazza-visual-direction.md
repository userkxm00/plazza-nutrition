---
name: Plazza visual direction
description: Durable rules for Plazza Nutrition’s visual identity and motion language.
---

Plazza Nutrition uses a premium athletic editorial identity built around deep navy, warm off-white, restrained orange, and utility lime. Storefront surfaces can use expressive product-led compositions; operations and POS surfaces should remain denser and faster while sharing the same tokens.

The PN mark has static and animated variants. The animated sequence is a short geometric reveal followed by one orange energy stroke and a settled mark; it must not loop continuously. Use the static mark on mobile and checkout, and always respect `prefers-reduced-motion`.

**Why:** The brand needs memorability without looking like a game, crypto project, or generic AI interface; motion should reinforce confidence rather than compete with shopping and checkout tasks.

**How to apply:** Preserve the navy/off-white/orange relationship, keep products and prices visible early, and treat any new motion as purposeful feedback or transition rather than decoration.

Shared overlays across storefront and operations must own the same accessibility behavior: initial focus, Escape close, focus containment, background scroll lock, and focus restoration.

**Why:** The product uses local preview dialogs in both customer and staff journeys; implementing these behaviors in only one surface creates inconsistent keyboard and screen-reader experiences.

**How to apply:** When adding or replacing a dialog, sheet, selector, or confirmation, reuse the same interaction contract before adding domain-specific content.

Local fixture actions must still use controlled fields and show the merchant-owned/server-owned boundary; a local preview should never discard typed values or imply persistence.

**Why:** The product is being reviewed as a complete workflow before backend contracts are connected, so interaction quality must be testable without inventing authoritative data.

**How to apply:** Keep each operational module’s field contract visible, make local forms stateful, and label values that require merchant or API confirmation.

Product and promotion facts that are not merchant-approved must be shown as pending or omitted; never replace missing compare-at prices, discounts, ratings, delivery promises, or claims with derived fixture values.

**Why:** A polished storefront can make invented commercial facts look authoritative, which would undermine the review and create avoidable launch risk.

**How to apply:** Keep visual references useful for layout review, but separate them from authoritative catalog, promotion, fulfillment, and nutrition data until the merchant/API contract exists.