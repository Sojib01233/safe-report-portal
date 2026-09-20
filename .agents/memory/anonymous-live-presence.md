---
name: Anonymous live presence
description: Architecture constraint for the portal's live visitor counter.
---

The live visitor count uses anonymous browser session IDs with periodic heartbeats and an in-memory server map; stale sessions expire automatically.

**Why:** The portal needs a simple privacy-preserving live indicator without collecting names or accounts, while the current deployment has one API process.

**How to apply:** Keep the client ID opaque and short-lived. If the API is later scaled across multiple instances or regions, move presence state to a shared expiring store before trusting the count.