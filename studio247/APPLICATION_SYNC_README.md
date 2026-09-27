# Application Sync Repair

Run `supabase/migrations/004_application_read_sync.sql` once in the shared production Supabase project. It is safe to rerun.

Both Vercel applications must use the same `NEXT_PUBLIC_SUPABASE_URL`. Both server projects must have `SUPABASE_SERVICE_ROLE_KEY`.
