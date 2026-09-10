---
name: Development schema push conflict
description: Drizzle push can stop on unmanaged existing tables in this workspace.
---

When adding a new table, inspect existing development tables before using `drizzle-kit push --force`. This workspace already contains an unrelated `public.reports` table, and an unfiltered push asks about the naming conflict; blindly forcing the diff could risk unrelated data.

**Why:** The push command is non-interactive in agent shells, so the prompt fails instead of safely resolving the conflict.

**How to apply:** Prefer a table-specific push when supported. If the tool cannot target only the new table, preserve existing tables and apply a reviewed, explicit development DDL change before testing the Drizzle-backed route.