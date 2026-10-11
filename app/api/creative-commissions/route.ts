import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function currentUser() {
  const session = await createClient();
  const { data: { user }, error } = await session.auth.getUser();
  return error ? null : user;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const admin = createAdminClient();
    const { data: castings, error } = await admin.from('creative_commission_castings')
      .select('id,commission_id,title,role_name,description,requirements,positions,application_deadline,status,creative_commissions!inner(id,title,description,creative_direction,starts_on,ends_on,status)')
      .eq('status', 'published').in('creative_commissions.status', ['recruiting', 'active'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    const { data: applications, error: appError } = await admin.from('creative_commission_applications')
      .select('id,casting_id,status,created_at').eq('creator_user_id', user.id);
    if (appError) throw appError;
    return NextResponse.json({ castings: (castings ?? []).filter((c) => !c.application_deadline || new Date(c.application_deadline).getTime() >= Date.now()), applications: applications ?? [] });
  } catch (error) {
    console.error('Creative commissions GET:', error);
    return NextResponse.json({ error: 'Unable to load commissions. Confirm the commission migration is installed.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const body = await request.json() as { castingId?: unknown; statement?: unknown; portfolioUrl?: unknown };
    const castingId = typeof body.castingId === 'string' ? body.castingId.trim() : '';
    const statement = typeof body.statement === 'string' ? body.statement.trim() : '';
    const portfolioUrl = typeof body.portfolioUrl === 'string' ? body.portfolioUrl.trim() : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(castingId)) return NextResponse.json({ error: 'Invalid casting' }, { status: 400 });
    if (statement.length > 5000 || portfolioUrl.length > 2000) return NextResponse.json({ error: 'Application details are too long' }, { status: 400 });
    if (portfolioUrl) { try { const u = new URL(portfolioUrl); if (!['https:', 'http:'].includes(u.protocol)) throw new Error(); } catch { return NextResponse.json({ error: 'Portfolio must be an HTTP(S) URL' }, { status: 400 }); } }
    const admin = createAdminClient();
    const { data: casting, error: castingError } = await admin.from('creative_commission_castings')
      .select('id,status,application_deadline,commission_id,creative_commissions!inner(status)')
      .eq('id', castingId).maybeSingle();
    if (castingError) throw castingError;
    const parent = casting?.creative_commissions as unknown as { status?: string } | null;
    if (!casting || casting.status !== 'published' || !['recruiting', 'active'].includes(parent?.status ?? '') ||
      (casting.application_deadline && new Date(casting.application_deadline).getTime() < Date.now())) {
      return NextResponse.json({ error: 'This casting is not accepting applications' }, { status: 409 });
    }
    const { data: profile, error: profileError } = await admin.from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ error: 'Complete your linked creator profile before applying' }, { status: 409 });
    const { data, error } = await admin.from('creative_commission_applications').insert({
      casting_id: castingId, creator_user_id: user.id, creator_profile_id: profile.id,
      statement: statement || null, portfolio_url: portfolioUrl || null, status: 'submitted',
    }).select('id,status').single();
    if (error?.code === '23505') return NextResponse.json({ error: 'You already applied to this casting' }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    console.error('Creative commissions POST:', error);
    return NextResponse.json({ error: 'Unable to submit application' }, { status: 500 });
  }
}
