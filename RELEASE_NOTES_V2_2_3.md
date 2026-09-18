# Plekxa Creator Studio v2.2.3 — Functional hardening

- Server-side project application window/status enforcement. Closed/not-yet-open projects cannot be bypassed by direct API calls.
- Accepted/approved deliverables are immutable: no further upload authorisation or confirmation, and creator deletion remains blocked.
- Workspace UI hides upload/delete controls for accepted deliverables and explains the lock.
- Bulk selection now only includes files that the creator is actually permitted to delete.
- Removed a duplicate root route inside the creator route group that could collide with the public Creator Studio landing route.
- Retired obsolete Experience/Join Us pages by redirecting to the canonical Projects/Active Projects flows.
- Preserves v2.2.2 R2 direct upload, multipart progress, bulk file handling and existing Creator Studio workflows.
