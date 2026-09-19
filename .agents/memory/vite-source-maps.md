---
name: Vite source-map compatibility
description: A Vite-specific source-map issue caused by a leftover Next.js client directive.
---

Vite components should not retain Next.js-only `'use client'` directives.

**Why:** In this project, the directive caused Rollup to emit a source-map resolution warning for the Tooltip component even though the production build otherwise succeeded.

**How to apply:** When importing or adapting UI components into this Vite app, remove framework directives that are not part of Vite’s runtime model before investigating source-map warnings or adding build plugins.