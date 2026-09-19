---
name: Ops theme routing
description: Durable UX rule for keeping the alternate Ops launcher distinct from the professional dashboard.
---

Theme 2 should use a dedicated launcher route and a separate dashboard route. The launcher is for choosing an operational module; the dashboard is for working inside the module frame. Reusing one route for both makes the alternate theme feel like it reverted or failed.

**Why:** The initial Theme 2 implementation used the dashboard route for both the launcher and dashboard, which made navigation ambiguous and caused the sidebar-based frame to reappear after selecting a module.

**How to apply:** When adding or changing Ops themes, preserve the user's selected theme across every `/ops/*` route and use an alternate no-sidebar frame for Theme 2 internal surfaces.