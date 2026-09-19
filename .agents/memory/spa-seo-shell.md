---
name: SPA SEO shell
description: SEO metadata and Vite behavior for the Plazza Nutrition SPA shell.
---

Route-specific canonical URLs belong in the runtime SEO head component. A root-relative canonical link in the Vite HTML shell can be interpreted as an asset path and break production builds with an EISDIR error.

**Why:** The app uses client-side routing and its production origin is not known until publish time, while Vite processes root-relative HTML asset references during build.

**How to apply:** Keep safe default title, description, Open Graph, and JSON-LD in index.html; derive canonical and route-specific metadata at runtime from the current origin and `import.meta.env.BASE_URL`.