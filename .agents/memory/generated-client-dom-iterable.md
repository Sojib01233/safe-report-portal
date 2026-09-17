---
name: Generated client DOM iterable support
description: TypeScript settings needed by the generated API client when it normalizes Headers.
---

The API client generation currently emits `Headers.entries()`, so the client library's TypeScript `lib` settings must include `dom.iterable` alongside `dom`.

**Why:** Without the iterable DOM declarations, codegen succeeds but the library typecheck fails on the generated client.

**How to apply:** Keep `dom.iterable` enabled whenever regenerating the API client unless the generator output no longer uses iterable Headers APIs.