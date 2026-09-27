# Plekxa Studio / Enterprise OS shared database — unified

Studio v1.2 uses the same Supabase project and the same canonical Enterprise OS records for creators, projects, applications, proposals and contracts.

Migration `002_unified_studio_enterprise_schema.sql` supplies the creator-facing portal projection for notifications, workspaces, completed work, experiences, earnings and payouts. Every projection row includes a foreign key back to its canonical Enterprise OS project, contract, experience, creator or finance record. Creator access is protected by Row Level Security; Enterprise OS administrators retain access through `public.is_admin()`.

## Shared modules

- Authentication: `auth.users`
- Creator directory: canonical `creator_profiles`, synchronized portal `profiles`
- Projects: `projects`
- Opportunities: `project_opportunities`
- Applications: `creator_applications`
- Proposals: `proposals`
- Contracts: `contracts`, `contract_milestones`, `contract_signatures`, `contract_events`
- Notifications: `notifications`
- Active work: `creator_project_workspaces` linked to projects and contracts
- Completed work: `creator_completed_work` linked to projects and contracts
- Experiences: `creator_experiences` linked to canonical `experiences`
- Earnings: `creator_earnings` linked to canonical experience/project/finance records
- Payouts: `creator_payouts` linked to `payout_batches`

Both Vercel projects must still have identical `NEXT_PUBLIC_SUPABASE_URL` and browser-safe Supabase public keys.
