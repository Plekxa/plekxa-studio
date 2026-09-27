# Migration 002 rerun instructions — v1.2.3

This release fixes legacy-schema compatibility failures involving `profiles.enterprise_creator_id`, `projects.name`, and `creator_applications.opportunity_id`.

1. Do not delete tables or undo previous partial runs.
2. Open `supabase/migrations/002_unified_studio_enterprise_schema.sql`.
3. Copy the entire file into a new Supabase SQL Editor query.
4. Click **Run** (not **Run selected**).
5. The migration uses `IF NOT EXISTS` and upgrade statements, so it is designed to be rerun.
