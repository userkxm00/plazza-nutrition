---
name: Operations surface routing
description: Non-obvious routing relationship between Plazza's parallel operations UI surfaces.
---

The application contains both a professional operations surface and a separate coverage surface with overlapping routes. Accessibility changes for a user-visible operations route must first be applied to the component mounted by the current router; coverage components may be useful for broader audit coverage but are not necessarily the rendered path.

**Why:** Parallel surfaces can expose the same URL concepts while only one is mounted, making a seemingly successful change invisible in the preview.

**How to apply:** Trace the route from the app router to the rendered surface before editing, then verify the exact route in preview.

For operations modules, a distinct URL or title is not enough: inventory, movement history, purchasing, receiving, expenses, profitability, and reports must each expose the fields, table columns, status model, and primary action of their own business object.

**Why:** Reusing a broad fixture component made different Ops routes look complete while showing the wrong operational data, especially for movements and finance.

**How to apply:** When adding an Ops route, define its business-specific read model and action surface first; share only primitives such as headers, metrics, tables, and preview boundaries.