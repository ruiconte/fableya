export function required(name, env = process.env) {
  const value = env[name];
  if (!value) throw new Error(`Configuration manquante : ${name}`);
  return value;
}

// Errors never include upstream response bodies, which can contain private data.
export async function jsonRequest(url, options = {}, fetcher = fetch) {
  const response = await fetcher(url, { ...options, signal: options.signal ?? AbortSignal.timeout(30_000) });
  if (!response.ok) {
    const error = new Error(`Service distant HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function database(env = process.env, fetcher = fetch, publicOnly = false) {
  const base = required('SUPABASE_URL', { ...env, SUPABASE_URL: env.SUPABASE_URL || env.VITE_SUPABASE_URL }).replace(/\/$/, '');
  const key = publicOnly ? required('VITE_SUPABASE_ANON_KEY', env) : required('SUPABASE_SERVICE_ROLE_KEY', env);
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const rest = (path, options = {}) => jsonRequest(`${base}/rest/v1/${path}`, { ...options, headers: { ...headers, ...options.headers } }, fetcher);
  return {
    get: (path) => rest(path),
    insert: (table, value, prefer = 'return=representation') => rest(table, { method: 'POST', headers: { Prefer: prefer }, body: JSON.stringify(value) }),
    patch: (path, value) => rest(path, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(value) }),
    rpc: (name, value) => rest(`rpc/${name}`, { method: 'POST', body: JSON.stringify(value) }),
    user: (token) => jsonRequest(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } }, fetcher),
  };
}

export function uuid(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)) throw new Error('Identifiant invalide');
  return value;
}

export async function requireAdmin(req, db) {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) throw Object.assign(new Error('Authentification requise'), { status: 401 });
  let user;
  try { user = await db.user(header.slice(7)); }
  catch { throw Object.assign(new Error('Session expirée'), { status: 401 }); }
  const [profile] = await db.get(`profiles?id=eq.${uuid(user.id)}&select=role`);
  if (profile?.role !== 'admin') throw Object.assign(new Error('Accès administrateur requis'), { status: 403 });
  return user;
}
