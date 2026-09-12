import { requireAdmin, auditLog, errResponse, okResponse, adminCors } from '../_shared/admin.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: adminCors })

  try {
    const { user, supabase } = await requireAdmin(req)
    const adminEmail = user.email ?? ''
    const url = new URL(req.url)
    const action = url.searchParams.get('action') ?? (req.method === 'POST' ? (await req.json().catch(() => ({}))).action : null)

    // ── GET actions ────────────────────────────────────────────────────────────

    if (req.method === 'GET') {
      // Dashboard stats
      if (action === 'stats') {
        const [
          { count: totalUsers },
          { count: totalBooks },
          { count: pendingBooks },
          { count: generatingBooks },
          { count: failedBooks },
          { count: activeSubscriptions },
          { data: recentUsers },
          { data: recentBooks },
          { data: stuckBooks },
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('books').select('id', { count: 'exact', head: true }),
          supabase.from('books').select('id', { count: 'exact', head: true }).in('status', ['pending_payment', 'paid', 'draft']),
          supabase.from('books').select('id', { count: 'exact', head: true }).in('status', ['generating', 'preview_generating']),
          supabase.from('books').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
          supabase.from('profiles').select('id, email, display_name, role, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('books').select('id, title, status, created_at, user_id, form_data').order('created_at', { ascending: false }).limit(10),
          // Stuck: generating for more than 30 min
          supabase.from('books').select('id, title, status, updated_at, user_id').in('status', ['generating', 'preview_generating']).lt('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()),
        ])
        return okResponse({ totalUsers, totalBooks, pendingBooks, generatingBooks, failedBooks, activeSubscriptions, recentUsers, recentBooks, stuckBooks })
      }

      // User list / search
      if (action === 'users') {
        const search = url.searchParams.get('search') ?? ''
        const page = parseInt(url.searchParams.get('page') ?? '1')
        const limit = 25
        const offset = (page - 1) * limit

        let query = supabase.from('profiles').select('id, email, display_name, role, created_at', { count: 'exact' })
        if (search) query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%,id.eq.${search.match(/^[0-9a-f-]{36}$/) ? search : '00000000-0000-0000-0000-000000000000'}`)
        const { data: users, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
        return okResponse({ users, count, page, pages: Math.ceil((count ?? 0) / limit) })
      }

      // User detail
      if (action === 'user') {
        const userId = url.searchParams.get('id')
        if (!userId) return errResponse({ message: 'Missing id', status: 400 })

        const [
          { data: profile },
          { data: subscription },
          { data: books },
          { data: credits },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('books').select('id, title, status, created_at, updated_at, form_data, cover_url, stripe_session_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
          supabase.from('admin_credits').select('id, amount, reason, created_by, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
        ])

        const bonusTotal = (credits ?? []).reduce((sum: number, c: { amount: number }) => sum + c.amount, 0)
        return okResponse({ profile, subscription, books, credits, bonusTotal })
      }

      // Book list
      if (action === 'books') {
        const status = url.searchParams.get('status')
        const page = parseInt(url.searchParams.get('page') ?? '1')
        const limit = 25
        const offset = (page - 1) * limit

        let query = supabase.from('books').select('id, title, status, created_at, updated_at, user_id, form_data, cover_url', { count: 'exact' })
        if (status) query = query.eq('status', status)
        const { data: books, count } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

        // Enrich with user emails
        const userIds = [...new Set((books ?? []).map((b: { user_id: string }) => b.user_id))]
        const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds)
        const emailMap = Object.fromEntries((profiles ?? []).map((p: { id: string; email: string }) => [p.id, p.email]))
        const enriched = (books ?? []).map((b: Record<string, unknown>) => ({ ...b, user_email: emailMap[b.user_id as string] }))

        return okResponse({ books: enriched, count, page, pages: Math.ceil((count ?? 0) / limit) })
      }

      // Book detail
      if (action === 'book') {
        const bookId = url.searchParams.get('id')
        if (!bookId) return errResponse({ message: 'Missing id', status: 400 })

        const [{ data: book }, { count: pagesCount }] = await Promise.all([
          supabase.from('books').select('*').eq('id', bookId).single(),
          supabase.from('book_pages').select('id', { count: 'exact', head: true }).eq('book_id', bookId),
        ])
        if (!book) return errResponse({ message: 'Book not found', status: 404 })

        const { data: profile } = await supabase.from('profiles').select('email').eq('id', book.user_id).single()
        return okResponse({ book, pagesCount, userEmail: profile?.email })
      }

      // Audit log
      if (action === 'audit') {
        const page = parseInt(url.searchParams.get('page') ?? '1')
        const limit = 50
        const offset = (page - 1) * limit
        const { data: logs, count } = await supabase
          .from('admin_audit_log')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
        return okResponse({ logs, count, page, pages: Math.ceil((count ?? 0) / limit) })
      }

      return errResponse({ message: 'Unknown action', status: 400 })
    }

    // ── POST actions ───────────────────────────────────────────────────────────

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const postAction = body.action

      // Add/remove bonus credits
      if (postAction === 'credits') {
        const { user_id, amount, reason } = body
        if (!user_id || typeof amount !== 'number' || amount === 0) {
          return errResponse({ message: 'Invalid params', status: 400 })
        }
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', user_id).single()

        await supabase.from('admin_credits').insert({ user_id, amount, reason: reason ?? null, created_by: user.id })
        await auditLog(supabase, user.id, adminEmail, amount > 0 ? 'add_credits' : 'remove_credits', {
          targetUserId: user_id,
          details: { amount, reason, target_email: profile?.email },
        })
        return okResponse({ success: true })
      }

      // Retry / relaunch a book
      if (postAction === 'retry-book') {
        const { book_id } = body
        if (!book_id) return errResponse({ message: 'Missing book_id', status: 400 })

        const { data: book } = await supabase.from('books').select('id, status, user_id, title').eq('id', book_id).single()
        if (!book) return errResponse({ message: 'Book not found', status: 404 })

        // Only allow retry on terminal/stuck states
        const retryableStatuses = ['failed', 'generating', 'preview_generating', 'paid', 'draft', 'pending_payment']
        if (!retryableStatuses.includes(book.status)) {
          return errResponse({ message: `Cannot retry book in status: ${book.status}`, status: 400 })
        }

        await supabase.from('books').update({ status: 'paid' }).eq('id', book_id)
        await auditLog(supabase, user.id, adminEmail, 'retry_book', {
          targetUserId: book.user_id,
          targetBookId: book_id,
          details: { previous_status: book.status, title: book.title },
        })
        return okResponse({ success: true })
      }

      // Set book status manually
      if (postAction === 'set-book-status') {
        const { book_id, status } = body
        const allowed = ['failed', 'paid', 'completed', 'pending_payment', 'draft']
        if (!book_id || !allowed.includes(status)) return errResponse({ message: 'Invalid params', status: 400 })

        const { data: book } = await supabase.from('books').select('status, user_id, title').eq('id', book_id).single()
        if (!book) return errResponse({ message: 'Book not found', status: 404 })

        await supabase.from('books').update({ status }).eq('id', book_id)
        await auditLog(supabase, user.id, adminEmail, 'set_book_status', {
          targetUserId: book.user_id,
          targetBookId: book_id,
          details: { previous_status: book.status, new_status: status, title: book.title },
        })
        return okResponse({ success: true })
      }

      // Generate book for a user as admin
      if (postAction === 'admin-generate') {
        const { user_id, form_data, title } = body
        if (!user_id || !form_data) return errResponse({ message: 'Missing params', status: 400 })

        const { data: book, error: bookErr } = await supabase
          .from('books')
          .insert({ user_id, title: title ?? 'Livre admin', status: 'paid', form_data })
          .select('id')
          .single()
        if (bookErr) throw bookErr

        await auditLog(supabase, user.id, adminEmail, 'admin_generate_book', {
          targetUserId: user_id,
          targetBookId: book.id,
          details: { title: title ?? 'Livre admin' },
        })
        return okResponse({ success: true, book_id: book.id })
      }

      return errResponse({ message: 'Unknown action', status: 400 })
    }

    return errResponse({ message: 'Method not allowed', status: 405 })
  } catch (err) {
    return errResponse(err)
  }
})
