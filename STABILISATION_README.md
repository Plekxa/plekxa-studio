# Plekxa Studio v1.3 Stabilisation

This release stops public signup and application submission from depending on fragile database triggers or browser-side RLS.

Required Vercel variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only; never prefix with NEXT_PUBLIC_)
- NEXT_PUBLIC_SITE_URL=https://studio.plekxa.com

Run `supabase/migrations/003_studio_stabilisation.sql` once in the same Supabase project used by Enterprise OS.

Signup now uses `/api/auth/signup`, creates a confirmed Supabase Auth user on the server, then attempts to sync both `profiles` and `creator_profiles`. A profile-table mismatch is logged but does not prevent account creation.

Applications now use `/api/applications`, authenticate the user from cookies, and perform the database write with the server-only service role. The API supports both `creator_user_id` and older `creator_id` schemas and returns the real database error when neither works.
