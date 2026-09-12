import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const adminCors = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

export async function requireAdmin(req: Request) {
  const supabase = createServiceClient()
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (error || !user) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw Object.assign(new Error('Forbidden'), { status: 403 })

  return { user, profile, supabase }
}

export async function auditLog(
  supabase: ReturnType<typeof createServiceClient>,
  adminId: string,
  adminEmail: string,
  action: string,
  opts: { targetUserId?: string; targetBookId?: string; details?: Record<string, unknown> } = {}
) {
  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    target_user_id: opts.targetUserId ?? null,
    target_book_id: opts.targetBookId ?? null,
    details: opts.details ?? {},
  })
}

export function errResponse(err: unknown, fallback = 'Internal error') {
  const e = err as { message?: string; status?: number }
  const status = e.status ?? 500
  return new Response(JSON.stringify({ error: e.message ?? fallback }), {
    status,
    headers: { ...adminCors, 'Content-Type': 'application/json' },
  })
}

export function okResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...adminCors, 'Content-Type': 'application/json' },
  })
}
