# Plazza Nutrition — Design System

## Brand personality

Premium sports nutrition with the discipline of a serious commerce operation: energetic but controlled, performance-led but credible, modern but not disposable.

## Signature rules

- The PN mark is a geometric frame, P/N monogram, and one orange energy stroke. The stroke is an accent, not a rotating loader or a repeated decorative pattern.
- Use the short square-to-letter reveal only for the French storefront lockup at larger sizes. Keep the mark static on mobile, checkout, and all operations surfaces; `prefers-reduced-motion` collapses every animation to its final state.
- `color` is the primary storefront mark. `mono` is reserved for favicon, monochrome print, embeds, and constrained partner placements. The public static mark must remain legible at favicon size; `/plazza-mark-mono.svg` is the one-colour asset.
- French lockup reads “Plazza / Nutrition”; Arabic lockup reads “بلازا / نيوتريشن” and follows the active RTL direction. Do not mix Arabic and French wordmarks inside one lockup.

## Visual direction

Use product-first compositions, editorial cropping, athletic geometry, strong type hierarchy, and a balance of deep ink surfaces with warm light surfaces. Orange is a controlled action/performance accent, not a full-page default.

## Color tokens

The implementation should centralize these semantic roles in CSS variables:

- `ink-950`: primary dark surface and storefront hero grounding.
- `ink-900`: operations shell and high-contrast panels.
- `paper-50`: primary light surface.
- `paper-100`: secondary light surface.
- `orange-500`: primary action and performance accent.
- `orange-600`: pressed/strong action.
- `lime-300`: positive stock/availability accent used with text labels.
- `blue-400`: informational delivery or system state.
- `red-500`: destructive/error state.
- `amber-400`: warning/expiry/attention state.
- `line`: borders and table rules.
- `muted`: secondary text.

## Typography

Use a bold condensed or display face for hero/product headlines and a highly readable sans for UI/body. French and English must remain legible at compact sizes. Arabic must use a deliberately selected Arabic-capable family with matching weight and x-height feel. Price and statistic figures should use tabular numerals where comparison matters.

## Spacing and grid

Use a compact 4px base with an 8px rhythm for controls and a wider editorial scale for storefront sections. Storefront content should have a generous max-width; operations should support dense tables without losing line length or scanability.

## Breakpoints

Design intentionally for 375, 390, 430, 768, 1024, 1280, 1440, and wide desktop. Mobile navigation, sheets, and action placement are first-class decisions.

## Radius, borders, and elevation

Use restrained radii: sharper editorial product surfaces, slightly softer controls and operational panels. Prefer hairline borders and layered surface contrast over excessive shadows or glass effects. Elevation should clarify priority, not decorate every card.

## Icons

Use one coherent outline icon family. Icons are supporting signals and must have accessible labels when interactive. Do not use emoji as interface icons.

## Components

The shared vocabulary includes Button, IconButton, Input, Select, Search, Badge, Status, Card, ProductCard, Price, ProductGallery, Breadcrumb, Tabs, Dialog, Drawer, Sheet, Toast, EmptyState, LoadingState, ErrorState, DataTable, Metric, Chart, Timeline, FilterBar, Sidebar, Topbar, MobileNavigation, QuantityControl, CartItem, OrderSummary, CheckoutSection, and FormSection.

## Density rules

- Storefront: premium, editorial, conversion-focused.
- Product detail: visual and persuasive.
- Checkout: calm, trustworthy, fast.
- POS: fast, dense, touch-friendly.
- Inventory: operational and traceable.
- Finance: precise and analytical.
- Admin: information-rich and structured.

## State rules

Never use color alone for status. Pair color with text, icons, or shape. Loading, empty, error, success, disabled, unavailable, unauthorized, forbidden, not-found, low-stock, out-of-stock, expired, expiring, failed-checkout, failed-delivery, pending-return, and pending-exchange states must have intentional UI.

## Motion rules

Motion is purposeful: page entrance, add-to-cart feedback, drawers, dialogs, state changes, and clear navigation transitions. Keep it short and respect `prefers-reduced-motion`.

## Responsive rules

Do not simply stack desktop layouts. Keep purchase-critical content close together on mobile. Turn dense filters/actions into sheets. Use horizontal overflow only for genuinely tabular information and preserve readable labels.

## RTL rules

Use logical CSS properties and direction-aware layout. Mirror layout flow where appropriate, but preserve the meaning of directional icons. Verify breadcrumbs, galleries, forms, tables, charts, notifications, checkout, and POS in both directions.

## Image rules

Use real merchant assets when available. Until then, use clearly marked representative visual fixtures or controlled compositions. Never present generated packaging, fake product photography, fake reviews, or invented product claims as real inventory.

Real product media is still pending. The current visual fixture system intentionally reserves the same aspect ratios, focal zones, labels, and product-detail hierarchy that real photography will use later, without fabricating packaging, brands, reviews, claims, or commercial facts.

The product fixture contract now accepts optional `media` and `mediaAlt` fields. When approved merchant media is present, it replaces only the visual content inside the existing frame and keeps the commerce layout unchanged. When it is absent, the composed visual remains explicitly labelled as a fixture and announces that approved merchant media is pending. No guessed URL, hotlink, or generated packaging is permitted.

Arabic presentation is authored copy, not a string-for-string translation: use natural Algerian commerce phrasing, preserve readable price numerals with tabular mono treatment, and keep Arabic headings compact enough that product, price, availability, and action stay together on mobile.

On mobile storefront surfaces, the hero prioritizes the first product reference and the shop action; secondary delivery/storytelling content yields to the purchase path. Finance, Reports, and POS use explicit status icons plus labels, selected-cart feedback, and a visible local-fixture/server-owned boundary.
