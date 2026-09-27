# Plekxa Studio v1.5 deployment

## Important
Run `supabase/migrations/005_profile_identity_notifications.sql` once before deploying either application. Do not rerun migration 002.

## What changed
- Profile reads and writes now go through `/api/profile`; no browser upsert and no `ON CONFLICT` failure.
- Signup stores the name in Auth metadata, `profiles`, and `creator_profiles` without relying on a unique constraint during the request.
- Existing Auth users are backfilled into both profile tables by migration 005.
- Applications save applicant name/email snapshots.
- Creator applications load across all supported creator identifiers.
- Proposals submit and load through `/api/proposals` using the authenticated user.
- In-app application/proposal decisions appear through the shared `notifications` table.

## Deploy
1. Back up the Supabase database.
2. Run migration 005 in Supabase SQL Editor.
3. Copy this folder into the Studio repository, replacing matching files only.
4. Confirm Vercel variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
5. Run `npm install` and `npm run build` locally.
6. Commit and push.
7. Test profile save, application list, proposal submission, notifications and password reset.
